/**
 * Eye Contact Enforcer - Meme & Media Arsenal
 * Manages default memes, user-uploaded pictures, custom audio clips,
 * and localStorage caching for the hackathon webapp.
 */

// Primary default image path uploaded by the user
const DEFAULT_USER_IMAGE = "C:/Users/kaush/.gemini/antigravity/brain/040fa3ac-d6fd-420f-b3da-15071e310721/.user_uploaded/media_1790753273987.png";
const RELATIVE_USER_IMAGE = "travis_fish.png";

// Built-in Hilarious SVG Memes (Zero external dependency fallback)
const BUILTIN_MEMES = {
  // Stylized recreation of Travis Scott Fish with Braids & Diamond Chain
  travisFish: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="500" height="400">
    <defs>
      <radialGradient id="water" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%231a365d"/>
        <stop offset="100%" stop-color="%230a1128"/>
      </radialGradient>
      <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%23b8860b"/>
        <stop offset="50%" stop-color="%238b6914"/>
        <stop offset="100%" stop-color="%234a3508"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%23fff"/>
        <stop offset="30%" stop-color="%23ffd700"/>
        <stop offset="70%" stop-color="%23daa520"/>
        <stop offset="100%" stop-color="%23b8860b"/>
      </linearGradient>
    </defs>
    <rect width="500" height="400" fill="url(%23water)"/>
    <!-- Fish Head/Body -->
    <ellipse cx="250" cy="220" rx="140" ry="160" fill="url(%23skin)" stroke="%23332205" stroke-width="4"/>
    <!-- Travis Braids -->
    <path d="M 180 80 Q 150 160 140 230" stroke="%23111" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M 210 65 Q 185 140 180 220" stroke="%23111" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M 290 65 Q 315 140 320 220" stroke="%23111" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M 320 80 Q 350 160 360 230" stroke="%23111" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M 250 55 Q 250 130 250 190" stroke="%23111" stroke-width="15" fill="none" stroke-linecap="round"/>
    <!-- Human Mouth & Teeth -->
    <ellipse cx="250" cy="290" rx="90" ry="50" fill="%232b1b17"/>
    <path d="M 180 270 Q 250 250 320 270 Q 300 320 250 330 Q 200 320 180 270" fill="%23e8d8c8"/>
    <!-- Teeth -->
    <rect x="220" y="270" width="16" height="22" rx="4" fill="%23fff" stroke="%23bbb"/>
    <rect x="240" y="268" width="18" height="25" rx="4" fill="%23fff" stroke="%23bbb"/>
    <rect x="262" y="270" width="16" height="22" rx="4" fill="%23fff" stroke="%23bbb"/>
    <!-- Fish Eyes staring right into soul -->
    <circle cx="160" cy="180" r="22" fill="%23fff" stroke="%23000" stroke-width="3"/>
    <circle cx="160" cy="180" r="10" fill="%23000"/>
    <circle cx="164" cy="176" r="3" fill="%23fff"/>
    <circle cx="340" cy="180" r="22" fill="%23fff" stroke="%23000" stroke-width="3"/>
    <circle cx="340" cy="180" r="10" fill="%23000"/>
    <circle cx="344" cy="176" r="3" fill="%23fff"/>
    <!-- Diamond Cuban Chain -->
    <path d="M 140 330 Q 250 420 360 330" stroke="url(%23gold)" stroke-width="26" stroke-dasharray="14,6" fill="none"/>
    <text x="250" y="380" font-family="Impact, sans-serif" font-size="28" fill="%23ffd700" text-anchor="middle" stroke="%23000" stroke-width="2">CAUGHT LOOKING AWAY</text>
  </svg>`,

  // The Rock Eyebrow Raise Meme
  theRock: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <rect width="400" height="400" fill="%23111827"/>
    <ellipse cx="200" cy="210" rx="110" ry="140" fill="%23d4a373"/>
    <!-- Raised Right Eyebrow -->
    <path d="M 230 140 Q 290 80 320 130" stroke="%23222" stroke-width="16" fill="none" stroke-linecap="round"/>
    <!-- Flat Left Eyebrow -->
    <path d="M 90 170 Q 140 170 170 175" stroke="%23222" stroke-width="14" fill="none" stroke-linecap="round"/>
    <!-- Eyes -->
    <ellipse cx="130" cy="200" rx="20" ry="12" fill="%23fff"/>
    <circle cx="130" cy="200" r="7" fill="%23222"/>
    <ellipse cx="270" cy="180" rx="26" ry="20" fill="%23fff"/>
    <circle cx="270" cy="180" r="10" fill="%23222"/>
    <!-- Smirk -->
    <path d="M 140 300 Q 220 320 280 270" stroke="%23333" stroke-width="8" fill="none" stroke-linecap="round"/>
    <text x="200" y="370" font-family="Impact, sans-serif" font-size="26" fill="%23f43f5e" text-anchor="middle">🤨 BOOM. VINE BOOM.</text>
  </svg>`,

  // Cute Anime Waifu "Good Boy" Meme
  animeGoodBoy: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%23fce7f3"/>
        <stop offset="100%" stop-color="%23fbcfe8"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(%23pinkGrad)" rx="20"/>
    <!-- Anime Hair Back -->
    <path d="M 80 180 Q 50 350 120 380 Q 280 380 350 350 Q 320 180 300 120 Z" fill="%23ec4899"/>
    <!-- Face -->
    <ellipse cx="200" cy="200" rx="95" ry="105" fill="%23fff1f2"/>
    <!-- Anime Blush -->
    <ellipse cx="140" cy="230" rx="22" ry="12" fill="%23fb7185" opacity="0.6"/>
    <ellipse cx="260" cy="230" rx="22" ry="12" fill="%23fb7185" opacity="0.6"/>
    <!-- Big Sparkly Eyes -->
    <ellipse cx="150" cy="190" rx="26" ry="34" fill="%239333ea"/>
    <circle cx="144" cy="180" r="10" fill="%23fff"/>
    <circle cx="156" cy="202" r="5" fill="%23fff"/>
    <ellipse cx="250" cy="190" rx="26" ry="34" fill="%239333ea"/>
    <circle cx="244" cy="180" r="10" fill="%23fff"/>
    <circle cx="256" cy="202" r="5" fill="%23fff"/>
    <!-- Cute Smile -->
    <path d="M 185 245 Q 200 260 215 245" stroke="%23e11d48" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- Bangs -->
    <path d="M 100 120 Q 150 190 200 130 Q 250 190 300 120 Q 250 80 200 80 Q 150 80 100 120" fill="%23db2777"/>
    <!-- Cat Ears / Ribbon -->
    <polygon points="110,100 70,30 150,60" fill="%23ec4899"/>
    <polygon points="290,100 330,30 250,60" fill="%23ec4899"/>
    <polygon points="115,90 85,45 145,65" fill="%23f472b6"/>
    <polygon points="285,90 315,45 255,65" fill="%23f472b6"/>
    <!-- Sparkles -->
    <text x="70" y="80" font-size="34">✨</text>
    <text x="320" y="80" font-size="34">💖</text>
    <text x="200" y="350" font-family="'Comic Sans MS', cursive, sans-serif" font-size="28" font-weight="bold" fill="%23db2777" text-anchor="middle">GOOD BOYYYY~ ✨</text>
  </svg>`,

  // Crying Cat Thumbs Up Meme
  cryingCat: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <rect width="400" height="400" fill="%231e293b"/>
    <circle cx="200" cy="210" r="100" fill="%23e2e8f0"/>
    <!-- Ears -->
    <polygon points="120,130 90,50 170,115" fill="%23cbd5e1"/>
    <polygon points="280,130 310,50 230,115" fill="%23cbd5e1"/>
    <!-- Watery Crying Glass Eyes -->
    <circle cx="160" cy="190" r="28" fill="%2338bdf8" opacity="0.8"/>
    <circle cx="160" cy="190" r="18" fill="%230284c7"/>
    <circle cx="152" cy="180" r="8" fill="%23fff"/>
    <path d="M 140 215 Q 150 270 145 310" stroke="%2338bdf8" stroke-width="6" fill="none"/>
    <circle cx="240" cy="190" r="28" fill="%2338bdf8" opacity="0.8"/>
    <circle cx="240" cy="190" r="18" fill="%230284c7"/>
    <circle cx="232" cy="180" r="8" fill="%23fff"/>
    <path d="M 260 215 Q 250 270 255 310" stroke="%2338bdf8" stroke-width="6" fill="none"/>
    <!-- Trembling smile -->
    <path d="M 180 250 Q 200 240 220 250" stroke="%23475569" stroke-width="5" fill="none"/>
    <!-- Thumbs up -->
    <text x="290" y="320" font-size="60">👍</text>
    <text x="200" y="365" font-family="Impact, sans-serif" font-size="24" fill="%2338bdf8" text-anchor="middle">STARE RESUMED (BARELY)</text>
  </svg>`
};

class MediaManager {
  constructor() {
    this.STORAGE_KEY_IMAGES = 'eye_contact_custom_images';
    this.STORAGE_KEY_AUDIO = 'eye_contact_custom_audios';
    
    // Default image entries
    this.images = [
      {
        id: 'travis-fish',
        name: 'Travis Scott Fish (Primary Attached)',
        src: DEFAULT_USER_IMAGE,
        fallbackSrc: BUILTIN_MEMES.travisFish,
        category: 'lookaway', // 'lookaway' or 'lookback'
        caption: 'BRO LOOKED AWAY FROM TRAVIS FISH 💀',
        isDefault: true,
        active: true
      },
      {
        id: 'the-rock',
        name: 'The Rock Eyebrow Vine Boom',
        src: BUILTIN_MEMES.theRock,
        fallbackSrc: BUILTIN_MEMES.theRock,
        category: 'lookaway',
        caption: 'SUSPICIOUS GLANCE DETECTED 🤨',
        isDefault: false,
        active: true
      },
      {
        id: 'crying-cat',
        name: 'Crying Cat Stare',
        src: BUILTIN_MEMES.cryingCat,
        fallbackSrc: BUILTIN_MEMES.cryingCat,
        category: 'lookaway',
        caption: 'WHY ARE YOU LOOKING AWAY 😭',
        isDefault: false,
        active: true
      }
    ];

    // Custom audio clips uploaded by user
    this.customAudios = [];
    
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const storedImgs = localStorage.getItem(this.STORAGE_KEY_IMAGES);
      if (storedImgs) {
        const parsed = JSON.parse(storedImgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Prepend user stored images while preserving defaults
          this.images = [...parsed, ...this.images.filter(img => !parsed.some(p => p.id === img.id))];
        }
      }

      const storedAudio = localStorage.getItem(this.STORAGE_KEY_AUDIO);
      if (storedAudio) {
        const parsedAudio = JSON.parse(storedAudio);
        if (Array.isArray(parsedAudio)) {
          this.customAudios = parsedAudio;
        }
      }
    } catch (e) {
      console.warn("Storage loading failed, using defaults:", e);
    }
  }

  saveToStorage() {
    try {
      // Save only user added images or settings
      const toSaveImgs = this.images.filter(img => !img.isDefault || img.custom);
      localStorage.setItem(this.STORAGE_KEY_IMAGES, JSON.stringify(toSaveImgs));
      localStorage.setItem(this.STORAGE_KEY_AUDIO, JSON.stringify(this.customAudios));
    } catch (e) {
      console.warn("Failed saving to localStorage (likely quota limit with large files):", e);
    }
  }

  /**
   * Get primary image for look-away jumpscare
   */
  getPrimaryLookAwayImage() {
    const list = this.images.filter(img => img.category === 'lookaway' && img.active);
    // Prefer Travis Fish if active
    const travis = list.find(img => img.id === 'travis-fish');
    if (travis) return travis;
    if (list.length > 0) return list[Math.floor(Math.random() * list.length)];
    return {
      src: BUILTIN_MEMES.travisFish,
      caption: 'BRO LOOKED AWAY 💀'
    };
  }

  /**
   * Get primary image for look-back anime reward
   */
  getPrimaryLookBackImage() {
    const list = this.images.filter(img => img.category === 'lookback' && img.active);
    const anime = list.find(img => img.id === 'anime-good-boy');
    if (anime) return anime;
    if (list.length > 0) return list[Math.floor(Math.random() * list.length)];
    return {
      src: BUILTIN_MEMES.animeGoodBoy,
      caption: 'GOOD BOYYYY~ ✨'
    };
  }

  /**
   * Add a custom image (uploaded by user)
   */
  addImage(fileOrDataUrl, name, category = 'lookaway', caption = 'CUSTOM MEME ATTACK') {
    const newId = 'custom-img-' + Date.now();
    const item = {
      id: newId,
      name: name || 'Uploaded Meme',
      src: fileOrDataUrl,
      fallbackSrc: BUILTIN_MEMES.theRock,
      category: category,
      caption: caption,
      custom: true,
      active: true
    };
    this.images.unshift(item);
    this.saveToStorage();
    return item;
  }

  /**
   * Add custom audio clip (uploaded by user)
   */
  addAudio(dataUrl, name, trigger = 'lookaway') {
    const newId = 'custom-audio-' + Date.now();
    const item = {
      id: newId,
      name: name || 'Custom Sound',
      src: dataUrl,
      trigger: trigger, // 'lookaway' or 'lookback'
      active: true
    };
    this.customAudios.unshift(item);
    this.saveToStorage();
    return item;
  }

  /**
   * Play custom audio if available, returns true if custom audio played
   */
  playCustomAudio(trigger = 'lookaway') {
    const matches = this.customAudios.filter(a => a.trigger === trigger && a.active);
    if (matches.length === 0) return false;
    const chosen = matches[Math.floor(Math.random() * matches.length)];
    try {
      const audio = new Audio(chosen.src);
      audio.volume = window.soundEngine ? window.soundEngine.volume : 0.9;
      audio.play().catch(e => console.warn("Custom audio play error:", e));
      return true;
    } catch (e) {
      console.warn("Could not play custom audio:", e);
      return false;
    }
  }

  deleteItem(id) {
    this.images = this.images.filter(img => img.id !== id);
    this.customAudios = this.customAudios.filter(a => a.id !== id);
    this.saveToStorage();
  }

  toggleItem(id) {
    const img = this.images.find(i => i.id === id);
    if (img) img.active = !img.active;
    const aud = this.customAudios.find(a => a.id === id);
    if (aud) aud.active = !aud.active;
    this.saveToStorage();
  }
}

// Global instance
window.mediaManager = new MediaManager();
