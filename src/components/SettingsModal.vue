<template>
  <Teleport to="body">
    <Transition name="lumina-modal">
      <div v-if="isOpen" class="settings-backdrop" @click.self="$emit('close')">
        <div class="settings-glass-modal" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-brand">
              <div class="header-icon-orb">
                <Sparkles :size="18" />
              </div>
              <div>
                <h2 class="modal-title">Lumina Stüdyo & Ayarlar</h2>
                <p class="modal-subtitle">Atmosfer, sayfa düzeni ve çalışma alanı tercihleriniz</p>
              </div>
            </div>

            <button class="close-pill-btn" @click="$emit('close')" title="Kapat (ESC)">
              <X :size="18" />
            </button>
          </div>

          <!-- Category Tabs -->
          <div class="settings-tabs">
            <button
              class="s-tab-btn"
              :class="{ active: activeTab === 'themes' }"
              @click="activeTab = 'themes'"
            >
              <Palette :size="15" />
              <span>Atmosfer & Temalar</span>
            </button>
            <button
              class="s-tab-btn"
              :class="{ active: activeTab === 'workspace' }"
              @click="activeTab = 'workspace'"
            >
              <Layout :size="15" />
              <span>Çalışma Alanı & Defter</span>
            </button>
            <button
              class="s-tab-btn"
              :class="{ active: activeTab === 'focus' }"
              @click="activeTab = 'focus'"
            >
              <Headphones :size="15" />
              <span>Odak Sesi & Yedekleme</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="settings-body">
            <!-- TAB 1: THEMES & ATMOSPHERE -->
            <div v-if="activeTab === 'themes'" class="tab-pane">
              <!-- Row 1: Light/Dark + Normal/Gradient Dual Segmented Controls -->
              <div class="dual-mode-grid">
                <!-- Light vs Dark -->
                <div class="control-card">
                  <span class="control-label">IŞIK MODU</span>
                  <div class="segmented-pill">
                    <button
                      class="seg-btn"
                      :class="{ active: !settings.isDarkMode }"
                      @click="setDarkMode(false)"
                    >
                      <Sun :size="15" />
                      <span>Açık Pastel</span>
                    </button>
                    <button
                      class="seg-btn"
                      :class="{ active: settings.isDarkMode }"
                      @click="setDarkMode(true)"
                    >
                      <Moon :size="15" />
                      <span>Koyu Pastel</span>
                    </button>
                  </div>
                </div>

                <!-- Solid vs Gradient -->
                <div class="control-card">
                  <span class="control-label">RENK DOKUSU</span>
                  <div class="segmented-pill">
                    <button
                      class="seg-btn"
                      :class="{ active: settings.isGradient }"
                      @click="setGradientMode(true)"
                    >
                      <Sparkles :size="15" />
                      <span>Geçişli (Gradyan)</span>
                    </button>
                    <button
                      class="seg-btn"
                      :class="{ active: !settings.isGradient }"
                      @click="setGradientMode(false)"
                    >
                      <Circle :size="15" />
                      <span>Normal (Düz)</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Themes Collection Grid -->
              <div class="section-heading-row">
                <span class="section-label">PASTEL & KLASİK TEMA KOLEKSİYONU (11 TEMA)</span>
                <span class="section-hint">
                  {{ settings.isDarkMode ? 'Kadife Gece Tonları' : 'Ferah Gündüz Tonları' }} •
                  {{ settings.isGradient ? 'İpek Geçişli' : 'Saf Düz' }}
                </span>
              </div>

              <div class="themes-nine-grid">
                <button
                  v-for="theme in PASTEL_THEMES"
                  :key="theme.id"
                  class="theme-preview-card"
                  :class="{ active: settings.themeId === theme.id }"
                  @click="setTheme(theme.id)"
                >
                  <div
                    class="theme-swatch-canvas"
                    :style="getSwatchStyle(theme)"
                  >
                    <!-- Mini Faux Glass UI Preview inside swatch -->
                    <div
                      class="mini-glass-sheet"
                      :style="{
                        background: (settings.isDarkMode ? theme.dark : theme.light).surfaceGlassStrong,
                        borderColor: (settings.isDarkMode ? theme.dark : theme.light).borderSubtle
                      }"
                    >
                      <span
                        class="mini-accent-pill"
                        :style="{ background: (settings.isDarkMode ? theme.dark : theme.light).accent }"
                      ></span>
                      <span
                        class="mini-line"
                        :style="{ background: (settings.isDarkMode ? theme.dark : theme.light).textMuted }"
                      ></span>
                    </div>

                    <div
                      v-if="settings.themeId === theme.id"
                      class="theme-check-badge"
                      :style="{ background: (settings.isDarkMode ? theme.dark : theme.light).accent }"
                    >
                      <Check :size="12" stroke-width="3" />
                    </div>
                  </div>

                  <div class="theme-meta">
                    <div class="theme-name-row">
                      <span class="theme-emoji">{{ theme.emoji }}</span>
                      <span class="theme-title">{{ theme.name }}</span>
                    </div>
                    <span class="theme-sub">{{ theme.subtitle }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- TAB 2: WORKSPACE & NOTEBOOK DEFAULTS -->
            <div v-else-if="activeTab === 'workspace'" class="tab-pane">
              <!-- Adaptive Panels Toggle -->
              <div class="setting-row-card">
                <div class="setting-info">
                  <h4>Geniş Ekranda Panelleri Açık Başlat</h4>
                  <p>Büyük ekranlarda sol Kitaplık ve sağ Yapılacaklar bölmesi açık başlar; tablet ve telefonda otomatik manyetik kenar kulakçıklarına dönüşür.</p>
                </div>
                <button
                  class="lumina-switch"
                  :class="{ on: settings.autoOpenPanelsOnWide }"
                  @click="settings.autoOpenPanelsOnWide = !settings.autoOpenPanelsOnWide"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>

              <!-- Default Book Mode Toggle -->
              <div class="setting-row-card">
                <div class="setting-info">
                  <h4>Varsayılan Çift Sayfa (Açık Kitap) Görünümü</h4>
                  <p>Yeni açılan defterler yan yana 1-2, 3-4 kitap formaları şeklinde başlasın.</p>
                </div>
                <button
                  class="lumina-switch"
                  :class="{ on: settings.defaultBookMode }"
                  @click="settings.defaultBookMode = !settings.defaultBookMode"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>

              <!-- 3D Leather & Embossed Book Spine on Shelf -->
              <div class="setting-row-card">
                <div class="setting-info">
                  <h4>Kitaplık Rafında 3D Dikişli Deri & Cilt Efekti</h4>
                  <p>Defterlerinizi rafta gerçek dikişli deri dokusu, kabartmalı sırt ve derin 3D gölgelerle sergiler. Kapatıldığında modern düz pastel kartlar görünür.</p>
                </div>
                <button
                  class="lumina-switch"
                  :class="{ on: settings.isShelf3DLeather !== false }"
                  @click="settings.isShelf3DLeather = settings.isShelf3DLeather === false ? true : false"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>

              <!-- Smart Shape Default -->
              <div class="setting-row-card">
                <div class="setting-info">
                  <h4>Akıllı Çizgi Düzeltme (Basılı Tut & Hizala)</h4>
                  <p>Kalemle çizip beklediğinizde çizgiyi otomatik olarak jilet gibi düz elastik cetvele dönüştürür.</p>
                </div>
                <button
                  class="lumina-switch"
                  :class="{ on: settings.defaultSmartShape }"
                  @click="settings.defaultSmartShape = !settings.defaultSmartShape"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>

              <!-- Line Opacity Slider -->
              <div class="setting-block-card">
                <div class="block-header">
                  <div>
                    <h4>Kağıt Çizgi & Izgara Belirginliği</h4>
                    <p>Göz yorgunluğunu azaltmak için satır ve kare çizgilerinin yumuşaklığını ayarlayın</p>
                  </div>
                  <span class="value-pill">%{{ Math.round(settings.lineOpacity * 100) }}</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="1"
                  step="0.05"
                  v-model.number="settings.lineOpacity"
                  class="lumina-slider"
                />
              </div>

              <!-- Default Paper Pattern -->
              <div class="control-card">
                <span class="control-label">VARSAYILAN KAĞIT TÜRÜ</span>
                <div class="mini-choice-grid">
                  <button
                    v-for="pt in PAPER_TYPES"
                    :key="pt.id"
                    class="choice-chip"
                    :class="{ active: settings.defaultPaperType === pt.id }"
                    @click="settings.defaultPaperType = pt.id"
                  >
                    {{ pt.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- TAB 3: FOCUS AUDIO & DATA BACKUP -->
            <div v-else-if="activeTab === 'focus'" class="tab-pane">
              <!-- Keystroke Typing Sound & ASMR -->
              <div class="section-heading-row">
                <span class="section-label">YAZMA & KAĞIT ETKİLEŞİM SESİ (KLAVYE ASMR)</span>
                <span class="section-hint">Manyetik tok switch & gerçekçi kağıt sürtünmesi</span>
              </div>

              <div class="sound-cards-grid typing-sounds-grid">
                <button
                  v-for="ts in TYPING_SOUND_OPTIONS"
                  :key="ts.id"
                  class="sound-card"
                  :class="{ active: (settings.typingSound || 'thock') === ts.id }"
                  @click="chooseTypingSound(ts.id)"
                >
                  <span class="sound-emoji">{{ ts.emoji }}</span>
                  <div class="sound-text">
                    <span class="sound-name">{{ ts.name }}</span>
                    <span class="sound-desc">{{ ts.desc }}</span>
                  </div>
                </button>
              </div>

              <div v-if="settings.typingSound !== 'off'" class="setting-block-card">
                <div class="block-header">
                  <div class="vol-label-row">
                    <Volume2 :size="16" />
                    <h4>Tuş & Kağıt Sesi Şiddeti</h4>
                  </div>
                  <span class="value-pill">%{{ Math.round((settings.typingVolume ?? 0.45) * 100) }}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  v-model.number="settings.typingVolume"
                  @input="previewTypingVolume"
                  class="lumina-slider"
                />
              </div>

              <!-- Ambient Audio -->
              <div class="section-heading-row" style="margin-top: 14px;">
                <span class="section-label">12 AKUSTİK ODAK ATMOSFERİ (ÇEVRİMDIŞI STÜDYO)</span>
                <span class="section-hint">İnternet gerektirmez • Saf ses sentezi</span>
              </div>

              <div class="sound-cards-grid">
                <button
                  v-for="snd in AMBIENT_SOUNDS"
                  :key="snd.id"
                  class="sound-card"
                  :class="{ active: activeAmbientSound === snd.id }"
                  @click="setAmbient(snd.id)"
                >
                  <span class="sound-emoji">{{ snd.emoji }}</span>
                  <div class="sound-text">
                    <span class="sound-name">{{ snd.name }}</span>
                    <span class="sound-desc">{{ snd.desc }}</span>
                  </div>
                </button>
              </div>

              <div v-if="activeAmbientSound !== 'off'" class="setting-block-card">
                <div class="block-header">
                  <div class="vol-label-row">
                    <Volume2 :size="16" />
                    <h4>Atmosfer Ses Seviyesi</h4>
                  </div>
                  <span class="value-pill">%{{ Math.round((settings.ambientVolume ?? 0.35) * 100) }}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  v-model.number="settings.ambientVolume"
                  class="lumina-slider"
                />
              </div>

              <!-- Backup & Restore -->
              <div class="section-heading-row" style="margin-top: 10px;">
                <span class="section-label">VERİ GÜVENLİĞİ & YEDEKLEME</span>
                <span class="section-hint">Tüm defterler, çizimler, kapaklar ve ayarlar</span>
              </div>

              <div class="backup-cards-row">
                <button class="backup-big-btn primary" @click="$emit('export-backup')">
                  <Download :size="18" />
                  <div class="btn-txt">
                    <strong>Bilgisayara Yedek İndir (.json)</strong>
                    <span>Tüm defter ve klasörlerinizi tek dosyada saklayın</span>
                  </div>
                </button>

                <button class="backup-big-btn" @click="triggerImport">
                  <Upload :size="18" />
                  <div class="btn-txt">
                    <strong>Yedek Dosyasından Geri Yükle</strong>
                    <span>Önceden aldığınız .json yedeğini içe aktarın</span>
                  </div>
                </button>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".json"
                  class="hidden-file"
                  @change="onFileChosen"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  Sparkles, X, Palette, Layout, Headphones, Sun, Moon, Circle, Check,
  Volume2, Download, Upload
} from '@lucide/vue';
import {
  useSettings,
  PASTEL_THEMES,
  AMBIENT_SOUNDS,
  TYPING_SOUND_OPTIONS,
  playKeystrokeSound
} from '../composables/useSettings.js';
import { PAPER_TYPES } from '../composables/useNotes.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'export-backup', 'import-backup']);

const {
  settings,
  activeAmbientSound,
  setTheme,
  setDarkMode,
  setGradientMode,
  setAmbient
} = useSettings();

const activeTab = ref('themes');
const fileInputRef = ref(null);

function chooseTypingSound(id) {
  settings.value.typingSound = id;
  if (id !== 'off') {
    playKeystrokeSound(id);
  }
}

function previewTypingVolume() {
  playKeystrokeSound(settings.value.typingSound || 'thock');
}

function getSwatchStyle(theme) {
  const palette = settings.value.isDarkMode ? theme.dark : theme.light;
  return {
    background: settings.value.isGradient ? palette.gradientBg : palette.solidBg
  };
}

function triggerImport() {
  fileInputRef.value?.click();
}

function onFileChosen(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    emit('import-backup', ev.target.result);
  };
  reader.readAsText(file);
  e.target.value = '';
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    emit('close');
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown, true));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true));
</script>

<style scoped>
.settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(15, 12, 24, 0.36);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.settings-glass-modal {
  width: 100%;
  max-width: 720px;
  max-height: 88vh;
  background: var(--bg-surface);
  backdrop-filter: blur(32px) saturate(180%);
  border: 1px solid var(--border-glass);
  border-radius: 28px;
  box-shadow:
    0 28px 70px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--color-text-main);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 26px 14px 26px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-orb {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin: 0;
}

.modal-subtitle {
  font-size: 12.5px;
  color: var(--color-text-muted);
  margin: 2px 0 0 0;
}

.close-pill-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-pill-btn:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  transform: rotate(90deg);
}

/* Tabs */
.settings-tabs {
  display: flex;
  gap: 8px;
  padding: 0 26px 14px 26px;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.s-tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.s-tab-btn:hover {
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
}

.s-tab-btn.active {
  background: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 4px 14px var(--color-primary-soft);
}

[data-theme="dark"] .s-tab-btn.active {
  color: #111118;
}

.settings-body {
  padding: 20px 26px 26px 26px;
  overflow-y: auto;
  flex: 1;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dual-mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.control-card {
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.7px;
  color: var(--color-text-muted);
}

.segmented-pill {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px;
  border-radius: 12px;
}

[data-theme="dark"] .segmented-pill {
  background: rgba(0, 0, 0, 0.25);
}

.seg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.seg-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.7px;
  color: var(--color-text-muted);
}

.section-hint {
  font-size: 11.5px;
  color: var(--color-primary);
  font-weight: 600;
}

/* 9 Themes Grid */
.themes-nine-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-preview-card {
  background: var(--bg-surface-subtle);
  border: 1.5px solid var(--border-color);
  border-radius: 18px;
  padding: 8px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.theme-preview-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.theme-preview-card.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  background: var(--bg-surface);
}

.theme-swatch-canvas {
  height: 68px;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(128, 128, 128, 0.14);
}

.mini-glass-sheet {
  width: 68%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid;
  padding: 7px 9px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.mini-accent-pill {
  width: 24px;
  height: 5px;
  border-radius: 99px;
}

.mini-line {
  width: 80%;
  height: 3px;
  border-radius: 99px;
  opacity: 0.35;
}

.theme-check-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .theme-check-badge {
  color: #111118;
}

.theme-meta {
  padding: 0 4px 2px 4px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.theme-name-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.theme-emoji {
  font-size: 13px;
}

.theme-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-main);
}

.theme-sub {
  font-size: 10.5px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Workspace Tab Rows */
.setting-row-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
}

.setting-info h4 {
  font-size: 13.5px;
  font-weight: 700;
  margin: 0 0 3px 0;
  color: var(--color-text-main);
}

.setting-info p {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
}

.lumina-switch {
  width: 46px;
  height: 26px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.35);
  border: none;
  padding: 3px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.22s ease;
  display: flex;
  align-items: center;
}

.lumina-switch.on {
  background: var(--color-primary);
}

.switch-knob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.lumina-switch.on .switch-knob {
  transform: translateX(20px);
}

.setting-block-card {
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.block-header h4 {
  font-size: 13.5px;
  font-weight: 700;
  margin: 0;
}

.block-header p {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 2px 0 0 0;
}

.vol-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
}

.value-pill {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.lumina-slider {
  width: 100%;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.mini-choice-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}


.choice-chip {
  flex: 1;
  min-width: 64px;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.choice-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
}

[data-theme="dark"] .choice-chip.active {
  color: #111118;
}

/* Focus Sound Cards */
.sound-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 10px;
}

.typing-sounds-grid {
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: 12px;
}

.sound-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-surface-subtle);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.sound-card:hover {
  border-color: var(--color-primary);
}

.sound-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.sound-emoji {
  font-size: 24px;
}

.sound-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sound-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-main);
}

.sound-desc {
  font-size: 11px;
  color: var(--color-text-muted);
}

/* Backup Buttons */
.backup-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.backup-big-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.backup-big-btn:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.backup-big-btn.primary {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.btn-txt {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-txt strong {
  font-size: 13px;
}

.btn-txt span {
  font-size: 11px;
  color: var(--color-text-muted);
}

.hidden-file {
  display: none;
}

/* Transitions */
.lumina-modal-enter-active,
.lumina-modal-leave-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.lumina-modal-enter-from,
.lumina-modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@media (max-width: 680px) {
  .dual-mode-grid,
  .backup-cards-row,
  .sound-cards-grid {
    grid-template-columns: 1fr;
  }
  .themes-nine-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .modal-header,
  .settings-tabs,
  .settings-body {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
