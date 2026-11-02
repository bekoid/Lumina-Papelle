<template>
  <div 
    class="notebook-cover-wrapper"
    :class="[
      `cover-${coverStyle}`,
      { 
        'is-locked': note.isLocked,
        'is-shelf-3d': is3DLeather,
        'is-shelf-flat': !is3DLeather
      }
    ]"
    @click="handleClick"
  >
    <div class="book-body">
      <div class="spine-crease"></div>

      <div v-if="coverStyle === 'spiral-kraft'" class="spiral-binding">
        <div v-for="i in 9" :key="i" class="spiral-ring"></div>
      </div>

      <div class="bookmark-ribbon" :style="{ backgroundColor: ribbonColor }"></div>

      <div v-if="isLeather" class="stitched-border"></div>

      <div class="cover-top-row">
        <div class="cover-badge-pill">
          <span v-if="note.isLocked">🔒 Korumalı</span>
          <span v-else>{{ paperSizeBadge }} • {{ paperTypeName }} • {{ pageCount }}s</span>
        </div>

        <div class="cover-top-actions" @click.stop>
          <template v-if="note.isTrash">
            <button
              class="cover-action-btn"
              @click.stop="$emit('restore', note.id, $event)"
              title="Geri Yükle"
            >
              <RotateCcw :size="13" />
            </button>
            <button
              class="cover-action-btn danger-hover"
              @click.stop="$emit('delete-perm', note.id, $event)"
              title="Kalıcı Olarak Sil"
            >
              <Trash2 :size="13" />
            </button>
          </template>
          <template v-else>
            <button 
              class="cover-action-btn"
              @click.stop="$emit('change-cover', note)"
              title="Kapağı Değiştir"
            >
              🎨
            </button>
            <button 
              class="cover-action-btn star-btn"
              :class="{ active: note.isFavorite }"
              @click.stop="$emit('toggle-favorite', note.id, $event)"
              :title="note.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'"
            >
              <Star 
                :size="13" 
                :fill="note.isFavorite ? '#F59E0B' : 'none'" 
                :color="note.isFavorite ? '#F59E0B' : 'rgba(255,255,255,0.85)'" 
              />
            </button>
            <button
              class="cover-action-btn trash-peek"
              @click.stop="$emit('delete', note.id, $event)"
              title="Çöp Kutusuna Taşı"
            >
              <Trash2 :size="13" />
            </button>
          </template>
        </div>
      </div>

      <div class="cover-plaque">
        <div class="plaque-inner">
          <h3 class="plaque-title" :title="note.title || 'Başlıksız Defter'">
            {{ note.title || 'Başlıksız Defter' }}
          </h3>
          <div class="plaque-sub">
            <span>{{ formattedDate }}</span>
            <span v-if="note.tags && note.tags.length" class="tag-count">• #{{ note.tags[0] }}</span>
          </div>
        </div>
      </div>

      <div class="page-edges-peek"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Star, Trash2, RotateCcw } from '@lucide/vue';
import { PAPER_TYPES } from '../composables/useNotes.js';
import { useSettings } from '../composables/useSettings.js';

const props = defineProps({
  note: { type: Object, required: true }
});

const emit = defineEmits(['open', 'request-unlock', 'change-cover', 'toggle-favorite', 'delete', 'restore', 'delete-perm']);

const { settings } = useSettings();
const is3DLeather = computed(() => settings.value.isShelf3DLeather !== false);

const coverStyle = computed(() => props.note.coverStyle || 'leather-brown');
const pageCount = computed(() => props.note.meta?.pageCount ?? (props.note.pages?.length || 1));

const isLeather = computed(() => ['leather-brown', 'leather-black'].includes(coverStyle.value));

const paperTypeName = computed(() => {
  if (props.note.paperSize === 'canvas') return 'Serbest';
  if (props.note.meta?.hasMixedPaper) return 'Karma Düzen';
  const typeId = props.note.meta?.firstPageType || props.note.paperType || 'lined';
  const p = PAPER_TYPES.find(item => item.id === typeId);
  return p ? p.name : 'Çizgili';
});

const paperSizeBadge = computed(() => {
  if (props.note.meta?.paperSizeBadge) return props.note.meta.paperSizeBadge;
  const s = props.note.paperSize || 'a4';
  if (s === 'canvas') return 'Tuval';
  return s.toUpperCase();
});

const ribbonColor = computed(() => {
  const colors = {
    'leather-brown': '#DC2626',
    'leather-black': '#E2E8F0',
    'spiral-kraft': '#D97706',
    'marble-rose': '#F43F5E',
    'marble-mint': '#059669',
    'linen-navy': '#F59E0B',
    'linen-cream': '#1E293B',
    'pastel-sunset': '#8B5CF6'
  };
  return colors[coverStyle.value] || '#DC2626';
});

const formattedDate = computed(() => {
  if (!props.note.updatedAt) return '';
  const d = new Date(props.note.updatedAt);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
});

function handleClick() {
  if (props.note.isLocked) {
    emit('request-unlock', props.note);
  } else {
    emit('open', props.note);
  }
}
</script>

<style scoped>
.notebook-cover-wrapper {
  position: relative;
  height: 274px;
  cursor: pointer;
  perspective: 1000px;
  user-select: none;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.notebook-cover-wrapper.is-shelf-3d:hover {
  transform: translateY(-7px) rotateY(-4deg) rotateX(2deg);
}

.notebook-cover-wrapper.is-shelf-flat {
  perspective: none;
}

.notebook-cover-wrapper.is-shelf-flat:hover {
  transform: translateY(-5px);
}

.notebook-cover-wrapper.is-shelf-flat .spine-crease,
.notebook-cover-wrapper.is-shelf-flat .page-edges-peek,
.notebook-cover-wrapper.is-shelf-flat .stitched-border {
  display: none !important;
}

.notebook-cover-wrapper.is-shelf-flat .book-body {
  border-radius: 20px;
  box-shadow:
    0 12px 28px -8px rgba(0, 0, 0, 0.16),
    0 4px 8px -2px rgba(0, 0, 0, 0.08);
}

.book-body {
  width: 100%;
  height: 100%;
  border-radius: 5px 20px 20px 5px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px 16px;
  box-shadow: 
    0 18px 34px -10px rgba(0, 0, 0, 0.24),
    0 4px 10px -2px rgba(0, 0, 0, 0.12),
    inset 16px 0 16px -6px rgba(0, 0, 0, 0.32);
}

.spine-crease {
  position: absolute;
  top: 0;
  left: 24px;
  width: 2px;
  height: 100%;
  background: rgba(0, 0, 0, 0.18);
  box-shadow: 1px 0 2px rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

.page-edges-peek {
  position: absolute;
  top: 6px;
  right: 0;
  width: 5px;
  height: calc(100% - 12px);
  background: repeating-linear-gradient(to bottom, #FAF8F5, #FAF8F5 2px, #E2E8F0 2px, #E2E8F0 3px);
  border-radius: 0 4px 4px 0;
  box-shadow: -1px 0 2px rgba(0, 0, 0, 0.2);
}

.bookmark-ribbon {
  position: absolute;
  top: -2px;
  right: 32px;
  width: 13px;
  height: 46px;
  border-radius: 0 0 2px 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 5;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%);
}

.spiral-binding {
  position: absolute;
  top: 14px;
  left: 8px;
  bottom: 14px;
  width: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 10;
  pointer-events: none;
}

.spiral-ring {
  width: 18px;
  height: 8px;
  border: 2px solid #94A3B8;
  border-radius: 999px;
  background: linear-gradient(180deg, #FFFFFF, #64748B);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  margin-left: -5px;
}

.stitched-border {
  position: absolute;
  inset: 7px;
  border: 1.5px dashed rgba(254, 240, 138, 0.35);
  border-radius: 2px 15px 15px 2px;
  pointer-events: none;
}

.cover-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 6;
  margin-left: 14px;
}

.cover-badge-pill {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.92);
  padding: 3px 8px;
  border-radius: 99px;
  backdrop-filter: blur(6px);
}

.cover-top-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cover-action-btn {
  width: 25px;
  height: 25px;
  border-radius: 7px;
  border: none;
  background: rgba(0, 0, 0, 0.26);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 11px;
}

.cover-action-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.08);
}

.trash-peek {
  opacity: 0;
}

.notebook-cover-wrapper:hover .trash-peek {
  opacity: 1;
}

.trash-peek:hover,
.danger-hover:hover {
  background: rgba(239, 68, 68, 0.85);
}

.star-btn.active {
  background: rgba(245, 158, 11, 0.32);
}

.cover-plaque {
  margin: auto 8px auto 20px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 
    0 4px 14px rgba(0, 0, 0, 0.22),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  z-index: 4;
  text-align: center;
  transition: transform 0.2s ease;
}

.notebook-cover-wrapper:hover .cover-plaque {
  transform: scale(1.02);
}

.plaque-title {
  margin: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plaque-sub {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Cover Textures */
.cover-leather-brown .book-body {
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 60%), linear-gradient(135deg, #78350F 0%, #451A03 100%);
}
.cover-leather-brown .cover-plaque { border: 1px solid #D97706; background: #FFFBEB; }

.cover-leather-black .book-body {
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 0%, transparent 70%), linear-gradient(135deg, #1E293B 0%, #090D16 100%);
}
.cover-leather-black .cover-plaque { border: 1px solid #94A3B8; background: #F8FAFC; }

.cover-spiral-kraft .book-body { background: linear-gradient(135deg, #D97706 0%, #B45309 100%); }
.cover-spiral-kraft .cover-plaque { background: #FEF3C7; border: 1px solid #F59E0B; }

.cover-marble-rose .book-body {
  background: radial-gradient(ellipse at top left, rgba(251, 113, 133, 0.6), transparent 50%), radial-gradient(ellipse at bottom right, rgba(244, 63, 94, 0.5), transparent 50%), linear-gradient(135deg, #FFE4E6 0%, #FECDD3 50%, #FDA4AF 100%);
}
.cover-marble-rose .cover-plaque { border: 1px solid #FB7185; }

.cover-marble-mint .book-body {
  background: radial-gradient(ellipse at top left, rgba(52, 211, 153, 0.5), transparent 50%), linear-gradient(135deg, #DCFCE7 0%, #A7F3D0 50%, #6EE7B7 100%);
}
.cover-marble-mint .cover-plaque { border: 1px solid #10B981; }

.cover-linen-navy .book-body {
  background: repeating-linear-gradient(45deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 2px, transparent 2px, transparent 4px), linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%);
}
.cover-linen-navy .cover-plaque { border: 1px solid #C7D2FE; }

.cover-linen-cream .book-body {
  background: repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px), linear-gradient(135deg, #E7E5E4 0%, #D6D3D1 100%);
}
.cover-linen-cream .cover-plaque { border: 1px solid #A8A29E; }

.cover-pastel-sunset .book-body { background: linear-gradient(135deg, #FDE68A 0%, #F472B6 50%, #818CF8 100%); }
.cover-pastel-sunset .cover-plaque { border: 1px solid #C084FC; }
</style>
