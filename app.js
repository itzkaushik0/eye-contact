/**
 * Eye Contact Enforcer - Main Application Engine
 * Orchestrates webcam feed, MediaPipe FaceMesh / optical fallback tracker,
 * giant animated eyeball renderer, Travis Scott fish popup, and audio triggers.
 */

// Application State
const STATE = {
  webcamRunning: false,
  isLooking: true,
  lastLookingState: true,
  lookAwayStartTime: 0,
  lookAwayDuration: 0,
  streakSeconds: 0,
  bestStreakSeconds: 0,
  totalViolations: 0,
  complianceScore: 100,
  demoMode: false,
  
  // Tracking thresholds
  yawThreshold: 0.16,      // head turned left/right
  pitchDownThreshold: 0.18,// head looking down at phone
  pitchUpThreshold: 0.18,  // head looking up
  gazeThreshold: 0.22,     // eye pupils looking sideways
  gracePeriodMs: 100,      // fast snappy reaction (ignores only micro-blinks)
  
  // Current gaze coords for eyes to follow
  targetX: 0.5,
  targetY: 0.5,
  currentEyeX: 0.5,
  currentEyeY: 0.5
};

// DOM Elements
let videoEl, webglCanvas, eyesCanvas, eyesCtx;
let overlayEl, travisMemePopup, travisMemeImg, travisMemeCaption;
let animeRewardPopup, animeRewardImg, animeRewardCaption;
let complianceGauge, streakValEl, violationsValEl, telemetryLogEl;
let mediaModal, imageFileInput, audioFileInput;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  initOnboardingAndSubscription();
  initEyeballCanvas();
  initMediaUploaderUI();
  initTimerLoops();
  initKeyboardShortcuts();
});

function initDOMElements() {
  videoEl = document.getElementById('webcam-video');
  eyesCanvas = document.getElementById('eyes-canvas');
  eyesCtx = eyesCanvas ? eyesCanvas.getContext('2d') : null;
  overlayEl = document.getElementById('horror-overlay');
  
  travisMemePopup = document.getElementById('travis-meme-popup');
  travisMemeImg = document.getElementById('travis-meme-img');
  travisMemeCaption = document.getElementById('travis-meme-caption');
  
  animeRewardPopup = document.getElementById('anime-reward-popup');
  animeRewardImg = document.getElementById('anime-reward-img');
  animeRewardCaption = document.getElementById('anime-reward-caption');

  complianceGauge = document.getElementById('compliance-meter-fill');
  streakValEl = document.getElementById('stat-streak');
  violationsValEl = document.getElementById('stat-violations');
  telemetryLogEl = document.getElementById('telemetry-output');

  mediaModal = document.getElementById('media-modal');
  imageFileInput = document.getElementById('upload-img-input');
  audioFileInput = document.getElementById('upload-audio-input');

  // Start Camera button
  const startBtn = document.getElementById('start-cam-btn');
  if (startBtn) {
    startBtn.addEventListener('click', startWebcam);
  }

  // Demo Mode toggle button
  const demoToggleBtn = document.getElementById('demo-mode-btn');
  if (demoToggleBtn) {
    demoToggleBtn.addEventListener('click', toggleDemoMode);
  }

  // Open Media Manager button
  const openMediaBtn = document.getElementById('open-media-btn');
  if (openMediaBtn) {
    openMediaBtn.addEventListener('click', () => {
      renderMediaList();
      mediaModal.classList.remove('hidden');
    });
  }

  // Close Media Modal
  const closeMediaBtn = document.getElementById('close-media-btn');
  if (closeMediaBtn) {
    closeMediaBtn.addEventListener('click', () => {
      mediaModal.classList.add('hidden');
    });
  }

  // Certificate button
  const certBtn = document.getElementById('generate-cert-btn');
  if (certBtn) {
    certBtn.addEventListener('click', generateCertificate);
  }

  // Voice Preview Test Buttons
  const testSpookyBtn = document.getElementById('test-spooky-btn');
  if (testSpookyBtn) {
    testSpookyBtn.addEventListener('click', () => {
      if (window.soundEngine) {
        window.soundEngine.init();
        window.soundEngine.speakSpookyVoice("I see you.");
      }
    });
  }

  // Setup drag-and-drop on entire window for instant meme sharing
  setupWindowDragDrop();
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// ONBOARDING INTENT GATE & STANDALONE SUBSCRIPTION VIEW
// -------------------------------------------------------------

function showSubscriptionView() {
  stopWebcam(); // 100% kill camera feed
  if (window.soundEngine) window.soundEngine.silence();

  const gateEl = document.getElementById('onboarding-gate');
  const subViewEl = document.getElementById('subscription-view');
  const appContainerEl = document.getElementById('app-container');

  if (gateEl) gateEl.classList.add('hidden');
  if (appContainerEl) appContainerEl.classList.add('hidden'); // REMOVE camera window completely
  if (subViewEl) subViewEl.classList.remove('hidden'); // Show ONLY subscription plan window

  logTelemetry("👑 [VIEW SWITCH] Displaying ONLY Subscription Plan Window. Camera window & buttons removed.");
}

function showDoomscrollView() {
  if (window.soundEngine) window.soundEngine.init();

  const gateEl = document.getElementById('onboarding-gate');
  const subViewEl = document.getElementById('subscription-view');
  const appContainerEl = document.getElementById('app-container');

  if (gateEl) gateEl.classList.add('hidden');
  if (subViewEl) subViewEl.classList.add('hidden');
  if (appContainerEl) appContainerEl.classList.remove('hidden'); // Open the usual doomscroll window

  logTelemetry("🧟 [VIEW SWITCH] Doomscroll Mode active. Camera window is ready.");
}

function initOnboardingAndSubscription() {
  const chooseDoomscrollBtn = document.getElementById('choose-doomscroll-btn');
  const chooseImproveBtn = document.getElementById('choose-improve-btn');
  const openUpgradeBtn = document.getElementById('open-upgrade-btn');
  const subSwitchDoomBtn = document.getElementById('sub-view-switch-doomscroll-btn');
  const subDowngradeBtn = document.getElementById('sub-view-downgrade-btn');
  const payBtn = document.getElementById('sub-view-pay-btn');
  const payStatusMsg = document.getElementById('sub-view-status-msg');

  // Gate Option 1: Doomscrolling -> Opens usual window
  if (chooseDoomscrollBtn) {
    chooseDoomscrollBtn.addEventListener('click', showDoomscrollView);
  }

  // Gate Option 2: Self-Improvement -> Opens ONLY the subscription window (NO camera)
  if (chooseImproveBtn) {
    chooseImproveBtn.addEventListener('click', showSubscriptionView);
  }

  // Header "Improve Plan ($67.67)" button inside Doomscroll header
  if (openUpgradeBtn) {
    openUpgradeBtn.addEventListener('click', () => {
      showSubscriptionView();
      if (payStatusMsg) payStatusMsg.classList.add('hidden');
    });
  }

  // Subscription view -> Switch back to Doomscroll
  if (subSwitchDoomBtn) {
    subSwitchDoomBtn.addEventListener('click', showDoomscrollView);
  }
  if (subDowngradeBtn) {
    subDowngradeBtn.addEventListener('click', showDoomscrollView);
  }

  // Fake Pay $67.67 button
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      payBtn.disabled = true;
      payBtn.textContent = "⏳ Contacting Bank of Discipline...";
      if (payStatusMsg) {
        payStatusMsg.classList.remove('hidden', 'pay-status-error', 'pay-status-success');
        payStatusMsg.className = "pay-status";
        payStatusMsg.textContent = "Verifying neural funds and dopamine credit...";
      }

      setTimeout(() => {
        if (payStatusMsg) {
          payStatusMsg.className = "pay-status pay-status-error";
          payStatusMsg.textContent = "❌ DECLINED: Insufficient Willpower detected. Card $67.67 transaction failed. Reverting to Doomscroll surveillance...";
        }
        payBtn.textContent = "❌ Card Declined ($67.67)";

        setTimeout(() => {
          showDoomscrollView();
          payBtn.disabled = false;
          payBtn.textContent = "💳 Authorize $67.67 & Improve Now";
          logTelemetry("💳 [BILLING REJECTED] Willpower test failed. Enjoy free Doomscroll mode.");
        }, 2200);
      }, 1500);
    });
  }
}

// -------------------------------------------------------------
// WEBCAM & FACE TRACKING PIPELINE
// -------------------------------------------------------------

let currentStream = null;

function stopWebcam() {
  if (currentStream) {
    try {
      currentStream.getTracks().forEach(track => track.stop());
    } catch (e) {}
    currentStream = null;
  }
  if (videoEl) {
    videoEl.srcObject = null;
  }
  STATE.webcamRunning = false;
  const startBtn = document.getElementById('start-cam-btn');
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = "📹 Start Camera";
    startBtn.classList.remove('btn-active');
  }
  const statusBadge = document.getElementById('status-badge');
  if (statusBadge) {
    statusBadge.textContent = "⚪ CAMERA OFFLINE";
    statusBadge.className = "status-badge status-good";
  }
}

async function startWebcam() {
  // If subscription view is open, do not allow camera to start
  const subViewEl = document.getElementById('subscription-view');
  if (subViewEl && !subViewEl.classList.contains('hidden')) {
    logTelemetry("🚫 Camera start blocked: Subscription view is active.");
    return;
  }

  if (window.soundEngine) window.soundEngine.init();
  const startBtn = document.getElementById('start-cam-btn');
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = "Connecting Camera...";
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    });

    currentStream = stream;
    videoEl.srcObject = stream;
    await videoEl.play();
    STATE.webcamRunning = true;

    if (startBtn) {
      startBtn.textContent = "🟢 Camera Enforcing";
      startBtn.classList.add('btn-active');
    }

    logTelemetry("Camera online. Initializing FaceMesh Neural Net...");
    initFaceMeshTracking();
  } catch (err) {
    console.warn("Webcam access error:", err);
    logTelemetry(`⚠️ Webcam access unavailable: ${err.message}. Activating Optical/Simulator fallback.`);
    if (startBtn) {
      startBtn.textContent = "🎮 Simulator Active";
      startBtn.disabled = false;
    }
    activateFallbackTracker();
  }
}

/**
 * Initialize Google MediaPipe FaceMesh via CDN
 */
function initFaceMeshTracking() {
  if (typeof FaceMesh === 'undefined') {
    logTelemetry("CDN FaceMesh loading... Running optical tracker meanwhile.");
    activateFallbackTracker();
    return;
  }

  try {
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // iris landmarks 468-477
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceMeshResults);

    // Setup MediaPipe Camera utility or requestAnimationFrame loop
    const processFrame = async () => {
      if (STATE.webcamRunning && videoEl.readyState >= 2) {
        await faceMesh.send({ image: videoEl });
      }
      requestAnimationFrame(processFrame);
    };
    requestAnimationFrame(processFrame);
    logTelemetry("✅ MediaPipe FaceMesh active with 468 landmarks & iris tracking.");
  } catch (e) {
    console.error("FaceMesh initialization error:", e);
    activateFallbackTracker();
  }
}

/**
 * Handle FaceMesh results to detect head pose and gaze vector
 */
function onFaceMeshResults(results) {
  if (STATE.demoMode) return; // User is controlling via demo buttons/keys

  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    // No face detected at all -> User looking away or left room!
    handleGazeEvaluation(false, 0.5, 0.5, "NO FACE DETECTED");
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];

  // Key landmark indices:
  // Nose tip: 1
  // Left eye outer: 33, Left eye inner: 133
  // Right eye inner: 362, Right eye outer: 263
  // Forehead: 10, Chin: 152
  // Left iris center: 468, Right iris center: 473

  const nose = landmarks[1];
  const leftEyeOuter = landmarks[33];
  const rightEyeOuter = landmarks[263];
  const forehead = landmarks[10];
  const chin = landmarks[152];

  // Head Yaw (Left / Right turn)
  // Distance from nose to left eye vs nose to right eye
  const distLeft = Math.abs(nose.x - leftEyeOuter.x);
  const distRight = Math.abs(nose.x - rightEyeOuter.x);
  const totalEyeDist = Math.abs(leftEyeOuter.x - rightEyeOuter.x);
  const yawRatio = totalEyeDist > 0 ? (distLeft - distRight) / totalEyeDist : 0;

  // Head Pitch (Looking down at phone / up at ceiling)
  const faceHeight = Math.abs(forehead.y - chin.y);
  const noseToForehead = Math.abs(nose.y - forehead.y);
  const pitchRatio = faceHeight > 0 ? (noseToForehead / faceHeight) - 0.55 : 0;

  // Iris Gaze Tracking (if refined iris landmarks available)
  let irisOffset = 0;
  if (landmarks[468] && landmarks[473]) {
    const leftIris = landmarks[468];
    const leftEyeWidth = Math.abs(landmarks[133].x - landmarks[33].x);
    if (leftEyeWidth > 0) {
      const eyeCenter = (landmarks[33].x + landmarks[133].x) / 2;
      irisOffset = (leftIris.x - eyeCenter) / leftEyeWidth;
    }
  }

  // Update target coordinates for the giant eyes to follow you
  STATE.targetX = nose.x;
  STATE.targetY = nose.y;

  // Evaluate looking compliance
  const isLookingAway = 
    Math.abs(yawRatio) > STATE.yawThreshold || 
    pitchRatio > STATE.pitchDownThreshold || 
    pitchRatio < -STATE.pitchUpThreshold ||
    Math.abs(irisOffset) > STATE.gazeThreshold;

  const isLooking = !isLookingAway;
  const reason = isLooking ? "COMPLIANT" : (
    Math.abs(yawRatio) > STATE.yawThreshold ? "HEAD TURNED" :
    pitchRatio > STATE.pitchDownThreshold ? "LOOKING DOWN (PHONE?)" :
    Math.abs(irisOffset) > STATE.gazeThreshold ? "SIDE-EYEING" : "AVERTED"
  );

  handleGazeEvaluation(isLooking, nose.x, nose.y, reason);
}

/**
 * Optical Difference Fallback Tracker
 * Compares webcam frame differences & central brightness if FaceMesh is unavailable
 */
function activateFallbackTracker() {
  logTelemetry("⚡ Running Canvas Optical Gaze Tracker.");
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 64;
  tempCanvas.height = 48;
  const tempCtx = tempCanvas.getContext('2d');
  let prevFrameData = null;

  setInterval(() => {
    if (STATE.demoMode || !STATE.webcamRunning || videoEl.readyState < 2) return;

    tempCtx.drawImage(videoEl, 0, 0, 64, 48);
    const frame = tempCtx.getImageData(0, 0, 64, 48);
    
    // Check central presence (where face should be)
    let centerLuminance = 0;
    let diff = 0;
    const pixels = frame.data;

    for (let y = 14; y < 34; y++) {
      for (let x = 20; x < 44; x++) {
        const idx = (y * 64 + x) * 4;
        const lum = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        centerLuminance += lum;
        if (prevFrameData) {
          diff += Math.abs(lum - prevFrameData[idx]);
        }
      }
    }
    prevFrameData = pixels;

    const avgLum = centerLuminance / (20 * 24);
    // If center is too dark (empty chair or blocked) or extreme sudden delta -> treat as away
    const looking = avgLum > 35;
    handleGazeEvaluation(looking, 0.5, 0.5, looking ? "OPTICAL PRESENCE" : "EMPTY CHAIR");
  }, 200);
}

// -------------------------------------------------------------
// GAZE EVALUATION & EVENT STATE MACHINE
// -------------------------------------------------------------

let lookAwayDebounceTimer = null;
let currentLookAwayTimeout = null;

function handleGazeEvaluation(isLooking, x, y, debugInfo) {
  STATE.targetX = x || 0.5;
  STATE.targetY = y || 0.5;

  if (isLooking) {
    // Cancel any pending look-away trigger if user looked back quickly
    if (lookAwayDebounceTimer) {
      clearTimeout(lookAwayDebounceTimer);
      lookAwayDebounceTimer = null;
    }

    if (!STATE.isLooking) {
      // Transition: was looking away, now returned!
      STATE.isLooking = true;
      STATE.lookAwayDuration = 0;
      onUserReturned();
    }
  } else {
    // User is looking away
    if (STATE.isLooking && !lookAwayDebounceTimer) {
      // Small 100ms debounce to filter instantaneous blinks
      lookAwayDebounceTimer = setTimeout(() => {
        lookAwayDebounceTimer = null;
        if (STATE.isLooking) {
          STATE.isLooking = false;
          STATE.lookAwayStartTime = Date.now();
          onUserLookedAway();
        }
      }, STATE.gracePeriodMs);
    } else if (!STATE.isLooking) {
      STATE.lookAwayDuration = Date.now() - STATE.lookAwayStartTime;
    }
  }

  updateHUD(debugInfo);
}

/**
 * TRIGGER 1: Look Away -> Travis Scott Fish & Giant Staring Eyes Pop Up!
 */
function onUserLookedAway() {
  STATE.totalViolations++;
  logTelemetry(`🚨 EYE CONTACT BROKEN! VIOLATION #${STATE.totalViolations}`);

  // 1. Activate Horror Vignette & Eyes
  if (overlayEl) overlayEl.classList.add('horror-active');
  if (eyesCanvas) eyesCanvas.classList.add('eyes-active');

  // 2. Fetch and display primary look-away meme (Travis Scott Fish)
  const meme = window.mediaManager ? window.mediaManager.getPrimaryLookAwayImage() : null;
  if (meme && travisMemePopup && travisMemeImg) {
    travisMemeImg.src = meme.src;
    travisMemeImg.onerror = () => {
      travisMemeImg.src = meme.fallbackSrc || BUILTIN_MEMES.travisFish;
    };
    if (travisMemeCaption) {
      travisMemeCaption.textContent = meme.caption || "BRO LOOKED AWAY 💀";
    }
    travisMemePopup.classList.remove('hidden');
    travisMemePopup.classList.add('popup-jumpscare');
  }

  // 3. Play audio immediately every time you look away
  playLookAwaySequence();
}

/**
 * Sequential Audio: Jumpscare Stinger -> "I see you." -> Repeating loop while away
 */
function playLookAwaySequence() {
  if (!window.soundEngine) return;

  // Check if user uploaded a custom audio for lookaway
  if (window.mediaManager) {
    window.mediaManager.playCustomAudio('lookaway');
  }

  // Immediate voice & horror stinger: "I see you."
  window.soundEngine.speakSpookyVoice("I see you.");

  // Keep audio playing while looking away
  window.soundEngine.startSpookyLoop();
}

/**
 * TRIGGER 2: Come Back -> Returns cleanly to usual state
 */
function onUserReturned() {
  logTelemetry("🟢 Eye contact restored. State returned to usual.");
  clearTimeout(currentLookAwayTimeout);

  // 1. Instantly silence eerie speech, horror sounds, and heartbeat
  if (window.soundEngine) {
    window.soundEngine.silence();
  }

  // 2. Instantly remove Horror Overlay, Giant Eyes, and Travis Fish
  if (overlayEl) overlayEl.classList.remove('horror-active');
  if (eyesCanvas) eyesCanvas.classList.remove('eyes-active');
  if (travisMemePopup) {
    travisMemePopup.classList.add('hidden');
    travisMemePopup.classList.remove('popup-jumpscare');
  }

  // 3. Play custom lookback audio if user provided one
  if (window.mediaManager) {
    window.mediaManager.playCustomAudio('lookback');
  }
}

// -------------------------------------------------------------
// GIANT PROCEDURAL ANIMATED EYEBALLS (CANVAS 2D)
// -------------------------------------------------------------

function initEyeballCanvas() {
  if (!eyesCanvas || !eyesCtx) return;

  const resize = () => {
    eyesCanvas.width = window.innerWidth;
    eyesCanvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  // Eyeball animation loop
  let eyePulse = 0;
  let pupilTwitchX = 0;
  let pupilTwitchY = 0;

  function renderEyeballs() {
    requestAnimationFrame(renderEyeballs);
    if (!eyesCtx) return;

    eyesCtx.clearRect(0, 0, eyesCanvas.width, eyesCanvas.height);

    // Only draw detailed eyeballs when looking away or in demo
    if (STATE.isLooking && !STATE.demoMode) return;

    eyePulse += 0.04;
    // Organic twitching
    if (Math.random() < 0.08) {
      pupilTwitchX = (Math.random() - 0.5) * 8;
      pupilTwitchY = (Math.random() - 0.5) * 8;
    }

    // Smoothly interpolate eye gaze towards target
    STATE.currentEyeX += (STATE.targetX - STATE.currentEyeX) * 0.12;
    STATE.currentEyeY += (STATE.targetY - STATE.currentEyeY) * 0.12;

    const w = eyesCanvas.width;
    const h = eyesCanvas.height;
    
    // Eyeballs: comfortably large and terrifying without completely blocking the fish
    const eyeRadius = Math.min(w, h) * 0.22 + Math.sin(eyePulse) * 5;
    const leftEyeCenter = { x: w * 0.30, y: h * 0.32 };
    const rightEyeCenter = { x: w * 0.70, y: h * 0.32 };

    drawSingleEye(leftEyeCenter.x, leftEyeCenter.y, eyeRadius, pupilTwitchX, pupilTwitchY);
    drawSingleEye(rightEyeCenter.x, rightEyeCenter.y, eyeRadius, pupilTwitchX, pupilTwitchY);
  }

  renderEyeballs();
}

/**
 * Draw a single giant realistic cursed eyeball with bloodshot veins, 
 * glowing demonic iris, and tracking pupil occupying the total screen
 */
function drawSingleEye(cx, cy, r, twitchX, twitchY) {
  const ctx = eyesCtx;

  ctx.save();

  // Eyeball Shadow / Glow (Massive red aura)
  ctx.shadowColor = 'rgba(255, 0, 0, 0.85)';
  ctx.shadowBlur = Math.max(40, r * 0.25);

  // Sclera (White of eye with fleshy bloody tint)
  const scleraGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  scleraGrad.addColorStop(0, '#ffffff');
  scleraGrad.addColorStop(0.7, '#fff1f2');
  scleraGrad.addColorStop(0.88, '#fecdd3');
  scleraGrad.addColorStop(1, '#881337');

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = scleraGrad;
  ctx.fill();
  ctx.lineWidth = Math.max(6, r * 0.03);
  ctx.strokeStyle = '#7f1d1d';
  ctx.stroke();

  // Bloodshot Veins
  drawVeins(cx, cy, r);

  // Pupil & Iris Gaze calculation
  // Map normalized target (0-1) to eye sphere offsets
  const maxPupilOffset = r * 0.45;
  const gazeOffsetX = (STATE.currentEyeX - 0.5) * maxPupilOffset * 2 + twitchX;
  const gazeOffsetY = (STATE.currentEyeY - 0.5) * maxPupilOffset * 2 + twitchY;

  const irisX = cx + gazeOffsetX;
  const irisY = cy + gazeOffsetY;
  const irisRadius = r * 0.48;

  // Iris (Demonic yellow-amber or crimson ring)
  const irisGrad = ctx.createRadialGradient(irisX, irisY, irisRadius * 0.1, irisX, irisY, irisRadius);
  irisGrad.addColorStop(0, '#ffd700');   // Glowing amber core
  irisGrad.addColorStop(0.5, '#dc2626'); // Blood red ring
  irisGrad.addColorStop(0.85, '#7f1d1d');// Dark crimson border
  irisGrad.addColorStop(1, '#000000');

  ctx.beginPath();
  ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
  ctx.fillStyle = irisGrad;
  ctx.fill();

  // Iris fibers
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(irisX, irisY);
    ctx.lineTo(irisX + Math.cos(angle) * irisRadius, irisY + Math.sin(angle) * irisRadius);
    ctx.stroke();
  }

  // Pupil (Pure Black, dilating slightly)
  const pupilRadius = irisRadius * 0.42 + Math.sin(Date.now() * 0.005) * 3;
  ctx.beginPath();
  ctx.arc(irisX, irisY, pupilRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Glossy reflection / specular catchlights
  ctx.beginPath();
  ctx.arc(irisX - irisRadius * 0.3, irisY - irisRadius * 0.3, irisRadius * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(irisX + irisRadius * 0.22, irisY + irisRadius * 0.22, irisRadius * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();

  ctx.restore();
}

/**
 * Draw branching bloodshot capillaries radiating from edge of sclera
 */
function drawVeins(cx, cy, r) {
  const ctx = eyesCtx;
  ctx.save();
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.65)';
  ctx.lineWidth = Math.max(2.5, r * 0.012);

  const angles = [0.2, 0.8, 1.4, 2.1, 2.7, 3.5, 4.2, 5.1, 5.8];
  angles.forEach(ang => {
    ctx.beginPath();
    const startX = cx + Math.cos(ang) * (r * 0.96);
    const startY = cy + Math.sin(ang) * (r * 0.96);
    const midX = cx + Math.cos(ang + 0.1) * (r * 0.65);
    const midY = cy + Math.sin(ang + 0.1) * (r * 0.65);
    const endX = cx + Math.cos(ang - 0.15) * (r * 0.48);
    const endY = cy + Math.sin(ang - 0.15) * (r * 0.48);

    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
  });

  ctx.restore();
}

// -------------------------------------------------------------
// HUD TELEMETRY & STUPID HACKATHON GAUGES
// -------------------------------------------------------------

function initTimerLoops() {
  // Update Streak & Compliance Scores every second
  setInterval(() => {
    if (STATE.isLooking) {
      STATE.streakSeconds++;
      if (STATE.streakSeconds > STATE.bestStreakSeconds) {
        STATE.bestStreakSeconds = STATE.streakSeconds;
      }
      STATE.complianceScore = Math.min(100, STATE.complianceScore + 1);
    } else {
      STATE.streakSeconds = 0;
      STATE.complianceScore = Math.max(0, STATE.complianceScore - 4);
    }

    if (streakValEl) streakValEl.textContent = `${STATE.streakSeconds}s`;
    if (violationsValEl) violationsValEl.textContent = STATE.totalViolations;
    if (complianceGauge) {
      complianceGauge.style.width = `${STATE.complianceScore}%`;
      complianceGauge.style.backgroundColor = 
        STATE.complianceScore > 70 ? '#10b981' : 
        STATE.complianceScore > 35 ? '#f59e0b' : '#ef4444';
    }
  }, 1000);
}

function updateHUD(debugReason) {
  const statusBadge = document.getElementById('status-badge');
  if (statusBadge) {
    if (STATE.isLooking) {
      statusBadge.textContent = "🟢 EYE CONTACT MAINTAINED";
      statusBadge.className = "status-badge status-good";
    } else {
      statusBadge.textContent = `🚨 AVERTED: ${debugReason || 'LOOKING AWAY'}`;
      statusBadge.className = "status-badge status-bad";
    }
  }
}

function logTelemetry(msg) {
  if (!telemetryLogEl) return;
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${msg}\n`;
  telemetryLogEl.textContent = line + telemetryLogEl.textContent.slice(0, 1000);
}

// -------------------------------------------------------------
// DEMO MODE & KEYBOARD SHORTCUTS
// -------------------------------------------------------------

function toggleDemoMode() {
  STATE.demoMode = !STATE.demoMode;
  const btn = document.getElementById('demo-mode-btn');
  if (btn) {
    btn.textContent = STATE.demoMode ? "🎮 Exit Demo Mode" : "🎮 Test / Demo Mode";
    btn.classList.toggle('btn-active', STATE.demoMode);
  }
  const demoControls = document.getElementById('demo-controls');
  if (demoControls) {
    demoControls.classList.toggle('hidden', !STATE.demoMode);
  }
  logTelemetry(STATE.demoMode ? "Demo Mode ON. Use buttons or Spacebar to trigger!" : "Demo Mode OFF.");
}

function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Spacebar toggles look-away simulation
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      handleGazeEvaluation(!STATE.isLooking, 0.5, 0.5, "KEYBOARD TOGGLE");
    }
  });

  const simAwayBtn = document.getElementById('sim-away-btn');
  if (simAwayBtn) {
    simAwayBtn.addEventListener('click', () => {
      handleGazeEvaluation(false, 0.2, 0.8, "MANUAL DEMO LOOK AWAY");
    });
  }

  const simReturnBtn = document.getElementById('sim-return-btn');
  if (simReturnBtn) {
    simReturnBtn.addEventListener('click', () => {
      handleGazeEvaluation(true, 0.5, 0.5, "MANUAL DEMO LOOK BACK");
    });
  }
}

// -------------------------------------------------------------
// MEDIA ARSENAL & FILE UPLOADER (PICS & AUDIOS)
// -------------------------------------------------------------

function initMediaUploaderUI() {
  if (imageFileInput) {
    imageFileInput.addEventListener('change', handleImageUpload);
  }
  if (audioFileInput) {
    audioFileInput.addEventListener('change', handleAudioUpload);
  }
}

function handleImageUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const categorySelect = document.getElementById('upload-img-category');
  const captionInput = document.getElementById('upload-img-caption');
  const category = categorySelect ? categorySelect.value : 'lookaway';
  const caption = captionInput && captionInput.value.trim() ? captionInput.value.trim() : 'CUSTOM MEME ATTACK';

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      window.mediaManager.addImage(event.target.result, file.name, category, caption);
      logTelemetry(`📷 Added custom image: ${file.name} [${category}]`);
      renderMediaList();
    };
    reader.readAsDataURL(file);
  });

  e.target.value = '';
}

function handleAudioUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const triggerSelect = document.getElementById('upload-audio-trigger');
  const trigger = triggerSelect ? triggerSelect.value : 'lookaway';

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      window.mediaManager.addAudio(event.target.result, file.name, trigger);
      logTelemetry(`🎵 Added custom audio: ${file.name} [${trigger}]`);
      renderMediaList();
    };
    reader.readAsDataURL(file);
  });

  e.target.value = '';
}

function renderMediaList() {
  const listEl = document.getElementById('media-items-grid');
  if (!listEl || !window.mediaManager) return;

  listEl.innerHTML = '';

  // Render images
  window.mediaManager.images.forEach(img => {
    const card = document.createElement('div');
    card.className = `media-card ${img.active ? 'active' : 'inactive'}`;
    card.innerHTML = `
      <div class="media-thumb-container">
        <img src="${img.src}" onerror="this.src='${img.fallbackSrc || ''}'" class="media-thumb" alt="${img.name}" />
      </div>
      <div class="media-info">
        <strong>${img.name}</strong>
        <span class="badge ${img.category === 'lookaway' ? 'badge-punish' : 'badge-reward'}">
          ${img.category === 'lookaway' ? '🚨 Look Away' : '💖 Look Back'}
        </span>
        <small class="media-caption">"${img.caption}"</small>
      </div>
      <div class="media-actions">
        <button class="btn btn-sm ${img.active ? 'btn-active' : ''}" onclick="window.mediaManager.toggleItem('${img.id}'); renderMediaList();">
          ${img.active ? 'Enabled' : 'Disabled'}
        </button>
        ${img.custom ? `<button class="btn btn-sm btn-danger" onclick="window.mediaManager.deleteItem('${img.id}'); renderMediaList();">Delete</button>` : ''}
      </div>
    `;
    listEl.appendChild(card);
  });

  // Render Audios
  window.mediaManager.customAudios.forEach(aud => {
    const card = document.createElement('div');
    card.className = `media-card ${aud.active ? 'active' : 'inactive'}`;
    card.innerHTML = `
      <div class="media-thumb-container audio-thumb">
        🎵
      </div>
      <div class="media-info">
        <strong>${aud.name}</strong>
        <span class="badge ${aud.trigger === 'lookaway' ? 'badge-punish' : 'badge-reward'}">
          ${aud.trigger === 'lookaway' ? '🚨 Horror Sound' : '💖 Anime Sound'}
        </span>
      </div>
      <div class="media-actions">
        <button class="btn btn-sm" onclick="new Audio('${aud.src}').play()">▶ Test</button>
        <button class="btn btn-sm btn-danger" onclick="window.mediaManager.deleteItem('${aud.id}'); renderMediaList();">Delete</button>
      </div>
    `;
    listEl.appendChild(card);
  });
}

function setupWindowDragDrop() {
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            window.mediaManager.addImage(evt.target.result, file.name, 'lookaway', 'DRAG-AND-DROP MEME');
            logTelemetry(`📥 Dropped new image: ${file.name}`);
            renderMediaList();
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('audio/')) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            window.mediaManager.addAudio(evt.target.result, file.name, 'lookaway');
            logTelemetry(`📥 Dropped new audio: ${file.name}`);
            renderMediaList();
          };
          reader.readAsDataURL(file);
        }
      });
    }
  });
}

// -------------------------------------------------------------
// STUPID HACKATHON CERTIFICATE GENERATOR
// -------------------------------------------------------------

function generateCertificate() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 560;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 800, 560);

  // Gold Border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, 760, 520);
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 736, 496);

  // Title
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF EYE CONTACT SUBMISSION', 400, 95);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px monospace';
  ctx.fillText('Issued by the Ministry of Unblinking Hackathon Compliance', 400, 130);

  // Body
  ctx.fillStyle = '#f8fafc';
  ctx.font = '22px sans-serif';
  ctx.fillText('This officially certifies that', 400, 190);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 38px Impact, sans-serif';
  ctx.fillText('CERTIFIED UNBLINKING SIGMA', 400, 245);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '18px sans-serif';
  ctx.fillText(`Has survived ${STATE.bestStreakSeconds} seconds of unbroken eye contact`, 400, 295);
  ctx.fillText(`With ${STATE.totalViolations} illegal glances punished by Travis Scott Fish`, 400, 325);

  // Seal / Badge
  ctx.beginPath();
  ctx.arc(400, 410, 50, 0, Math.PI * 2);
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('APPROVED', 400, 405);
  ctx.font = '12px sans-serif';
  ctx.fillText('STUPID 2026', 400, 425);

  // Download Trigger
  const link = document.createElement('a');
  link.download = `EyeContact_Compliance_Certificate_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
