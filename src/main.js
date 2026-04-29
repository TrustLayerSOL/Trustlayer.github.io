const tabButtons = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll("[data-panel]");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    tabButtons.forEach((item) => item.classList.toggle("active", item === button));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === tab));
  });
});

const cycleTimer = document.querySelector("#overview .data-card:nth-child(2) strong");
let seconds = 3 * 3600 + 42 * 60 + 18;

function renderTimer() {
  if (!cycleTimer) return;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  cycleTimer.textContent = [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  seconds = seconds > 0 ? seconds - 1 : 0;
}

renderTimer();
setInterval(renderTimer, 1000);
