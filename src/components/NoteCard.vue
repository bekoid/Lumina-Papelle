<template>
  <div 
    class="note-card"
    :style="cardThemeStyle"
    @click="handleCardClick"
  >
    <!-- Paper Texture & Pattern Header -->
    <div 
      class="card-paper-preview" 
      :class="[
        `pattern-${firstPageType}`,
        { 'is-locked': note.isLocked }
      ]"
    >
      <div class="preview-badges">
        <span class="paper-type-badge">{{ paperSizeBadge }} • {{ paperTypeName }} • {{ pageCount }}s</span>
        <div class="meta-indicators">
          <span v-if="note.isLocked" class="badge-icon" title="Şifreli Not">🔒</span>
          <span v-if="hasStickies" class="badge-icon" title="Yapışkan Not">📌</span>
          <span v-if="note.attachments && note.attachments.length" class="badge-icon" title="Ekli dosya">📎</span>
          <span v-if="hasImages" class="badge-icon" title="Resim / Çıkartma">✨</span>
          <span v-if="hasDrawings" class="badge-icon" title="Çizim içerir">🎨</span>
        </div>
      </div>

      <!-- Locked note cover or normal excerpt -->
      <div v-if="note.isLocked" class="locked-card-overlay">
        <Lock :size="22" class="locked-icon" />
        <span>Korumalı Defter</span>
      </div>

      <div v-else class="faux-text-preview" :style="{ textAlign: note.align || 'left' }">
        {{ excerptText }}
      </div>
    </div>

    <!-- Card Content Info -->
    <div class="card-body">
      <div class="title-row">
        <h3 class="note-title" :title="note.title || 'Başlıksız Defter'">
          {{ note.title || 'Başlıksız Defter' }}
        </h3>
        
        <button 
          v-if="!note.isTrash"
          class="card-action-btn star-btn" 
          :class="{ active: note.isFavorite }"
          @click.stop="$emit('toggle-favorite', note.id, $event)"
          :title="note.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'"
        >
          <Star 
            :size="15" 
            :fill="note.isFavorite ? '#F59E0B' : 'none'" 
            :color="note.isFavorite ? '#F59E0B' : 'currentColor'" 
          />
        </button>
      </div>

      <!-- Tags on Card -->
      <div v-if="note.tags && note.tags.length" class="card-tags-row">
        <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="card-tag">
          #{{ tag }}
        </span>
        <span v-if="note.tags.length > 3" class="card-tag more">+{{ note.tags.length - 3 }}</span>
      </div>

      <div class="meta-row">
        <span class="note-date">{{ formattedDate }}</span>

        <div class="actions-group">
          <template v-if="note.isTrash">
            <button 
              class="card-action-btn restore-btn" 
              @click.stop="$emit('restore', note.id, $event)" 
              title="Geri Yükle"
            >
              <RotateCcw :size="14" />
            </button>
            <button 
              class="card-action-btn delete-btn" 
              @click.stop="$emit('delete-perm', note.id, $event)" 
              title="Kalıcı Olarak Sil"
            >
              <Trash2 :size="14" />
            </button>
          </template>

          <template v-else>
            <button 
              class="card-action-btn delete-btn" 
              @click.stop="$emit('delete', note.id, $event)" 
              title="Çöp Kutusuna Taşı"
            >
              <Trash2 :size="14" />
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Star, Trash2, RotateCcw, Lock } from '@lucide/vue';
import { LIGHT_PASTEL_COLORS, DARK_PASTEL_COLORS, PAPER_TYPES, stripHtmlToText } from '../composables/useNotes.js';

const props = defineProps({
  note: { type: Object, required: true },
  isDarkMode: { type: Boolean, default: false }
});

const emit = defineEmits(['open', 'request-unlock', 'toggle-favorite', 'delete', 'restore', 'delete-perm']);

function handleCardClick() {
  if (props.note.isLocked) {
    emit('request-unlock', props.note);
  } else {
    emit('open', props.note);
  }
}

const firstPageType = computed(() => props.note.meta?.firstPageType || props.note.pages?.[0]?.paperType || props.note.paperType || 'lined');
const firstPageColor = computed(() => props.note.meta?.firstPageColor || props.note.pages?.[0]?.paperColor || props.note.paperColor || 'cream');

const hasMixedPaper = computed(() => {
  if (props.note.meta?.hasMixedPaper !== undefined) return props.note.meta.hasMixedPaper;
  if (!props.note.pages || props.note.pages.length <= 1) return false;
  const types = new Set(props.note.pages.map(p => p.paperType || props.note.paperType || 'lined'));
  return types.size > 1;
});

const colorConfig = computed(() => {
  const palette = props.isDarkMode ? DARK_PASTEL_COLORS : LIGHT_PASTEL_COLORS;
  return palette.find(c => c.id === firstPageColor.value) || palette[0];
});

const paperTypeName = computed(() => {
  if (props.note.paperSize === 'canvas') return 'Serbest';
  if (hasMixedPaper.value) return 'Karma';
  const p = PAPER_TYPES.find(item => item.id === firstPageType.value);
  return p ? p.name : 'Çizgili';
});

const paperSizeBadge = computed(() => {
  if (props.note.meta?.paperSizeBadge) return props.note.meta.paperSizeBadge;
  const s = props.note.paperSize || 'a4';
  if (s === 'canvas') return 'Tuval';
  return s.toUpperCase();
});

const pageCount = computed(() => props.note.meta?.pageCount ?? (props.note.pages?.length || 1));
const hasDrawings = computed(() => props.note.meta?.hasDrawings ?? Boolean(props.note.drawings || props.note.pages?.some(p => p.drawings)));
const hasImages = computed(() => props.note.meta?.hasImages ?? Boolean((props.note.images?.length > 0) || props.note.pages?.some(p => p.images?.length > 0)));
const hasStickies = computed(() => props.note.meta?.hasStickies ?? Boolean((props.note.stickies?.length > 0) || props.note.pages?.some(p => p.stickies?.length > 0)));

const cardThemeStyle = computed(() => {
  const c = colorConfig.value;
  return {
    '--card-bg': c.bg,
    '--card-line': c.line,
    '--card-text': c.text,
  };
});

const excerptText = computed(() => {
  if (props.note.meta?.excerptText) return props.note.meta.excerptText;
  const raw = props.note.pages?.[0]?.content || props.note.content || '';
  const clean = stripHtmlToText(raw);
  return clean ? clean.slice(0, 150) : 'Boş sayfa...';
});

const formattedDate = computed(() => {
  if (!props.note.updatedAt) return '';
  const d = new Date(props.note.updatedAt);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
});
</script>

<style scoped>
.note-card {
  min-height: 250px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 22px;
  border: 1px solid var(--border-glass);
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 34px -8px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary);
}

.card-paper-preview {
  height: 132px;
  background-color: var(--card-bg);
  position: relative;
  padding: 12px 14px;
  overflow: hidden;
  border-bottom: 1px solid var(--card-line);
}

.card-paper-preview.pattern-lined {
  background-image: repeating-linear-gradient(
    transparent,
    transparent 19px,
    var(--card-line) 19px,
    var(--card-line) 20px
  );
  background-position: 0 8px;
}

.card-paper-preview.pattern-grid {
  background-image: 
    repeating-linear-gradient(transparent, transparent 19px, var(--card-line) 19px, var(--card-line) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, var(--card-line) 19px, var(--card-line) 20px);
  background-position: 0 8px;
}

.card-paper-preview.pattern-dot {
  background-image: radial-gradient(var(--card-line) 1.25px, transparent 1.25px);
  background-size: 14px 14px;
}

.preview-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.paper-type-badge {
  font-size: 10px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 8px;
  border-radius: 99px;
  color: #334155;
}

[data-theme="dark"] .paper-type-badge {
  background: rgba(0, 0, 0, 0.55);
  color: #cbd5e1;
}

.meta-indicators {
  display: flex;
  align-items: center;
  gap: 3px;
}

.badge-icon { font-size: 11px; }

.locked-card-overlay {
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--card-text);
  opacity: 0.7;
  font-size: 12px;
  font-weight: 600;
}

.locked-icon { color: #f59e0b; }

.faux-text-preview {
  font-family: 'Lora', Georgia, serif;
  font-size: 11.5px;
  line-height: 20px;
  color: var(--card-text);
  opacity: 0.82;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-body {
  padding: 13px 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.note-title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.card-tags-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 10px;
  font-weight: 600;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  padding: 2px 7px;
  border-radius: 99px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--color-text-muted);
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-action-btn {
  width: 27px;
  height: 27px;
  border: none;
  background: transparent;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.card-action-btn:hover {
  background: var(--bg-surface);
  color: var(--color-text-main);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.14);
  color: #ef4444;
}

.restore-btn:hover {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}
</style>
