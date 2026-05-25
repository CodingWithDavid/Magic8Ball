const ANSWERS = [
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes - definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful."
];

const state = {
  phase: "waiting",
  answer: "Ask a question…",
  lastAnswerIndex: -1
};

const askButton = document.getElementById("ask-btn");
const motionButton = document.getElementById("motion-btn");
const answerNode = document.getElementById("answer");
const statusNode = document.getElementById("status");
const motionNoteNode = document.getElementById("motion-note");
const appNode = document.querySelector(".app");
const ballNode = document.querySelector(".ball");

let motionEnabled = false;
let requestingMotionPermission = false;
let lastShakeAt = 0;
let lastMagnitude = null;
let shakeImpulseCount = 0;
let lastImpulseAt = 0;
const SHAKE_DELTA_THRESHOLD = 4.5;
const SHAKE_BURST_WINDOW_MS = 520;
const SHAKE_COOLDOWN_MS = 1300;

function setPhase(phase, statusText) {
  state.phase = phase;
  statusNode.textContent = statusText;
  appNode.classList.toggle("shaking", phase === "shaking");
  ballNode.classList.toggle("is-flipped", phase === "revealed");
}

function getRandomAnswerIndex() {
  if (ANSWERS.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * ANSWERS.length);
  while (nextIndex === state.lastAnswerIndex) {
    nextIndex = Math.floor(Math.random() * ANSWERS.length);
  }
  return nextIndex;
}

function revealAnswer(source) {
  const nextIndex = getRandomAnswerIndex();
  state.lastAnswerIndex = nextIndex;
  state.answer = ANSWERS[nextIndex];
  answerNode.textContent = state.answer;
  setPhase("revealed", `Answered by ${source}.`);
}

function triggerAnswer(source) {
  if (state.phase === "shaking") {
    return;
  }

  setPhase("shaking", "Shaking the 8 Ball...");

  if (navigator.vibrate) {
    navigator.vibrate(65);
  }

  window.setTimeout(() => {
    revealAnswer(source);
  }, 640);
}

function handleMotionEvent(event) {
  if (!motionEnabled) {
    return;
  }

  const accel = event.acceleration;
  const hasRawAccel =
    accel && (accel.x !== null || accel.y !== null || accel.z !== null);
  const acceleration =
    (hasRawAccel ? accel : event.accelerationIncludingGravity) || { x: 0, y: 0, z: 0 };
  const x = acceleration.x ?? 0;
  const y = acceleration.y ?? 0;
  const z = acceleration.z ?? 0;
  const magnitude = Math.sqrt(x * x + y * y + z * z);

  const now = Date.now();
  if (lastMagnitude === null) {
    lastMagnitude = magnitude;
    return;
  }

  const delta = Math.abs(magnitude - lastMagnitude);
  lastMagnitude = magnitude;

  if (delta <= SHAKE_DELTA_THRESHOLD || now - lastShakeAt <= SHAKE_COOLDOWN_MS) {
    return;
  }

  if (now - lastImpulseAt > SHAKE_BURST_WINDOW_MS) {
    shakeImpulseCount = 1;
  } else {
    shakeImpulseCount += 1;
  }
  lastImpulseAt = now;

  if (shakeImpulseCount >= 2) {
    shakeImpulseCount = 0;
    lastShakeAt = now;
    triggerAnswer("shake");
  }
}

function enableMotionListening(source = "auto") {
  if (motionEnabled) {
    return;
  }
  window.addEventListener("devicemotion", handleMotionEvent, { passive: true });
  motionEnabled = true;
  lastMagnitude = null;
  shakeImpulseCount = 0;
  lastImpulseAt = 0;
  motionButton.classList.add("hidden");
  motionButton.disabled = false;
  motionButton.textContent = "Enable shake access";
  motionNoteNode.textContent =
    source === "permission"
      ? "Shake enabled. Give your device a shake."
      : "Shake support is on where available. If it does not respond, use “Ask the 8 Ball.”";
}

async function requestMotionPermission() {
  if (requestingMotionPermission) {
    return;
  }

  requestingMotionPermission = true;
  motionButton.disabled = true;
  motionButton.textContent = "Requesting access…";

  try {
    const permission = await DeviceMotionEvent.requestPermission();
    if (permission === "granted") {
      enableMotionListening("permission");
      setPhase("waiting", "Motion access granted.");
    } else {
      motionNoteNode.textContent =
        "Motion access was denied. You can still use “Ask the 8 Ball” for answers.";
      setPhase("waiting", "Motion permission denied.");
    }
  } catch (error) {
    motionNoteNode.textContent =
      "Could not request motion access. You can keep using “Ask the 8 Ball.”";
    setPhase("waiting", "Motion permission request failed.");
  } finally {
    requestingMotionPermission = false;
    if (!motionEnabled) {
      motionButton.disabled = false;
      motionButton.textContent = "Retry shake access";
    }
  }
}

function initializeMotionSupport() {
  const hasDeviceMotion = "DeviceMotionEvent" in window;
  if (!hasDeviceMotion) {
    const isSecureContextRequired =
      window.location.protocol !== "https:" && window.location.hostname !== "localhost";
    motionNoteNode.textContent = isSecureContextRequired
      ? "Shake needs HTTPS on mobile. Use the button here, or open this app over HTTPS on your phone."
      : "Shake support unavailable on this device/browser. Use the button to get answers.";
    return;
  }

  const needsPermissionRequest =
    typeof DeviceMotionEvent.requestPermission === "function";

  if (needsPermissionRequest) {
    motionButton.classList.remove("hidden");
    motionButton.addEventListener("click", requestMotionPermission);
    motionNoteNode.textContent =
      "On iPhone or iPad, tap “Enable shake access” to allow motion.";
    return;
  }

  enableMotionListening();
}

askButton.addEventListener("click", () => {
  triggerAnswer("button");
});

initializeMotionSupport();
