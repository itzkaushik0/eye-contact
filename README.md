# 👁️ Eye Contact Enforcer (Stupid Hackathon Edition)

> An unhinged, fully-responsive AI webapp that detects whether you're making direct eye contact with your screen. Look away, and a giant animated pair of demonic eyeballs stares into your soul alongside the legendary **Travis Scott Fish Meme** while an unsettling voice proclaims: *"I see you."* When you look back at the camera, everything immediately silences and returns cleanly to usual!

---

## 🚀 Instant Launch

1. Open `index.html` in your favorite web browser (Google Chrome, Microsoft Edge, Brave, etc.).
   - *Option A*: Double-click `index.html` directly.
   - *Option B*: Serve via VS Code Live Server or any local server (`http://localhost:5500`).
2. Click **"📹 Start Camera"** to grant webcam access for real-time neural face & eye tracking.
3. **No camera or testing on stage?** Click **"🎮 Test / Demo Mode"** or press **Spacebar** to simulate looking away and looking back instantly!

## 🚪 Pre-Flight Intent Screening: Doomscroll vs. Improve ($67.67)

When you first open the webapp, you are presented with two choices:
1. **📈 Self-Improvement ($67.67 Subscription Window)**:
   - Opens **ONLY** the Subscription Plan Window.
   - **Zero camera window, zero camera buttons, zero camera feed**.
   - Displays the satirical $67.67 plan, fake payment checkout, and option to switch to Doomscroll mode.
2. **🧟‍♂️ Doomscrolling (Usual Window)**:
   - Opens the **usual Eye Contact Enforcer window** with the camera window, "📹 Start Camera" button, face tracking, Travis Scott fish meme, and audio.

---

## 🎯 How It Works

### 1. Neural Eye & Head Pose Tracking
- Powered by **Google MediaPipe FaceMesh** via CDN (468 3D landmarks + iris tracking points `468`–`477`).
- Monitors:
  - **Head Yaw**: Detects when you turn your head left or right.
  - **Head Pitch**: Detects when you glance down at your phone or keyboard.
  - **Iris Gaze Vector**: Detects side-eyeing even when your head is facing forward.
  - **Optical Presence Fallback**: Built-in canvas differential tracker runs seamlessly if the neural network is loading or camera lighting is low.

### 2. The Look-Away Horror Punishment 🚨
- Screen turns dark with pulsing red emergency vignette & CRT scanline jitter.
- **TOTAL SCREEN COVERAGE (100vw × 100vh)**:
  - **Travis Scott Fish Meme**: Consumes the **entire full screen** with high-contrast zoom vibrations and massive flashing text: *"BRO LOOKED AWAY FROM TRAVIS SCOTT FISH 💀"*.
  - **Giant Animated Creepy Eyes**: Colossal procedural eyeballs stretching across the **entire display width and height**, with pulsating bloodshot veins, dilated pupils tracking your gaze, and ominous red glow!
- **Sequential Audio**:
  1. *Immediate*: Horror bass strike & dissonant stinger chord.
  2. *Continuous*: Deep demonic robotic voice speaks: *"I see you."* (repeating every 3.2s with alternating creepy lines) alongside low-frequency heartbeat thumping until you return!

### 3. The Return to Usual 🟢
- The instant you look back at the camera:
  - All horror audio and creepy voices are **instantly silenced**.
  - The giant staring eyes and Travis Scott Fish vanish immediately.
  - The screen returns completely to its usual, clean state.
  - Your eye contact streak resumes counting up!

---

## 📁 Media Arsenal: Adding Custom Pictures & Audios

You can share pictures and audios in two ways:
1. **Upload via UI**: Click **"📁 Media Arsenal"** in the top bar:
   - **Upload Pictures** (PNG, JPG, GIF, WebP) and assign them to *Look Away Punishment* with custom captions!
   - **Upload Audios** (MP3, WAV, OGG) to play custom sounds for look-away jumpscares.
2. **Drag & Drop**: Simply drag and drop any image or audio file directly onto the browser window at any time!
3. **Persistence**: Custom uploads are saved automatically to browser `localStorage` so they stay loaded even when refreshed.

---

## 🏆 Stupid Hackathon Bonus Features
- **Stare-O-Meter 3000™**: Real-time eye contact compliance gauge (0% to 100%).
- **Telemetry HUD**: Live tracking of current stare streak, best record, and unlawful blink count.
- **Official Compliance Certificate**: Click **"📜 Get Certificate"** to export an official high-resolution meme certificate certifying your status as a "Certified Unblinking Sigma" for hackathon presentation slides.
