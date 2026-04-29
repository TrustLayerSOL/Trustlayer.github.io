import { calculateRewardCycle } from "../src/reward-engine.js";
import { demoHolders, demoProject } from "../src/demo-data.js";

const cycle = calculateRewardCycle({
  holders: demoHolders,
  totalInflow: demoProject.totalInflow,
  splitBps: demoProject.splitBps,
  rules: demoProject.rules,
});

console.log(JSON.stringify({ project: demoProject, cycle }, null, 2));
