<template>
  <div ref="widgetRef" class="pomodoro-widget" :class="{ 'is-running': isRunning, 'is-break': isBreak }">
    <button type="button" class="timer-pill" @click="toggleMenu" :title="isBreak ? 'Mola Vakti!' : 'Odaklanma Zamanı'">
      <Timer :size="15" class="timer-icon" />
      <span class="timer-digits">{{ formattedTime }}</span>
      <span class="mode-tag">{{ isBreak ? 'Mola' : 'Odak' }}</span>
    </button>

    <!-- Dropdown Controls Popup -->
    <div v-if="isOpen" class="pomodoro-popup" @click.stop @pointerdown.stop>
      <div class="popup-header">
        <span class="popup-title">⏱️ Pomodoro Sayacı</span>
        <button type="button" class="popup-close" @click="isOpen = false" title="Kapat">&times;</button>
      </div>

      <div class="popup-timer-display">
        <div class="big-digits">{{ formattedTime }}</div>
        <span class="state-label">{{ isBreak ? `☕ ${breakDurationMinutes} Dk Dinlenme` : `🎯 ${workDurationMinutes} Dk Odaklanma` }}</span>
      </div>

      <!-- Quick Preset & Custom Minutes Selector -->
      <div class="duration-selector-box">
        <div class="sel-row-header">
          <span>{{ isBreak ? 'Mola Süresi' : 'Odak Süresi' }}</span>
          <div class="mini-stepper">
            <button type="button" class="mini-step-btn" @click="stepCustomMinutes(-1)">-</button>
            <span class="mini-step-val">{{ isBreak ? breakDurationMinutes : workDurationMinutes }} dk</span>
            <button type="button" class="mini-step-btn" @click="stepCustomMinutes(1)">+</button>
          </div>
        </div>

        <div class="chips-row">
          <button
            v-for="mins in (isBreak ? [3, 5, 10, 15] : [15, 25, 45, 60])"
            :key="mins"
            type="button"
            class="p-chip"
            :class="{ active: (isBreak ? breakDurationMinutes : workDurationMinutes) === mins }"
            @click="setDuration(mins)"
          >
            {{ mins }} dk
          </button>
        </div>
      </div>

      <div class="popup-controls">
        <button class="ctrl-btn main-btn" @click="toggleTimer">
          <component :is="isRunning ? Pause : Play" :size="16" />
          <span>{{ isRunning ? 'Duraklat' : 'Başlat' }}</span>
        </button>
        <button class="ctrl-btn reset-btn" @click="resetTimer" title="Sıfırla">
          <RotateCcw :size="15" />
        </button>
        <button class="ctrl-btn switch-btn" @click="switchMode" title="Mola / Odak Geç">
          <Coffee v-if="!isBreak" :size="15" />
          <Brain v-else :size="15" />
        </button>
      </div>

      <div class="pomodoro-stats">
        <span>Tamamlanan: <strong>{{ completedSessions }}</strong> Seans</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from '@lucide/vue';

const workDurationMinutes = ref(parseInt(localStorage.getItem('lumina_pomo_work_min') || '25', 10));
const breakDurationMinutes = ref(parseInt(localStorage.getItem('lumina_pomo_break_min') || '5', 10));

const widgetRef = ref(null);
const isBreak = ref(false);
const timeLeft = ref((isBreak.value ? breakDurationMinutes.value : workDurationMinutes.value) * 60);
const isRunning = ref(false);
const isOpen = ref(false);
const completedSessions = ref(0);
let intervalId = null;

function setDuration(mins) {
  if (isBreak.value) {
    breakDurationMinutes.value = mins;
    try { localStorage.setItem('lumina_pomo_break_min', String(mins)); } catch (e) {}
  } else {
    workDurationMinutes.value = mins;
    try { localStorage.setItem('lumina_pomo_work_min', String(mins)); } catch (e) {}
  }
  if (!isRunning.value) {
    resetTimer();
  }
}

function stepCustomMinutes(delta) {
  if (isBreak.value) {
    const next = Math.min(60, Math.max(1, breakDurationMinutes.value + delta));
    setDuration(next);
  } else {
    const next = Math.min(180, Math.max(1, workDurationMinutes.value + delta));
    setDuration(next);
  }
}

function handleOutsidePointer(e) {
  if (isOpen.value && widgetRef.value && !widgetRef.value.contains(e.target)) {
    isOpen.value = false;
  }
}

function handleEscape(e) {
  if (e.key === 'Escape' && isOpen.value) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    isOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('pointerdown', handleOutsidePointer);
  window.addEventListener('keydown', handleEscape, true);
});

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function toggleTimer() {
  if (isRunning.value) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  isRunning.value = true;
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      // Completed session!
      playNotification();
      if (!isBreak.value) {
        completedSessions.value++;
        isBreak.value = true;
        timeLeft.value = breakDurationMinutes.value * 60;
      } else {
        isBreak.value = false;
        timeLeft.value = workDurationMinutes.value * 60;
      }
      pauseTimer();
    }
  }, 1000);
}

function pauseTimer() {
  isRunning.value = false;
  clearInterval(intervalId);
}

function resetTimer() {
  pauseTimer();
  timeLeft.value = (isBreak.value ? breakDurationMinutes.value : workDurationMinutes.value) * 60;
}

function switchMode() {
  pauseTimer();
  isBreak.value = !isBreak.value;
  timeLeft.value = (isBreak.value ? breakDurationMinutes.value : workDurationMinutes.value) * 60;
}

function playNotification() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {}
}

onBeforeUnmount(() => {
  clearInterval(intervalId);
  window.removeEventListener('pointerdown', handleOutsidePointer);
  window.removeEventListener('keydown', handleEscape, true);
});
</script>

<style scoped>
.pomodoro-widget {
  position: relative;
}

.timer-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface-subtle, #f1f5f9);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 999px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-main, #0f172a);
  transition: all 0.2s ease;
}

.timer-pill:hover {
  background: var(--bg-surface, white);
  border-color: var(--color-primary, #3b82f6);
}

.pomodoro-widget.is-running .timer-pill {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.pomodoro-widget.is-break .timer-pill {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.timer-icon {
  color: inherit;
}

.mode-tag {
  font-size: 10px;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 5px;
  border-radius: 4px;
}

[data-theme="dark"] .mode-tag {
  background: rgba(255, 255, 255, 0.12);
}

/* Popup */
.pomodoro-popup {
  position: absolute;
  top: 42px;
  right: 0;
  width: 230px;
  background: var(--bg-surface, white);
  border-radius: 16px;
  box-shadow: 0 16px 30px -4px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 16px;
  z-index: 100;
  animation: popIn 0.15s ease-out;
}

@keyframes popIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.popup-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-main, #0f172a);
}

.popup-close {
  background: transparent;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.popup-timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.big-digits {
  font-size: 38px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
  color: var(--color-text-main, #0f172a);
}

.state-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted, #64748b);
  margin-top: 2px;
}

.duration-selector-box {
  margin-top: 10px;
  background: var(--bg-surface-subtle, rgba(0, 0, 0, 0.04));
  border-radius: 10px;
  padding: 8px;
}

.sel-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 6px;
}

.mini-stepper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-step-btn {
  background: var(--bg-surface, white);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
  color: var(--color-text-main, #0f172a);
}

.mini-step-val {
  font-size: 11px;
  font-weight: 700;
  min-width: 38px;
  text-align: center;
}

.chips-row {
  display: flex;
  gap: 4px;
}

.p-chip {
  flex: 1;
  padding: 4px 2px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-surface, white);
  color: var(--color-text-muted, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.p-chip.active {
  background: var(--color-primary, #7c3aed);
  color: white;
  border-color: var(--color-primary, #7c3aed);
}

.popup-controls {
  display: flex;
  gap: 6px;
  margin-top: 14px;
}

.ctrl-btn {
  border-radius: 8px;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-surface-subtle, #f8fafc);
  color: var(--color-text-main, #0f172a);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.ctrl-btn:hover {
  background: #e2e8f0;
}

[data-theme="dark"] .ctrl-btn:hover {
  background: #334155;
}

.main-btn {
  flex: 1;
  background: var(--color-primary, #2563eb);
  color: white;
  border-color: var(--color-primary, #2563eb);
}

.main-btn:hover {
  background: #1d4ed8;
}

.pomodoro-stats {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color, #e2e8f0);
  text-align: center;
  font-size: 11px;
  color: var(--color-text-muted, #64748b);
}
</style>
