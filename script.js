const words = [
  "abacaxi",
  "avião",
  "bicicleta",
  "cachorro",
  "castelo",
  "chuva",
  "escola",
  "foguete",
  "janela",
  "sorvete",
  "tartaruga",
  "violão"
];

const ROUND_TIME = 60;

const timerElement = document.getElementById("timer");
const roundElement = document.getElementById("round");
const secretWordElement = document.getElementById("secretWord");
const feedbackElement = document.getElementById("feedback");
const guessInput = document.getElementById("guessInput");
const checkGuessButton = document.getElementById("checkGuessButton");
const newRoundButton = document.getElementById("newRoundButton");
const clearCanvasButton = document.getElementById("clearCanvasButton");
const toggleWordButton = document.getElementById("toggleWordButton");
const canvas = document.getElementById("drawingCanvas");
const context = canvas.getContext("2d");

let currentWord = "";
let round = 0;
let timeLeft = ROUND_TIME;
let timerId = null;
let roundActive = false;
let wordVisible = true;
let isDrawing = false;

// Ajusta o canvas para telas de alta densidade mantendo o tamanho visual.
function setupCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.scale(ratio, ratio);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 4;
  context.strokeStyle = "#2c221c";

  clearCanvas();
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

function normalizeText(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function updateTimerDisplay() {
  timerElement.textContent = `${timeLeft}s`;
}

function setFeedback(message, type = "neutral") {
  feedbackElement.textContent = message;
  feedbackElement.className = `feedback ${type}`;
}

function revealCorrectWord() {
  wordVisible = true;
  renderSecretWord();
  setFeedback(`Tempo esgotado. A palavra era "${currentWord}".`, "error");
}

function finishRound() {
  roundActive = false;
  clearInterval(timerId);
  timerId = null;
  guessInput.disabled = true;
  checkGuessButton.disabled = true;
}

function handleTimeExpired() {
  finishRound();
  revealCorrectWord();
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimerDisplay();
      handleTimeExpired();
    }
  }, 1000);
}

function renderSecretWord() {
  secretWordElement.textContent = currentWord || "---";
  secretWordElement.classList.toggle("hidden", !wordVisible);
  toggleWordButton.textContent = wordVisible ? "Ocultar" : "Mostrar";
}

function startNewRound() {
  round += 1;
  currentWord = getRandomWord();
  timeLeft = ROUND_TIME;
  roundActive = true;
  wordVisible = true;

  roundElement.textContent = round;
  updateTimerDisplay();
  renderSecretWord();
  clearCanvas();

  guessInput.value = "";
  guessInput.disabled = false;
  checkGuessButton.disabled = false;
  guessInput.focus();

  setFeedback("Rodada iniciada. O desenhista já pode rabiscar.", "neutral");
  startTimer();
}

function checkGuess() {
  if (!roundActive) {
    setFeedback("Inicie uma nova rodada para jogar.", "neutral");
    return;
  }

  const playerGuess = normalizeText(guessInput.value);

  if (!playerGuess) {
    setFeedback("Digite um palpite antes de verificar.", "error");
    return;
  }

  if (playerGuess === normalizeText(currentWord)) {
    finishRound();
    wordVisible = true;
    renderSecretWord();
    setFeedback(`Acertou! A palavra era "${currentWord}".`, "success");
    return;
  }

  setFeedback("Ainda não foi dessa vez. Tente outro palpite.", "error");
}

function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDrawing(event) {
  isDrawing = true;
  const { x, y } = getPointerPosition(event);
  context.beginPath();
  context.moveTo(x, y);
}

function draw(event) {
  if (!isDrawing) {
    return;
  }

  const { x, y } = getPointerPosition(event);
  context.lineTo(x, y);
  context.stroke();
}

function stopDrawing() {
  if (!isDrawing) {
    return;
  }

  isDrawing = false;
  context.closePath();
}

checkGuessButton.addEventListener("click", checkGuess);
newRoundButton.addEventListener("click", startNewRound);
clearCanvasButton.addEventListener("click", clearCanvas);

toggleWordButton.addEventListener("click", () => {
  wordVisible = !wordVisible;
  renderSecretWord();
});

guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkGuess();
  }
});

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

window.addEventListener("resize", setupCanvas);

setupCanvas();
updateTimerDisplay();
guessInput.disabled = true;
checkGuessButton.disabled = true;
