<template>
  <Teleport to="body">
    <Transition name="spotlight-fade">
      <div v-if="isOpen" class="spotlight-backdrop" @click.self="handleCloseModal" @keydown.esc.stop.prevent="handleCloseModal">
        <div class="spotlight-glass-box" @click.stop>
          <!-- Search Input Row -->
          <div class="spotlight-input-row">
            <Search :size="20" class="spot-search-icon" />
            <input
              ref="searchInputRef"
              v-model="query"
              type="text"
              class="spotlight-input"
              placeholder="Tüm defterlerde, sayfalarda ve etiketlerde ara... (ESC ile kapat)"
              @keydown.down.prevent="moveSelection(1)"
              @keydown.up.prevent="moveSelection(-1)"
              @keydown.enter.prevent="selectHighlighted"
              @keydown.esc.stop.prevent="handleCloseModal"
            />
            <span class="spot-kbd">ESC</span>
          </div>

          <!-- Results List -->
          <div class="spotlight-results-scroll" v-if="results.length > 0">
            <div
              v-for="(note, idx) in results"
              :key="note.id"
              class="spot-result-item"
              :class="{ highlighted: idx === highlightedIndex }"
              @mouseenter="highlightedIndex = idx"
              @click="chooseNote(note)"
            >
              <div class="spot-item-icon">
                <BookOpen v-if="!note.isLocked" :size="16" />
                <Lock v-else :size="16" />
              </div>

              <div class="spot-item-content">
                <div class="spot-item-title-row">
                  <span class="spot-item-title">{{ note.title || 'Başlıksız Defter' }}</span>
                  <span v-if="note.folder" class="spot-folder-badge">📁 {{ note.folder }}</span>
                  <span v-if="note.tags && note.tags.length" class="spot-tag-badge">#{{ note.tags[0] }}</span>
                </div>
                <p class="spot-item-snippet">{{ getSnippet(note) }}</p>
              </div>

              <span class="spot-enter-hint" v-if="idx === highlightedIndex">
                <span>Aç</span>
                <CornerDownLeft :size="12" />
              </span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="query.trim()" class="spotlight-empty">
            <SearchX :size="32" class="empty-icon" />
            <p><strong>"{{ query }}"</strong> için eşleşen not bulunamadı</p>
          </div>

          <!-- Quick Navigation Footer -->
          <div class="spotlight-footer">
            <div class="footer-keys">
              <span><kbd>↑</kbd><kbd>↓</kbd> Gezin</span>
              <span><kbd>↵</kbd> Seç</span>
              <span><kbd>ESC</kbd> Kapat</span>
            </div>
            <span class="footer-stats">{{ notes.length }} defter tarandı</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { Search, SearchX, BookOpen, Lock, CornerDownLeft } from '@lucide/vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  notes: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'select-note']);

const query = ref('');
const highlightedIndex = ref(0);
const searchInputRef = ref(null);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    query.value = '';
    highlightedIndex.value = 0;
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.notes.slice(0, 7);

  return props.notes.filter(n => {
    if (n.isTrash) return false;
    const titleMatch = (n.title || '').toLowerCase().includes(q);
    const tagMatch = (n.tags || []).some(t => t.toLowerCase().includes(q));
    const folderMatch = (n.folder || '').toLowerCase().includes(q);
    
    // Check pages content
    let contentMatch = false;
    if (n.pages && Array.isArray(n.pages)) {
      contentMatch = n.pages.some(p => {
        const text = (p.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();
        return text.includes(q);
      });
    }

    return titleMatch || tagMatch || folderMatch || contentMatch;
  }).slice(0, 8);
});

watch(results, () => {
  highlightedIndex.value = 0;
});

function moveSelection(delta) {
  if (results.value.length === 0) return;
  highlightedIndex.value = (highlightedIndex.value + delta + results.value.length) % results.value.length;
}

function selectHighlighted() {
  if (results.value.length > 0 && results.value[highlightedIndex.value]) {
    chooseNote(results.value[highlightedIndex.value]);
  }
}

function chooseNote(note) {
  emit('select-note', note);
  emit('close');
}

function getSnippet(note) {
  if (note.pages && note.pages.length > 0) {
    const raw = (note.pages[0].content || '').replace(/<[^>]+>/g, ' ').trim();
    if (raw) return raw.slice(0, 95) + '...';
  }
  return 'Boş defter sayfası...';
}

function handleCloseModal(e) {
  if (e) {
    e.stopPropagation?.();
    e.stopImmediatePropagation?.();
    e.preventDefault?.();
  }
  emit('close');
}

function onGlobalKeydown(e) {
  if (props.isOpen && e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    emit('close');
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (props.isOpen) {
      emit('close');
    }
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown, true));
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKeydown, true));
</script>

<style scoped>
.spotlight-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1500;
  background: rgba(12, 10, 18, 0.45);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14vh;
  padding-left: 16px;
  padding-right: 16px;
}

.spotlight-glass-box {
  width: 100%;
  max-width: 620px;
  background: var(--bg-surface);
  backdrop-filter: blur(36px) saturate(190%);
  border: 1px solid var(--border-glass);
  border-radius: 22px;
  box-shadow:
    0 24px 64px -10px rgba(0, 0, 0, 0.38),
    0 0 0 1px var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: spotSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes spotSlideDown {
  from {
    transform: translateY(-12px) scale(0.97);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.spotlight-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.spot-search-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.spotlight-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-main);
  outline: none;
}

.spotlight-input::placeholder {
  color: var(--color-text-muted);
  font-weight: 400;
}

.spot-kbd {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 6px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  color: var(--color-text-muted);
}

.spotlight-results-scroll {
  max-height: 380px;
  overflow-y: auto;
  padding: 8px 10px;
}

.spot-result-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.12s ease;
}

.spot-result-item.highlighted {
  background: var(--color-primary-soft);
}

.spot-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--bg-surface-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.spot-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spot-item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spot-item-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spot-folder-badge,
.spot-tag-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text-muted);
}

.spot-item-snippet {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spot-enter-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
}

.spotlight-empty {
  padding: 40px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
}

.empty-icon {
  opacity: 0.4;
}

.spotlight-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: var(--bg-surface-subtle);
  border-top: 1px solid var(--border-color);
  font-size: 11px;
  color: var(--color-text-muted);
}

.footer-keys {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-keys kbd {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  font-size: 10px;
  font-weight: 700;
  margin-right: 3px;
}
</style>
