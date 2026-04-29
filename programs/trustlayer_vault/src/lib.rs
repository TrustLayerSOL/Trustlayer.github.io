use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    hash::hashv,
    program::invoke,
    system_instruction,
};

declare_id!("TLVault1111111111111111111111111111111111111");

const BPS_DENOMINATOR: u16 = 10_000;
const MIN_LOCK_SECONDS: i64 = 86_400;
const MAX_METADATA_HASH_BYTES: usize = 64;
const MAX_REASON_BYTES: usize = 64;

#[program]
pub mod trustlayer_vault {
    use super::*;

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>, args: InitializeProtocolArgs) -> Result<()> {
        require!(args.fee_change_timelock_seconds >= MIN_LOCK_SECONDS, TrustLayerError::TimelockTooShort);

        let config = &mut ctx.accounts.protocol_config;
        config.admin = args.admin;
        config.emergency_pauser = args.emergency_pauser;
        config.payout_reviewer = args.payout_reviewer;
        config.protocol_fee_destination = args.protocol_fee_destination;
        config.fee_change_timelock_seconds = args.fee_change_timelock_seconds;
        config.paused = false;
        config.bump = ctx.bumps.protocol_config;

        Ok(())
    }

    pub fn initialize_project(ctx: Context<InitializeProject>, args: InitializeProjectArgs) -> Result<()> {
        require!(!ctx.accounts.protocol_config.paused, TrustLayerError::ProtocolPaused);
        require!(args.metadata_hash.len() <= MAX_METADATA_HASH_BYTES, TrustLayerError::MetadataHashTooLong);
        validate_fee_split(&args.fee_split)?;

        let project = &mut ctx.accounts.project_config;
        project.protocol_config = ctx.accounts.protocol_config.key();
        project.project_authority = ctx.accounts.project_authority.key();
        project.project_treasury = args.project_treasury;
        project.token_mint = args.token_mint;
        project.project_id = args.project_id;
        project.fee_split = args.fee_split;
        project.pending_fee_split = None;
        project.metadata_hash = args.metadata_hash;
        project.created_at = Clock::get()?.unix_timestamp;
        project.paused = false;
        project.bump = ctx.bumps.project_config;
        project.vault_bump = ctx.bumps.vault;

        let vault = &mut ctx.accounts.vault_accounting;
        vault.project_config = project.key();
        vault.reward_pool_balance = 0;
        vault.protection_reserve_balance = 0;
        vault.project_treasury_balance = 0;
        vault.platform_fee_balance = 0;
        vault.total_deposited = 0;
        vault.total_distributed = 0;
        vault.bump = ctx.bumps.vault_accounting;

        emit!(ProjectInitialized {
            project_config: project.key(),
            token_mint: project.token_mint,
            project_authority: project.project_authority,
            vault: ctx.accounts.vault.key(),
            holder_rewards_bps: project.fee_split.holder_rewards_bps,
            protection_reserve_bps: project.fee_split.protection_reserve_bps,
            project_treasury_bps: project.fee_split.project_treasury_bps,
            platform_fee_bps: project.fee_split.platform_fee_bps,
        });

        Ok(())
    }

    pub fn deposit_sol_revenue(ctx: Context<DepositSolRevenue>, amount_lamports: u64) -> Result<()> {
        require!(amount_lamports > 0, TrustLayerError::InvalidAmount);
        require!(!ctx.accounts.protocol_config.paused, TrustLayerError::ProtocolPaused);
        require!(!ctx.accounts.project_config.paused, TrustLayerError::ProjectPaused);

        invoke(
            &system_instruction::transfer(
                &ctx.accounts.depositor.key(),
                &ctx.accounts.vault.key(),
                amount_lamports,
            ),
            &[
                ctx.accounts.depositor.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let split = split_amount(amount_lamports, ctx.accounts.project_config.fee_split)?;
        let vault_accounting = &mut ctx.accounts.vault_accounting;
        vault_accounting.reward_pool_balance = checked_add(vault_accounting.reward_pool_balance, split.holder_rewards)?;
        vault_accounting.protection_reserve_balance =
            checked_add(vault_accounting.protection_reserve_balance, split.protection_reserve)?;
        vault_accounting.project_treasury_balance =
            checked_add(vault_accounting.project_treasury_balance, split.project_treasury)?;
        vault_accounting.platform_fee_balance = checked_add(vault_accounting.platform_fee_balance, split.platform_fee)?;
        vault_accounting.total_deposited = checked_add(vault_accounting.total_deposited, amount_lamports)?;

        emit!(RevenueDeposited {
            project_config: ctx.accounts.project_config.key(),
            depositor: ctx.accounts.depositor.key(),
            amount_lamports,
            holder_rewards: split.holder_rewards,
            protection_reserve: split.protection_reserve,
            project_treasury: split.project_treasury,
            platform_fee: split.platform_fee,
        });

        Ok(())
    }

    pub fn propose_fee_split_change(ctx: Context<ProjectAuthorityAction>, new_split: FeeSplit) -> Result<()> {
        require!(!ctx.accounts.protocol_config.paused, TrustLayerError::ProtocolPaused);
        validate_fee_split(&new_split)?;

        let now = Clock::get()?.unix_timestamp;
        let project = &mut ctx.accounts.project_config;
        let activates_at = checked_add_i64(now, ctx.accounts.protocol_config.fee_change_timelock_seconds)?;
        let old_split = project.fee_split;

        project.pending_fee_split = Some(PendingFeeSplit {
            split: new_split,
            proposed_at: now,
            activates_at,
        });

        emit!(FeeSplitChangeProposed {
            project_config: project.key(),
            old_holder_rewards_bps: old_split.holder_rewards_bps,
            old_protection_reserve_bps: old_split.protection_reserve_bps,
            old_project_treasury_bps: old_split.project_treasury_bps,
            old_platform_fee_bps: old_split.platform_fee_bps,
            new_holder_rewards_bps: new_split.holder_rewards_bps,
            new_protection_reserve_bps: new_split.protection_reserve_bps,
            new_project_treasury_bps: new_split.project_treasury_bps,
            new_platform_fee_bps: new_split.platform_fee_bps,
            activates_at,
        });

        Ok(())
    }

    pub fn execute_fee_split_change(ctx: Context<ProjectAuthorityAction>) -> Result<()> {
        require!(!ctx.accounts.protocol_config.paused, TrustLayerError::ProtocolPaused);

        let now = Clock::get()?.unix_timestamp;
        let project = &mut ctx.accounts.project_config;
        let pending = project.pending_fee_split.ok_or(TrustLayerError::NoPendingFeeSplit)?;
        require!(now >= pending.activates_at, TrustLayerError::TimelockActive);

        let old_split = project.fee_split;
        project.fee_split = pending.split;
        project.pending_fee_split = None;

        emit!(FeeSplitChanged {
            project_config: project.key(),
            old_holder_rewards_bps: old_split.holder_rewards_bps,
            old_protection_reserve_bps: old_split.protection_reserve_bps,
            old_project_treasury_bps: old_split.project_treasury_bps,
            old_platform_fee_bps: old_split.platform_fee_bps,
            new_holder_rewards_bps: project.fee_split.holder_rewards_bps,
            new_protection_reserve_bps: project.fee_split.protection_reserve_bps,
            new_project_treasury_bps: project.fee_split.project_treasury_bps,
            new_platform_fee_bps: project.fee_split.platform_fee_bps,
        });

        Ok(())
    }

    pub fn create_payout_round(ctx: Context<CreatePayoutRound>, args: CreatePayoutRoundArgs) -> Result<()> {
        require!(!ctx.accounts.protocol_config.paused, TrustLayerError::ProtocolPaused);
        require!(!ctx.accounts.project_config.paused, TrustLayerError::ProjectPaused);
        require!(args.total_amount > 0, TrustLayerError::InvalidAmount);
        require!(
            ctx.accounts.vault_accounting.reward_pool_balance >= args.total_amount,
            TrustLayerError::InsufficientRewardPool
        );

        let now = Clock::get()?.unix_timestamp;
        require!(args.claim_start >= now, TrustLayerError::InvalidClaimWindow);
        require!(args.claim_end > args.claim_start, TrustLayerError::InvalidClaimWindow);

        let vault_accounting = &mut ctx.accounts.vault_accounting;
        vault_accounting.reward_pool_balance = checked_sub(vault_accounting.reward_pool_balance, args.total_amount)?;

        let round = &mut ctx.accounts.payout_round;
        round.project_config = ctx.accounts.project_config.key();
        round.round_id = args.round_id;
        round.snapshot_slot = args.snapshot_slot;
        round.total_amount = args.total_amount;
        round.claimed_amount = 0;
        round.manifest_hash = args.manifest_hash;
        round.merkle_root = args.merkle_root;
        round.formula_version = args.formula_version;
        round.claim_start = args.claim_start;
        round.claim_end = args.claim_end;
        round.cancelled = false;
        round.bump = ctx.bumps.payout_round;

        emit!(PayoutRoundCreated {
            project_config: ctx.accounts.project_config.key(),
            payout_round: round.key(),
            round_id: round.round_id,
            snapshot_slot: round.snapshot_slot,
            total_amount: round.total_amount,
            manifest_hash: round.manifest_hash,
            merkle_root: round.merkle_root,
            formula_version: round.formula_version,
            claim_start: round.claim_start,
            claim_end: round.claim_end,
        });

        Ok(())
    }

    pub fn claim_payout(ctx: Context<ClaimPayout>, amount: u64, proof: Vec<[u8; 32]>) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let round = &mut ctx.accounts.payout_round;
        require!(!round.cancelled, TrustLayerError::PayoutRoundCancelled);
        require!(now >= round.claim_start && now <= round.claim_end, TrustLayerError::ClaimWindowClosed);
        require!(amount > 0, TrustLayerError::InvalidAmount);

        let leaf = payout_leaf(ctx.accounts.claimant.key(), amount);
        require!(verify_merkle_proof(leaf, proof, round.merkle_root), TrustLayerError::InvalidMerkleProof);

        let project_key = ctx.accounts.project_config.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault",
            project_key.as_ref(),
            &[ctx.accounts.project_config.vault_bump],
        ]];

        let ix = system_instruction::transfer(&ctx.accounts.vault.key(), &ctx.accounts.claimant.key(), amount);
        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.claimant.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;

        round.claimed_amount = checked_add(round.claimed_amount, amount)?;
        ctx.accounts.vault_accounting.total_distributed = checked_add(ctx.accounts.vault_accounting.total_distributed, amount)?;

        let receipt = &mut ctx.accounts.claim_receipt;
        receipt.payout_round = round.key();
        receipt.wallet = ctx.accounts.claimant.key();
        receipt.amount = amount;
        receipt.claimed_at = now;
        receipt.bump = ctx.bumps.claim_receipt;

        emit!(PayoutClaimed {
            project_config: ctx.accounts.project_config.key(),
            payout_round: round.key(),
            wallet: ctx.accounts.claimant.key(),
            amount,
        });

        Ok(())
    }

    pub fn pause_project(ctx: Context<PauseProject>, reason_code: String) -> Result<()> {
        require!(reason_code.len() <= MAX_REASON_BYTES, TrustLayerError::ReasonTooLong);
        ctx.accounts.project_config.paused = true;

        emit!(ProjectPaused {
            project_config: ctx.accounts.project_config.key(),
            reason_code,
        });

        Ok(())
    }

    pub fn unpause_project(ctx: Context<PauseProject>) -> Result<()> {
        ctx.accounts.project_config.paused = false;

        emit!(ProjectUnpaused {
            project_config: ctx.accounts.project_config.key(),
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = payer,
        space = ProtocolConfig::SPACE,
        seeds = [b"protocol"],
        bump
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(args: InitializeProjectArgs)]
pub struct InitializeProject<'info> {
    #[account(seeds = [b"protocol"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(
        init,
        payer = payer,
        space = ProjectConfig::space(args.metadata_hash.len()),
        seeds = [b"project", args.project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub project_config: Account<'info, ProjectConfig>,
    #[account(
        init,
        payer = payer,
        space = VaultAccounting::SPACE,
        seeds = [b"vault-accounting", project_config.key().as_ref()],
        bump
    )]
    pub vault_accounting: Account<'info, VaultAccounting>,
    #[account(
        mut,
        seeds = [b"vault", project_config.key().as_ref()],
        bump
    )]
    /// CHECK: PDA receives SOL and signs payouts.
    pub vault: UncheckedAccount<'info>,
    pub project_authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSolRevenue<'info> {
    #[account(seeds = [b"protocol"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut, has_one = protocol_config)]
    pub project_config: Account<'info, ProjectConfig>,
    #[account(mut, seeds = [b"vault-accounting", project_config.key().as_ref()], bump = vault_accounting.bump)]
    pub vault_accounting: Account<'info, VaultAccounting>,
    #[account(mut, seeds = [b"vault", project_config.key().as_ref()], bump = project_config.vault_bump)]
    /// CHECK: PDA receives SOL and signs payouts.
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProjectAuthorityAction<'info> {
    #[account(seeds = [b"protocol"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut, has_one = project_authority, has_one = protocol_config)]
    pub project_config: Account<'info, ProjectConfig>,
    pub project_authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(args: CreatePayoutRoundArgs)]
pub struct CreatePayoutRound<'info> {
    #[account(seeds = [b"protocol"], bump = protocol_config.bump, has_one = payout_reviewer)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(has_one = protocol_config)]
    pub project_config: Account<'info, ProjectConfig>,
    #[account(mut, seeds = [b"vault-accounting", project_config.key().as_ref()], bump = vault_accounting.bump)]
    pub vault_accounting: Account<'info, VaultAccounting>,
    #[account(
        init,
        payer = payer,
        space = PayoutRound::space(args.formula_version.len()),
        seeds = [b"payout-round", project_config.key().as_ref(), args.round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub payout_round: Account<'info, PayoutRound>,
    pub payout_reviewer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(has_one = protocol_config)]
    pub project_config: Account<'info, ProjectConfig>,
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut, has_one = project_config)]
    pub payout_round: Account<'info, PayoutRound>,
    #[account(mut, seeds = [b"vault-accounting", project_config.key().as_ref()], bump = vault_accounting.bump)]
    pub vault_accounting: Account<'info, VaultAccounting>,
    #[account(mut, seeds = [b"vault", project_config.key().as_ref()], bump = project_config.vault_bump)]
    /// CHECK: PDA signs SOL payout.
    pub vault: UncheckedAccount<'info>,
    #[account(
        init,
        payer = claimant,
        space = ClaimReceipt::SPACE,
        seeds = [b"claim-receipt", payout_round.key().as_ref(), claimant.key().as_ref()],
        bump
    )]
    pub claim_receipt: Account<'info, ClaimReceipt>,
    #[account(mut)]
    pub claimant: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PauseProject<'info> {
    #[account(seeds = [b"protocol"], bump = protocol_config.bump, has_one = emergency_pauser)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut, has_one = protocol_config)]
    pub project_config: Account<'info, ProjectConfig>,
    pub emergency_pauser: Signer<'info>,
}

#[account]
pub struct ProtocolConfig {
    pub admin: Pubkey,
    pub emergency_pauser: Pubkey,
    pub payout_reviewer: Pubkey,
    pub protocol_fee_destination: Pubkey,
    pub fee_change_timelock_seconds: i64,
    pub paused: bool,
    pub bump: u8,
}

impl ProtocolConfig {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 32 + 8 + 1 + 1;
}

#[account]
pub struct ProjectConfig {
    pub protocol_config: Pubkey,
    pub project_authority: Pubkey,
    pub project_treasury: Pubkey,
    pub token_mint: Pubkey,
    pub project_id: u64,
    pub fee_split: FeeSplit,
    pub pending_fee_split: Option<PendingFeeSplit>,
    pub metadata_hash: Vec<u8>,
    pub created_at: i64,
    pub paused: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

impl ProjectConfig {
    pub fn space(metadata_hash_len: usize) -> usize {
        8 + 32 + 32 + 32 + 32 + 8 + FeeSplit::SPACE + 1 + PendingFeeSplit::SPACE + 4 + metadata_hash_len + 8 + 1 + 1 + 1
    }
}

#[account]
pub struct VaultAccounting {
    pub project_config: Pubkey,
    pub reward_pool_balance: u64,
    pub protection_reserve_balance: u64,
    pub project_treasury_balance: u64,
    pub platform_fee_balance: u64,
    pub total_deposited: u64,
    pub total_distributed: u64,
    pub bump: u8,
}

impl VaultAccounting {
    pub const SPACE: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct PayoutRound {
    pub project_config: Pubkey,
    pub round_id: u64,
    pub snapshot_slot: u64,
    pub total_amount: u64,
    pub claimed_amount: u64,
    pub manifest_hash: [u8; 32],
    pub merkle_root: [u8; 32],
    pub formula_version: String,
    pub claim_start: i64,
    pub claim_end: i64,
    pub cancelled: bool,
    pub bump: u8,
}

impl PayoutRound {
    pub fn space(formula_version_len: usize) -> usize {
        8 + 32 + 8 + 8 + 8 + 8 + 32 + 32 + 4 + formula_version_len + 8 + 8 + 1 + 1
    }
}

#[account]
pub struct ClaimReceipt {
    pub payout_round: Pubkey,
    pub wallet: Pubkey,
    pub amount: u64,
    pub claimed_at: i64,
    pub bump: u8,
}

impl ClaimReceipt {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct FeeSplit {
    pub holder_rewards_bps: u16,
    pub protection_reserve_bps: u16,
    pub project_treasury_bps: u16,
    pub platform_fee_bps: u16,
}

impl FeeSplit {
    pub const SPACE: usize = 2 + 2 + 2 + 2;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct PendingFeeSplit {
    pub split: FeeSplit,
    pub proposed_at: i64,
    pub activates_at: i64,
}

impl PendingFeeSplit {
    pub const SPACE: usize = FeeSplit::SPACE + 8 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeProtocolArgs {
    pub admin: Pubkey,
    pub emergency_pauser: Pubkey,
    pub payout_reviewer: Pubkey,
    pub protocol_fee_destination: Pubkey,
    pub fee_change_timelock_seconds: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeProjectArgs {
    pub project_id: u64,
    pub token_mint: Pubkey,
    pub project_treasury: Pubkey,
    pub fee_split: FeeSplit,
    pub metadata_hash: Vec<u8>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreatePayoutRoundArgs {
    pub round_id: u64,
    pub snapshot_slot: u64,
    pub total_amount: u64,
    pub manifest_hash: [u8; 32],
    pub merkle_root: [u8; 32],
    pub formula_version: String,
    pub claim_start: i64,
    pub claim_end: i64,
}

#[derive(Clone, Copy)]
struct SplitAmounts {
    holder_rewards: u64,
    protection_reserve: u64,
    project_treasury: u64,
    platform_fee: u64,
}

#[event]
pub struct ProjectInitialized {
    pub project_config: Pubkey,
    pub token_mint: Pubkey,
    pub project_authority: Pubkey,
    pub vault: Pubkey,
    pub holder_rewards_bps: u16,
    pub protection_reserve_bps: u16,
    pub project_treasury_bps: u16,
    pub platform_fee_bps: u16,
}

#[event]
pub struct RevenueDeposited {
    pub project_config: Pubkey,
    pub depositor: Pubkey,
    pub amount_lamports: u64,
    pub holder_rewards: u64,
    pub protection_reserve: u64,
    pub project_treasury: u64,
    pub platform_fee: u64,
}

#[event]
pub struct FeeSplitChangeProposed {
    pub project_config: Pubkey,
    pub old_holder_rewards_bps: u16,
    pub old_protection_reserve_bps: u16,
    pub old_project_treasury_bps: u16,
    pub old_platform_fee_bps: u16,
    pub new_holder_rewards_bps: u16,
    pub new_protection_reserve_bps: u16,
    pub new_project_treasury_bps: u16,
    pub new_platform_fee_bps: u16,
    pub activates_at: i64,
}

#[event]
pub struct FeeSplitChanged {
    pub project_config: Pubkey,
    pub old_holder_rewards_bps: u16,
    pub old_protection_reserve_bps: u16,
    pub old_project_treasury_bps: u16,
    pub old_platform_fee_bps: u16,
    pub new_holder_rewards_bps: u16,
    pub new_protection_reserve_bps: u16,
    pub new_project_treasury_bps: u16,
    pub new_platform_fee_bps: u16,
}

#[event]
pub struct PayoutRoundCreated {
    pub project_config: Pubkey,
    pub payout_round: Pubkey,
    pub round_id: u64,
    pub snapshot_slot: u64,
    pub total_amount: u64,
    pub manifest_hash: [u8; 32],
    pub merkle_root: [u8; 32],
    pub formula_version: String,
    pub claim_start: i64,
    pub claim_end: i64,
}

#[event]
pub struct PayoutClaimed {
    pub project_config: Pubkey,
    pub payout_round: Pubkey,
    pub wallet: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ProjectPaused {
    pub project_config: Pubkey,
    pub reason_code: String,
}

#[event]
pub struct ProjectUnpaused {
    pub project_config: Pubkey,
}

#[error_code]
pub enum TrustLayerError {
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Project is paused")]
    ProjectPaused,
    #[msg("Fee split must equal 10000 bps")]
    InvalidFeeSplit,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Fee change timelock is too short")]
    TimelockTooShort,
    #[msg("Metadata hash is too long")]
    MetadataHashTooLong,
    #[msg("Pause reason is too long")]
    ReasonTooLong,
    #[msg("No pending fee split")]
    NoPendingFeeSplit,
    #[msg("Fee change timelock is still active")]
    TimelockActive,
    #[msg("Insufficient reward pool balance")]
    InsufficientRewardPool,
    #[msg("Invalid claim window")]
    InvalidClaimWindow,
    #[msg("Payout round was cancelled")]
    PayoutRoundCancelled,
    #[msg("Claim window is closed")]
    ClaimWindowClosed,
    #[msg("Invalid Merkle proof")]
    InvalidMerkleProof,
}

fn validate_fee_split(split: &FeeSplit) -> Result<()> {
    let total = split
        .holder_rewards_bps
        .checked_add(split.protection_reserve_bps)
        .and_then(|v| v.checked_add(split.project_treasury_bps))
        .and_then(|v| v.checked_add(split.platform_fee_bps))
        .ok_or(TrustLayerError::ArithmeticOverflow)?;

    require!(total == BPS_DENOMINATOR, TrustLayerError::InvalidFeeSplit);
    Ok(())
}

fn split_amount(amount: u64, split: FeeSplit) -> Result<SplitAmounts> {
    let holder_rewards = bps_amount(amount, split.holder_rewards_bps)?;
    let protection_reserve = bps_amount(amount, split.protection_reserve_bps)?;
    let project_treasury = bps_amount(amount, split.project_treasury_bps)?;
    let assigned = checked_add(checked_add(holder_rewards, protection_reserve)?, project_treasury)?;
    let platform_fee = checked_sub(amount, assigned)?;

    Ok(SplitAmounts {
        holder_rewards,
        protection_reserve,
        project_treasury,
        platform_fee,
    })
}

fn bps_amount(amount: u64, bps: u16) -> Result<u64> {
    let numerator = (amount as u128)
        .checked_mul(bps as u128)
        .ok_or(TrustLayerError::ArithmeticOverflow)?;
    Ok((numerator / BPS_DENOMINATOR as u128) as u64)
}

fn checked_add(left: u64, right: u64) -> Result<u64> {
    left.checked_add(right).ok_or(error!(TrustLayerError::ArithmeticOverflow))
}

fn checked_sub(left: u64, right: u64) -> Result<u64> {
    left.checked_sub(right).ok_or(error!(TrustLayerError::ArithmeticOverflow))
}

fn checked_add_i64(left: i64, right: i64) -> Result<i64> {
    left.checked_add(right).ok_or(error!(TrustLayerError::ArithmeticOverflow))
}

fn payout_leaf(wallet: Pubkey, amount: u64) -> [u8; 32] {
    hashv(&[b"trustlayer-payout", wallet.as_ref(), &amount.to_le_bytes()]).to_bytes()
}

fn verify_merkle_proof(leaf: [u8; 32], proof: Vec<[u8; 32]>, root: [u8; 32]) -> bool {
    let mut computed = leaf;

    for sibling in proof {
        computed = hash_pair(computed, sibling);
    }

    computed == root
}

fn hash_pair(left: [u8; 32], right: [u8; 32]) -> [u8; 32] {
    let (first, second) = if left <= right { (left, right) } else { (right, left) };
    hashv(&[&first, &second]).to_bytes()
}
