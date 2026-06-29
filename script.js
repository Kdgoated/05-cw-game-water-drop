const container = document.getElementById("game-container");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const messageEl = document.getElementById("game-message");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

let gameRunning = false;
let score = 0;
let timeLeft = 30;
let dropInterval;
let canInterval;
let countdownInterval;
let lastWin = false;

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

const winMessages = [
  "Bravo! You brought clean water to the village.",
  "Fantastic! Your water rescue made a real difference.",
  "You won! Clean drops won the day.",
  "Great job! Every tap is closer to safer water."
];

const loseMessages = [
  "Close call! Try again to reach the water goal.",
  "So close! Keep practicing and beat the challenge next time.",
  "Don’t give up! Clean water is worth another round.",
  "Try again — your next game can be a rescue win."
];

function getRandomMessage(messages) {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

function startGame() {
  if (gameRunning) return;

  resetGameState();
  gameRunning = true;
  startBtn.textContent = "Playing...";
  startBtn.disabled = true;
  resetBtn.disabled = false;
  showMessage("Catch clean drops and avoid dirty water!", "info");

  dropInterval = setInterval(createDrop, 900);
  canInterval = setInterval(createCan, 6000);
  countdownInterval = setInterval(updateTimer, 1000);
}

function resetGameState() {
  clearGameTimers();
  removeAllFallingItems();
  clearConfetti();
  score = 0;
  timeLeft = 30;
  lastWin = false;
  updateScore();
  updateTimerDisplay();
  showMessage("Ready to rescue drops? Tap Start.", "neutral");
  startBtn.textContent = "Start";
  startBtn.disabled = false;
  resetBtn.disabled = true;
}

function resetGame() {
  clearGameTimers();
  removeAllFallingItems();
  gameRunning = false;
  startBtn.textContent = "Start";
  startBtn.disabled = false;
  resetBtn.disabled = true;
  showMessage("Game reset. Tap Start to try again.", "neutral");
}

function clearGameTimers() {
  clearInterval(dropInterval);
  clearInterval(canInterval);
  clearInterval(countdownInterval);
}

function updateScore() {
  scoreEl.textContent = score;
  if (score >= 20 && !lastWin) {
    lastWin = true;
    showMessage("Amazing! You reached the goal and unlocked celebration!", "win");
    celebrateWin();
  }
}

function updateTimer() {
  if (!gameRunning) return;
  timeLeft -= 1;
  updateTimerDisplay();

  if (timeLeft <= 0) {
    endGame();
  }
}

function updateTimerDisplay() {
  timeEl.textContent = timeLeft;
}

function endGame() {
  clearGameTimers();
  gameRunning = false;
  startBtn.disabled = false;
  resetBtn.disabled = false;

  if (score >= 20) {
    showMessage(getRandomMessage(winMessages), "win");
    celebrateWin();
  } else {
    showMessage(getRandomMessage(loseMessages), "lose");
  }
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `game-message ${type || "neutral"}`;
}

function removeAllFallingItems() {
  const items = container.querySelectorAll(".water-drop, .water-can, .confetti-container");
  items.forEach((item) => item.remove());
}

function createDrop() {
  if (!gameRunning) return;

  const drop = document.createElement("div");
  const isBad = Math.random() < 0.25;
  drop.className = `water-drop ${isBad ? "bad-drop" : "good-drop"}`;
  drop.dataset.type = isBad ? "bad" : "good";

  const size = Math.floor(Math.random() * 30) + 40;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = container.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = `${xPosition}px`;

  const duration = (Math.random() * 2 + 3).toFixed(1);
  drop.style.animationDuration = `${duration}s`;

  if (isBad) {
    drop.textContent = "💧";
  }

  drop.addEventListener("click", () => collectDrop(drop));
  drop.addEventListener("animationend", () => {
    if (container.contains(drop)) {
      if (!isBad) {
        showMessage("Oops! A clean drop hit the ground.", "warning");
      }
      drop.remove();
    }
  });

  container.appendChild(drop);
}

function createCan() {
  if (!gameRunning) return;

  const can = document.createElement("div");
  can.className = "water-can";
  can.textContent = "+3";

  const size = 50;
  const gameWidth = container.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  can.style.left = `${xPosition}px`;
  can.style.animationDuration = `${(Math.random() * 2 + 5).toFixed(1)}s`;

  can.addEventListener("click", () => collectCan(can));
  can.addEventListener("animationend", () => {
    if (container.contains(can)) {
      can.remove();
    }
  });

  container.appendChild(can);
}

function collectDrop(drop) {
  if (!gameRunning) return;

  const isBad = drop.dataset.type === "bad";
  if (isBad) {
    score = Math.max(0, score - 3);
    showMessage("Dirty water! Score penalty applied.", "lose");
    flashElement(drop, "shake");
  } else {
    score += 1;
    showMessage("Nice catch! +1 point.", "success");
    flashElement(drop, "pop");
  }

  updateScore();
  drop.remove();
}

function collectCan(can) {
  if (!gameRunning) return;
  score += 3;
  updateScore();
  showMessage("Bonus can collected! +3 points.", "success");
  flashElement(can, "pop");
  can.remove();
}

function flashElement(element, effect) {
  element.classList.add(effect);
  setTimeout(() => element.classList.remove(effect), 300);
}

function celebrateWin() {
  clearConfetti();
  const confettiWrapper = document.createElement("div");
  confettiWrapper.className = "confetti-container";

  const colors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A", "#F16061"];
  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${Math.random() * 1.5 + 2.5}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiWrapper.appendChild(piece);
  }

  container.appendChild(confettiWrapper);
  setTimeout(() => clearConfetti(), 4000);
}

function clearConfetti() {
  const confetti = container.querySelectorAll(".confetti-container");
  confetti.forEach((item) => item.remove());
}

resetGameState();
