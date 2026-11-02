import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const STORAGE_KEY_LEVEL = 'pastel_lumina_level_v1';
const SECONDS_PER_LEVEL = 15 * 3600; // 15 hours = 54,000 active seconds per level
const IDLE_TIMEOUT_MS = 6 * 60 * 1000; // 6 minutes idle tolerance

export const BADGE_TIERS = [
  {
    level: 1,
    hours: 0,
    male: { title: 'Çırak Katip', emoji: '📜', desc: 'Mürekkebin kokusunu yeni alan hevesli yazar' },
    female: { title: 'Çırak Katibe', emoji: '📜', desc: 'Mürekkebin kokusunu yeni alan hevesli yazar' },
    color: '#94A3B8',
    gradient: 'linear-gradient(135deg, #64748B, #94A3B8)'
  },
  {
    level: 2,
    hours: 15,
    male: { title: 'Kağıt Kaşifi', emoji: '🗺️', desc: 'Boş sayfaların haritasını çıkaran gezgin' },
    female: { title: 'Kağıt Kaşifesi', emoji: '🗺️', desc: 'Boş sayfaların haritasını çıkaran gezgin' },
    color: '#38BDF8',
    gradient: 'linear-gradient(135deg, #0284C7, #38BDF8)'
  },
  {
    level: 3,
    hours: 30,
    male: { title: 'Mürekkep Çırağı', emoji: '🖋️', desc: 'Dolma kalemi eline yakıştıran öğrenci' },
    female: { title: 'Mürekkep Çırağı', emoji: '🖋️', desc: 'Dolma kalemi eline yakıştıran öğrenci' },
    color: '#818CF8',
    gradient: 'linear-gradient(135deg, #4F46E5, #818CF8)'
  },
  {
    level: 4,
    hours: 45,
    male: { title: 'Akademi Talebesi', emoji: '🎓', desc: 'Disiplinli not tutan ders tutkunu' },
    female: { title: 'Akademi Talebesi', emoji: '🎓', desc: 'Disiplinli not tutan ders tutkunu' },
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #7E22CE, #C084FC)'
  },
  {
    level: 5,
    hours: 60,
    male: { title: 'Gümüş Divit Ustası', emoji: '✒️', desc: 'Yazısı düzene giren, akıcı yazıcı' },
    female: { title: 'Gümüş Divit Ustası', emoji: '✒️', desc: 'Yazısı düzene giren, akıcı yazıcı' },
    color: '#CBD5E1',
    gradient: 'linear-gradient(135deg, #475569, #CBD5E1)'
  },
  {
    level: 6,
    hours: 75,
    male: { title: 'Kütüphane Bekçisi', emoji: '📚', desc: 'Sessiz odalarda saatlerce kaybolan' },
    female: { title: 'Kütüphane Perisi', emoji: '📚', desc: 'Sessiz odalarda saatlerce kaybolan' },
    color: '#34D399',
    gradient: 'linear-gradient(135deg, #059669, #34D399)'
  },
  {
    level: 7,
    hours: 90,
    male: { title: 'Altın Kalemşör', emoji: '⚔️', desc: 'Kalemi kılıçtan keskin fikir savaşçısı' },
    female: { title: 'Altın Kalemşör', emoji: '⚔️', desc: 'Kalemi kılıçtan keskin fikir savaşçısı' },
    color: '#FBBF24',
    gradient: 'linear-gradient(135deg, #D97706, #FBBF24)'
  },
  {
    level: 8,
    hours: 105,
    male: { title: 'Parşömen Bilgesi', emoji: '📜', desc: 'Sayfaları ilim ve düzenle dolduran' },
    female: { title: 'Parşömen Bilgesi', emoji: '📜', desc: 'Sayfaları ilim ve düzenle dolduran' },
    color: '#FB923C',
    gradient: 'linear-gradient(135deg, #C2410C, #FB923C)'
  },
  {
    level: 9,
    hours: 120,
    male: { title: 'Gece Yazarı', emoji: '🌙', desc: 'Herkes uyurken mum ışığında üreten' },
    female: { title: 'Gece Masalcısı', emoji: '🌙', desc: 'Herkes uyurken mum ışığında üreten' },
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #312E81, #6366F1)'
  },
  {
    level: 10,
    hours: 135,
    male: { title: 'Odak Şövalyesi', emoji: '🛡️', desc: 'Dikkati asla dağılmayan irade timsali' },
    female: { title: 'Odak Leydisi', emoji: '🛡️', desc: 'Dikkati asla dağılmayan irade timsali' },
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #BE185D, #EC4899)'
  },
  {
    level: 11,
    hours: 150,
    male: { title: 'Antik Arşivci', emoji: '🏛️', desc: 'Notlarını geleceğe miras bırakan' },
    female: { title: 'Antik Arşivci', emoji: '🏛️', desc: 'Notlarını geleceğe miras bırakan' },
    color: '#2DD4BF',
    gradient: 'linear-gradient(135deg, #0F766E, #2DD4BF)'
  },
  {
    level: 12,
    hours: 165,
    male: { title: 'Mühür Muhafızı', emoji: '🏷️', desc: 'Gizli fikirleri balmumuyla mühürleyen' },
    female: { title: 'Mühür Muhafızı', emoji: '🏷️', desc: 'Gizli fikirleri balmumuyla mühürleyen' },
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #B91C1C, #EF4444)'
  },
  {
    level: 13,
    hours: 180,
    male: { title: 'Kırtasiye Simyacısı', emoji: '🔮', desc: 'Düşünceleri kağıtta sanata dönüştüren' },
    female: { title: 'Kırtasiye Simyacısı', emoji: '🔮', desc: 'Düşünceleri kağıtta sanata dönüştüren' },
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #6B21A8, #C084FC)'
  },
  {
    level: 14,
    hours: 195,
    male: { title: 'Büyük Hattat', emoji: '🎨', desc: 'Sayfada kusursuz estetik ve ritim' },
    female: { title: 'Büyük Hattate', emoji: '🎨', desc: 'Sayfada kusursuz estetik ve ritim' },
    color: '#F43F5E',
    gradient: 'linear-gradient(135deg, #9F1239, #FB7185)'
  },
  {
    level: 15,
    hours: 210,
    male: { title: 'Zaman Hakimi', emoji: '⏳', desc: 'Saatleri ve dakikaları yöneten usta' },
    female: { title: 'Zaman Hakimesi', emoji: '⏳', desc: 'Saatleri ve dakikaları yöneten usta' },
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #115E59, #2DD4BF)'
  },
  {
    level: 16,
    hours: 225,
    male: { title: 'Lumina Efsanesi', emoji: '👑', desc: '240 saatlik zirveye ulaşmış ebedi üstat' },
    female: { title: 'Lumina Efsanesi', emoji: '👑', desc: '240 saatlik zirveye ulaşmış ebedi üstat' },
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #B45309, #FBBF24, #FDE68A)'
  }
];

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadInitialState() {
  const defaults = {
    totalActiveSeconds: 0,
    gender: 'female', // 'male' | 'female'
    todayKey: getTodayKey(),
    todaySeconds: 0,
    todayTodoCount: 0,
    lastTodoTimestamp: 0,
    weeklySeconds: 0,
    weekStartDate: getTodayKey()
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEVEL);
    if (raw) {
      const parsed = JSON.parse(raw);
      const today = getTodayKey();
      if (parsed.todayKey !== today) {
        parsed.todayKey = today;
        parsed.todaySeconds = 0;
        parsed.todayTodoCount = 0;
      }
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load gamification state:', e);
  }
  return defaults;
}

const state = ref(loadInitialState());
const isIdle = ref(false);
const isWindowVisible = ref(typeof document !== 'undefined' ? !document.hidden : true);
const showLevelUpModal = ref(false);
const newlyUnlockedBadge = ref(null);

let lastActivityTimestamp = Date.now();
let tickInterval = null;
let saveCounter = 0;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY_LEVEL, JSON.stringify(state.value));
  } catch (e) {}
}

// Procedural Level Up Chime (Offline Web Audio API)
function playLevelUpChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.75);
    });
  } catch (e) {}
}

// Procedural Crisp Paper Rustle Sound (Sayfa Çevirme & Yeni Sayfa ASMR)
export function playPaperRustle() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const dur = 0.14;
    const bufLen = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < bufLen; i++) {
      const env = Math.sin((i / bufLen) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1450 + Math.random() * 250;
    filter.Q.value = 1.1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
  } catch (e) {}
}

// Procedural Rubber Stamp Thud Sound (Vintage Kaşe & Balmumu Mühür ASMR)
export function playStampSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // 1. Deep wooden/rubber impact thud (Sine 160Hz -> 40Hz)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(155, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.07);

    oscGain.gain.setValueAtTime(0.9, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);

    // 2. Paper slap texture (Filtered noise transient)
    const slapLen = Math.floor(ctx.sampleRate * 0.025);
    const slapBuf = ctx.createBuffer(1, slapLen, ctx.sampleRate);
    const slapData = slapBuf.getChannelData(0);
    for (let i = 0; i < slapLen; i++) {
      slapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (slapLen * 0.3));
    }
    const slapSrc = ctx.createBufferSource();
    slapSrc.buffer = slapBuf;
    const slapFilter = ctx.createBiquadFilter();
    slapFilter.type = 'bandpass';
    slapFilter.frequency.value = 850;
    const slapGain = ctx.createGain();
    slapGain.gain.setValueAtTime(0.4, now);
    slapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.025);

    slapSrc.connect(slapFilter);
    slapFilter.connect(slapGain);
    slapGain.connect(ctx.destination);
    slapSrc.start(now);
  } catch (e) {}
}

function handleUserActivity() {
  const now = Date.now();
  if (now - lastActivityTimestamp > 1000) {
    lastActivityTimestamp = now;
    if (isIdle.value) {
      isIdle.value = false;
    }
  }
}

// Gamification Singleton Engine Init
if (typeof window !== 'undefined') {
  const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart', 'pointerdown', 'scroll'];
  events.forEach(evt => {
    window.addEventListener(evt, handleUserActivity, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    isWindowVisible.value = !document.hidden;
    if (isWindowVisible.value) {
      handleUserActivity();
    }
  });

  // 1-second Tick
  tickInterval = setInterval(() => {
    const now = Date.now();
    // AFK Check (6 minutes tolerance)
    if (now - lastActivityTimestamp > IDLE_TIMEOUT_MS) {
      isIdle.value = true;
    }

    // Only count if active and window is visible
    if (!isIdle.value && isWindowVisible.value) {
      const prevLevel = Math.min(16, Math.floor(state.value.totalActiveSeconds / SECONDS_PER_LEVEL) + 1);
      state.value.totalActiveSeconds++;
      state.value.todaySeconds++;
      state.value.weeklySeconds++;

      const newLevel = Math.min(16, Math.floor(state.value.totalActiveSeconds / SECONDS_PER_LEVEL) + 1);
      if (newLevel > prevLevel) {
        // Level Up Trigger!
        const tier = BADGE_TIERS.find(b => b.level === newLevel);
        if (tier) {
          newlyUnlockedBadge.value = {
            ...tier,
            rank: state.value.gender === 'male' ? tier.male : tier.female
          };
          showLevelUpModal.value = true;
          playLevelUpChime();
        }
      }

      saveCounter++;
      if (saveCounter >= 10) {
        saveCounter = 0;
        saveState();
      }
    }
  }, 1000);
}

export function useGamification() {
  const currentLevel = computed(() => {
    return Math.min(16, Math.max(1, Math.floor(state.value.totalActiveSeconds / SECONDS_PER_LEVEL) + 1));
  });

  const levelProgressSeconds = computed(() => {
    return state.value.totalActiveSeconds % SECONDS_PER_LEVEL;
  });

  const levelProgressPercent = computed(() => {
    if (currentLevel.value >= 16) return 100;
    return Math.floor((levelProgressSeconds.value / SECONDS_PER_LEVEL) * 100);
  });

  const secondsRemainingInLevel = computed(() => {
    if (currentLevel.value >= 16) return 0;
    return SECONDS_PER_LEVEL - levelProgressSeconds.value;
  });

  const currentBadgeTier = computed(() => {
    const found = BADGE_TIERS.find(b => b.level === currentLevel.value);
    return found || BADGE_TIERS[0];
  });

  const currentTitle = computed(() => {
    const tier = currentBadgeTier.value;
    return state.value.gender === 'male' ? tier.male.title : tier.female.title;
  });

  const currentEmoji = computed(() => {
    const tier = currentBadgeTier.value;
    return state.value.gender === 'male' ? tier.male.emoji : tier.female.emoji;
  });

  const formattedTotalHours = computed(() => {
    const hrs = Math.floor(state.value.totalActiveSeconds / 3600);
    const mins = Math.floor((state.value.totalActiveSeconds % 3600) / 60);
    return `${hrs} sa ${mins} dk`;
  });

  const formattedTodayHours = computed(() => {
    const hrs = Math.floor(state.value.todaySeconds / 3600);
    const mins = Math.floor((state.value.todaySeconds % 3600) / 60);
    return `${hrs} sa ${mins} dk`;
  });

  const formattedWeeklyHours = computed(() => {
    const hrs = Math.floor(state.value.weeklySeconds / 3600);
    const mins = Math.floor((state.value.weeklySeconds % 3600) / 60);
    return `${hrs} sa ${mins} dk`;
  });

  const formattedRemainingTime = computed(() => {
    const rem = secondsRemainingInLevel.value;
    const hrs = Math.floor(rem / 3600);
    const mins = Math.floor((rem % 3600) / 60);
    if (hrs > 0) return `${hrs} sa ${mins} dk`;
    return `${mins} dk`;
  });

  function setGender(gender) {
    if (gender === 'male' || gender === 'female') {
      state.value.gender = gender;
      saveState();
    }
  }

  /**
   * Award XP for completing a To-Do with 3-Layer Anti-Cheat Protection:
   * 1. Max 5 tasks per day give XP.
   * 2. Task must be at least 5 minutes old (cannot create and check in 2 seconds).
   * 3. Cooldown: at least 60 seconds between XP rewards.
   * 4. Task text >= 4 characters.
   */
  function awardTodoXP(todo) {
    if (!todo || !todo.text || todo.text.trim().length < 4) {
      return { success: false, reason: 'Görev çok kısa veya geçersiz' };
    }

    const today = getTodayKey();
    if (state.value.todayKey !== today) {
      state.value.todayKey = today;
      state.value.todaySeconds = 0;
      state.value.todayTodoCount = 0;
    }

    // Lock 1: Daily limit
    if (state.value.todayTodoCount >= 5) {
      return { success: false, reason: 'Günlük görev XP sınırına ulaşıldı (Maks. 5/5)' };
    }

    // Lock 2: Task age (created at least 5 minutes ago)
    const createdAtMs = todo.createdAt ? new Date(todo.createdAt).getTime() : 0;
    const now = Date.now();
    if (!createdAtMs || (now - createdAtMs < 5 * 60 * 1000)) {
      return { success: false, reason: 'Yeni eklenen görevler 5 dakika sonra bonus kazandırır' };
    }

    // Lock 3: Cooldown between rewards (60s)
    if (state.value.lastTodoTimestamp && (now - state.value.lastTodoTimestamp < 60 * 1000)) {
      return { success: false, reason: 'Görev bonusu için lütfen biraz bekleyin' };
    }

    // Reward: 360 seconds (6 minutes of active study)
    const BONUS_SECONDS = 360;
    state.value.totalActiveSeconds += BONUS_SECONDS;
    state.value.todaySeconds += BONUS_SECONDS;
    state.value.weeklySeconds += BONUS_SECONDS;
    state.value.todayTodoCount++;
    state.value.lastTodoTimestamp = now;
    saveState();

    return {
      success: true,
      bonusSeconds: BONUS_SECONDS,
      countToday: state.value.todayTodoCount,
      message: `Görev Bonusu: +6 dk XP! (${state.value.todayTodoCount}/5)`
    };
  }

  function dismissLevelUpModal() {
    showLevelUpModal.value = false;
    newlyUnlockedBadge.value = null;
  }

  return {
    state,
    isIdle,
    isWindowVisible,
    currentLevel,
    levelProgressPercent,
    levelProgressSeconds,
    secondsRemainingInLevel,
    currentBadgeTier,
    currentTitle,
    currentEmoji,
    formattedTotalHours,
    formattedTodayHours,
    formattedWeeklyHours,
    formattedRemainingTime,
    showLevelUpModal,
    newlyUnlockedBadge,
    setGender,
    awardTodoXP,
    dismissLevelUpModal,
    playLevelUpChime
  };
}
