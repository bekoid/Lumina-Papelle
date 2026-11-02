<template>
  <Teleport to="body">
    <Transition name="lumina-modal">
      <div v-if="isOpen" class="badges-backdrop" @click.self="$emit('close')">
        <div class="badges-glass-modal" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <div class="header-brand">
              <div class="header-orb" :style="{ background: currentBadgeTier.gradient }">
                <span class="orb-emoji">{{ currentEmoji }}</span>
              </div>
              <div>
                <div class="title-row">
                  <h2 class="modal-title">{{ currentTitle }}</h2>
                  <span class="level-badge" :style="{ background: currentBadgeTier.color }">
                    Seviye {{ currentLevel }}
                  </span>
                </div>
                <p class="modal-subtitle">
                  Haftalık düzenli odaklanma ve ustalık seviyeniz • 1 Seviye = 15 Saat
                </p>
              </div>
            </div>

            <button class="close-pill-btn" @click="$emit('close')" title="Kapat (ESC)">
              <X :size="18" />
            </button>
          </div>

          <!-- Progress Overview Card -->
          <div class="progress-hero-card">
            <div class="hero-top-row">
              <div class="hero-stat">
                <span class="stat-label">BU HAFTA</span>
                <strong class="stat-val">{{ formattedWeeklyHours }}</strong>
              </div>
              <div class="hero-stat">
                <span class="stat-label">BUGÜN</span>
                <strong class="stat-val">{{ formattedTodayHours }}</strong>
              </div>
              <div class="hero-stat">
                <span class="stat-label">TOPLAM ODAK</span>
                <strong class="stat-val">{{ formattedTotalHours }}</strong>
              </div>
            </div>

            <!-- Big Live Progress Bar -->
            <div class="progress-bar-shell">
              <div
                class="progress-bar-fill"
                :style="{
                  width: `${levelProgressPercent}%`,
                  background: currentBadgeTier.gradient
                }"
              ></div>
            </div>

            <div class="hero-footer-row">
              <span class="progress-text">
                Seviye {{ currentLevel }} İlerlemesi: <strong>%{{ levelProgressPercent }}</strong>
              </span>
              <span class="status-indicator" :class="{ 'is-afk': isIdle, 'is-active': !isIdle }">
                <span class="status-dot"></span>
                <span>{{ isIdle ? 'Dinleniyor (AFK)' : 'Aktif Odaklanılıyor' }}</span>
              </span>
            </div>
          </div>

          <!-- Gender / Persona Switcher Row -->
          <div class="persona-switch-row">
            <span class="section-label">ROZET & UNVAN KOLEKSİYONU (16 SEVİYE)</span>
            <div class="gender-segmented-pill">
              <button
                class="gender-btn"
                :class="{ active: state.gender === 'female' }"
                @click="setGender('female')"
              >
                <span>👩 Kadın Unvanları</span>
              </button>
              <button
                class="gender-btn"
                :class="{ active: state.gender === 'male' }"
                @click="setGender('male')"
              >
                <span>👨 Erkek Unvanları</span>
              </button>
            </div>
          </div>

          <!-- 16 Badges Grid -->
          <div class="badges-grid-container">
            <div
              v-for="b in BADGE_TIERS"
              :key="b.level"
              class="badge-card"
              :class="{
                unlocked: currentLevel >= b.level,
                current: currentLevel === b.level,
                locked: currentLevel < b.level
              }"
            >
              <div class="badge-icon-box" :style="currentLevel >= b.level ? { background: b.gradient } : {}">
                <span v-if="currentLevel >= b.level" class="badge-emoji">
                  {{ state.gender === 'male' ? b.male.emoji : b.female.emoji }}
                </span>
                <Lock v-else :size="20" class="lock-icon" />
              </div>

              <div class="badge-info">
                <div class="badge-title-row">
                  <span class="badge-level-tag">Lv. {{ b.level }}</span>
                  <h4 class="badge-name">
                    {{ state.gender === 'male' ? b.male.title : b.female.title }}
                  </h4>
                </div>
                <p class="badge-desc">
                  {{ state.gender === 'male' ? b.male.desc : b.female.desc }}
                </p>
                <div class="badge-requirement">
                  <span v-if="currentLevel >= b.level" class="unlocked-tag">
                    <Check :size="12" stroke-width="3" /> Açıldı ({{ b.hours }}s+)
                  </span>
                  <span v-else class="locked-tag">
                    {{ b.hours }} saat aktif çalışma gerekir
                  </span>
                </div>
              </div>

              <div v-if="currentLevel === b.level" class="current-pulse-ring"></div>
            </div>
          </div>
        </div>

        <!-- Level Up Celebratory Card Overlay -->
        <Transition name="level-pop">
          <div v-if="showLevelUpModal && newlyUnlockedBadge" class="level-up-overlay" @click.stop>
            <div class="level-up-card">
              <div class="sparkles-halo">✨ 🏆 ✨</div>
              <div class="level-up-icon" :style="{ background: newlyUnlockedBadge.gradient }">
                <span>{{ newlyUnlockedBadge.rank.emoji }}</span>
              </div>
              <h2 class="level-up-heading">TEBRİKLER! SEVİYE ATLADINIZ</h2>
              <h3 class="level-up-title">{{ newlyUnlockedBadge.rank.title }}</h3>
              <p class="level-up-sub">{{ newlyUnlockedBadge.rank.desc }}</p>
              <span class="level-up-hours">{{ newlyUnlockedBadge.hours }} saatlik muazzam odaklanma tamamlandı!</span>
              <button class="level-up-claim-btn" @click="dismissLevelUpModal">
                Yolculuğa Devam Et
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { X, Lock, Check } from '@lucide/vue';
import { useGamification, BADGE_TIERS } from '../composables/useGamification.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const {
  state,
  isIdle,
  currentLevel,
  levelProgressPercent,
  currentBadgeTier,
  currentTitle,
  currentEmoji,
  formattedTotalHours,
  formattedTodayHours,
  formattedWeeklyHours,
  showLevelUpModal,
  newlyUnlockedBadge,
  setGender,
  dismissLevelUpModal
} = useGamification();

function onKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    if (showLevelUpModal.value) {
      dismissLevelUpModal();
    } else {
      emit('close');
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown, true));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true));
</script>

<style scoped>
.badges-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: rgba(15, 12, 24, 0.45);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.badges-glass-modal {
  width: 100%;
  max-width: 780px;
  max-height: 88vh;
  background: var(--bg-surface);
  backdrop-filter: blur(36px) saturate(180%);
  border: 1px solid var(--border-glass);
  border-radius: 28px;
  box-shadow:
    0 28px 70px -12px rgba(0, 0, 0, 0.35),
    0 0 0 1px var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPopIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 14px 24px;
  border-bottom: 1px solid var(--border-color);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-orb {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.25);
}

.orb-emoji {
  font-size: 26px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.3px;
}

.level-badge {
  font-size: 11px;
  font-weight: 800;
  color: #FFFFFF;
  padding: 3px 9px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.modal-subtitle {
  margin: 3px 0 0 0;
  font-size: 12.5px;
  color: var(--color-text-muted);
}

.close-pill-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s ease;
}

.close-pill-btn:hover {
  background: var(--bg-hover);
  color: var(--color-text-main);
  transform: rotate(90deg);
}

/* Progress Hero Card */
.progress-hero-card {
  margin: 16px 24px 8px 24px;
  padding: 16px 18px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-top-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

.stat-val {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text-main);
}

.stat-val.highlight {
  color: var(--color-primary);
}

.progress-bar-shell {
  width: 100%;
  height: 9px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.hero-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
}

.progress-text {
  color: var(--color-text-muted);
}

.progress-text strong {
  color: var(--color-text-main);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 11px;
}

.status-indicator .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.is-active {
  color: #059669;
}

.status-indicator.is-active .status-dot {
  background: #10B981;
  box-shadow: 0 0 6px #10B981;
}

.status-indicator.is-afk {
  color: #D97706;
}

.status-indicator.is-afk .status-dot {
  background: #F59E0B;
}

/* Persona Switcher */
.persona-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px 6px 24px;
}

.section-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

.gender-segmented-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  border-radius: 999px;
}

.gender-btn {
  padding: 5px 12px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
}

.gender-btn.active {
  background: var(--color-primary);
  color: #FFFFFF;
  box-shadow: 0 2px 6px var(--color-primary-soft);
}

/* Badges Grid */
.badges-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 24px 24px 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.badge-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-surface-subtle);
  position: relative;
  transition: all 0.2s ease;
}

.badge-card.unlocked {
  border-color: rgba(255, 255, 255, 0.2);
  background: var(--bg-surface);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08);
}

.badge-card.current {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.badge-card.locked {
  opacity: 0.65;
  filter: grayscale(40%);
}

.badge-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.badge-emoji {
  font-size: 24px;
}

.lock-icon {
  color: var(--color-text-muted);
}

.badge-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.badge-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-level-tag {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 5px;
  border-radius: 5px;
}

.badge-name {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-desc {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-requirement {
  margin-top: 2px;
  font-size: 10.5px;
}

.unlocked-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #059669;
  font-weight: 700;
}

.locked-tag {
  color: var(--color-text-muted);
  font-weight: 600;
}

/* Level Up Popover */
.level-up-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 12, 24, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.level-up-card {
  width: 100%;
  max-width: 380px;
  background: var(--bg-surface);
  border: 2px solid var(--color-primary);
  border-radius: 28px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: levelPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes levelPopIn {
  from {
    transform: scale(0.85) translateY(12px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.sparkles-halo {
  font-size: 24px;
}

.level-up-icon {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.3);
  margin-bottom: 6px;
}

.level-up-heading {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--color-primary);
  margin: 0;
}

.level-up-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text-main);
  margin: 0;
}

.level-up-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.level-up-hours {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  margin: 6px 0 12px 0;
}

.level-up-claim-btn {
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  border: none;
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px var(--color-primary-soft);
  transition: transform 0.16s ease;
}

.level-up-claim-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .badges-grid-container {
    grid-template-columns: 1fr;
  }
  .hero-top-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
