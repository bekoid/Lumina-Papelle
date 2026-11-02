<template>
  <Transition name="wing-slots">
    <aside
      v-if="isOpen"
      class="lumina-slots-wing no-print"
      @click.stop
      @pointerdown.stop
    >
      <!-- Header (Matches Sidebar / Klasörler stability & glass feel) -->
      <div class="slots-header">
        <div class="slots-title-group">
          <div class="slots-orb">
            <Layers :size="16" />
          </div>
          <div class="slots-meta">
            <h3 class="slots-title">Sayfa Slotları & Düzen</h3>
            <span class="slots-sub">
              {{ pages.length }} Sayfa • {{ isDoublePageMode ? 'Kitap Forması (1-2)' : 'Tekli Akış' }}
            </span>
          </div>
        </div>

        <div class="slots-header-actions">
          <button
            type="button"
            class="slots-icon-btn"
            @click="closeDrawer"
            title="Kenara Katla"
          >
            <ChevronsRight :size="16" />
          </button>
          <button
            type="button"
            class="slots-close-btn"
            @click="closeDrawer"
            title="Menüyü Kapat (ESC)"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- Quick Page Flow + Scope + Pattern + Color Controls -->
      <div class="layout-quick-card">
        <!-- 1. Page Flow (Single vs Book Spread) -->
        <div class="quick-row">
          <span class="q-label">SAYFA AKIŞI</span>
          <div class="q-segmented">
            <button
              type="button"
              class="q-seg-btn"
              :class="{ active: !isDoublePageMode }"
              @click="$emit('update:doublePageMode', false)"
            >
              <FileText :size="13" />
              <span>Tek Sayfa</span>
            </button>
            <button
              type="button"
              class="q-seg-btn"
              :class="{ active: isDoublePageMode, disabled: isBookModeDisabled }"
              :disabled="isBookModeDisabled"
              :title="isBookModeDisabled ? `${currentPaperSizeObj.name} için çift sayfa desteklenmez` : 'Çift Sayfa (Kitap)'"
              @click="!isBookModeDisabled && $emit('update:doublePageMode', true)"
            >
              <BookOpen :size="13" />
              <span>Çift Sayfa (Kitap)</span>
            </button>
          </div>
        </div>

        <!-- 2. Notebook Paper Size Standard (A4, A5, A3, Tuval) -->
        <div class="quick-row">
          <div class="q-row-head">
            <span class="q-label">DEFTER KAĞIT BOYUTU</span>
            <span class="q-target-pill">{{ currentPaperSizeBadge }}</span>
          </div>
          <div class="q-chips">
            <button
              v-for="ps in PAPER_SIZES"
              :key="ps.id"
              type="button"
              class="q-chip"
              :class="{ active: paperSize === ps.id }"
              @click="$emit('change-paper-size', ps.id)"
            >
              {{ ps.name }}
            </button>
          </div>
        </div>

        <!-- 2. Customization Scope: Selected Pages vs All Pages -->
        <div class="quick-row">
          <div class="q-row-head">
            <span class="q-label">ÖZELLEŞTİRME KAPSAMI</span>
            <span class="q-target-pill">{{ targetSummaryText }}</span>
          </div>
          <div class="q-segmented">
            <button
              type="button"
              class="q-seg-btn"
              :class="{ active: applyScope === 'selected' }"
              @click="applyScope = 'selected'"
              title="Sadece seçtiğiniz sayfalara uygular"
            >
              <CheckSquare :size="13" />
              <span>Seçili Sayfalar</span>
            </button>
            <button
              type="button"
              class="q-seg-btn"
              :class="{ active: applyScope === 'all' }"
              @click="applyScope = 'all'"
              title="Defterdeki tüm sayfalara aynı anda uygular"
            >
              <Layers :size="13" />
              <span>Tüm Sayfalar</span>
            </button>
          </div>

          <!-- Multi-select quick helper bar when in 'selected' mode -->
          <div v-if="applyScope === 'selected' && pages.length > 1" class="selection-helpers">
            <button
              type="button"
              class="sel-helper-chip"
              :class="{ active: isOnlyActiveSelected }"
              @click="selectOnlyActive"
              title="Sadece şu anki aktif sayfayı seç"
            >
              Sadece S.{{ activePageIndex + 1 }}
            </button>
            <button
              type="button"
              class="sel-helper-chip"
              @click="selectFromActiveToEnd"
              :title="`Sayfa ${activePageIndex + 1} ve sonrasındaki tüm sayfaları seç`"
            >
              S.{{ activePageIndex + 1 }} → Sonu
            </button>
            <button
              type="button"
              class="sel-helper-chip"
              @click="toggleSelectAllSlots"
            >
              {{ selectedIndices.length === pages.length ? 'Temizle' : 'Tümünü Seç' }}
            </button>
          </div>
        </div>

        <!-- 3. Paper Pattern -->
        <div class="quick-row">
          <span class="q-label">KAĞIT DESENİ</span>
          <div class="q-chips">
            <button
              v-for="pt in PAPER_TYPES"
              :key="pt.id"
              type="button"
              class="q-chip"
              :class="{ active: activeSharedType === pt.id }"
              @click="applyPattern(pt.id)"
            >
              {{ pt.name }}
            </button>
          </div>
        </div>

        <!-- 4. Paper Tint -->
        <div class="quick-row">
          <span class="q-label">KAĞIT TONU</span>
          <div class="q-swatches">
            <button
              v-for="c in palette"
              :key="c.id"
              type="button"
              class="q-swatch"
              :class="{ active: activeSharedColor === c.id }"
              :style="{ backgroundColor: c.preview }"
              :title="c.name"
              @click="applyColor(c.id)"
            ></button>
          </div>
        </div>

        <!-- 5. Quick Jump to Page Bar (For Multi-Page Notebooks) -->
        <div v-if="pages.length > 4" class="quick-row jump-row">
          <form class="jump-page-form" @submit.prevent="handleJumpSubmit">
            <span class="q-label">SAYFAYA GİT:</span>
            <input
              type="number"
              v-model.number="jumpPageInput"
              :min="1"
              :max="pages.length"
              :placeholder="`1 - ${pages.length}`"
              class="jump-page-input"
              @keydown.stop
            />
            <button type="submit" class="jump-page-btn">Git</button>
          </form>
        </div>
      </div>

      <!-- Visual Page Slots List (Virtualized for 1,300+ Page Notebooks) -->
      <div class="slots-scroll-area" ref="slotsScrollRef" @scroll.passive="onSlotsScroll">
        <!-- BOOK SPREAD MODE (1-2, 3-4...) -->
        <div
          v-if="isDoublePageMode"
          class="spread-slots-list"
          :style="{
            paddingTop: `${visibleSpreadWindow.topPad}px`,
            paddingBottom: `${visibleSpreadWindow.bottomPad}px`
          }"
        >
          <div
            v-for="spread in visibleSpreadWindow.items"
            :key="spread.spreadIndex"
            class="spread-slot-group"
          >
            <div class="spread-group-label">
              <span>Forma {{ spread.spreadIndex + 1 }}</span>
              <span class="spread-range">
                Sayfa {{ spread.leftIndex + 1 }}{{ spread.rightPage ? ` – ${spread.rightIndex + 1}` : '' }}
              </span>
            </div>

            <div class="mini-book-spread">
              <!-- Left Mini Page -->
              <div
                class="mini-sheet left-side"
                :class="[
                  `mini-${getPageType(spread.leftPage)}`,
                  {
                    active: activePageIndex === spread.leftIndex,
                    'is-checked': isSlotSelected(spread.leftIndex)
                  }
                ]"
                :style="getMiniPaperStyle(spread.leftPage)"
                @click="onSlotCardClick(spread.leftIndex, $event)"
              >
                <div class="mini-sheet-top">
                  <div class="mini-top-left">
                    <button
                      type="button"
                      class="slot-check-btn"
                      :class="{ checked: isSlotSelected(spread.leftIndex) }"
                      title="Özelleştirme için bu sayfayı seç / kaldır"
                      @click.stop="toggleSlotSelection(spread.leftIndex)"
                    >
                      <Check v-if="isSlotSelected(spread.leftIndex)" :size="10" stroke-width="3" />
                    </button>
                    <span class="mini-num">{{ spread.leftIndex + 1 }}</span>
                  </div>
                  <span class="mini-type-tag">{{ getPageTypeShort(spread.leftPage) }}</span>
                </div>

                <p class="mini-excerpt">{{ getPageExcerpt(spread.leftPage) }}</p>

                <div class="mini-bottom-row">
                  <div class="mini-badges">
                    <span v-if="spread.leftPage.drawings" title="Çizim">🎨</span>
                    <span v-if="spread.leftPage.images?.length" title="Görsel/Çıkartma">✨</span>
                  </div>
                  <button
                    v-if="pages.length > 1"
                    type="button"
                    class="mini-del-btn"
                    title="Sayfayı Sil"
                    @click.stop="$emit('delete-page', spread.leftIndex)"
                  >
                    <Trash2 :size="11" />
                  </button>
                </div>
              </div>

              <!-- Spine -->
              <div class="mini-spine"></div>

              <!-- Right Mini Page or Add Slot -->
              <div
                v-if="spread.rightPage"
                class="mini-sheet right-side"
                :class="[
                  `mini-${getPageType(spread.rightPage)}`,
                  {
                    active: activePageIndex === spread.rightIndex,
                    'is-checked': isSlotSelected(spread.rightIndex)
                  }
                ]"
                :style="getMiniPaperStyle(spread.rightPage)"
                @click="onSlotCardClick(spread.rightIndex, $event)"
              >
                <div class="mini-sheet-top">
                  <div class="mini-top-left">
                    <button
                      type="button"
                      class="slot-check-btn"
                      :class="{ checked: isSlotSelected(spread.rightIndex) }"
                      title="Özelleştirme için bu sayfayı seç / kaldır"
                      @click.stop="toggleSlotSelection(spread.rightIndex)"
                    >
                      <Check v-if="isSlotSelected(spread.rightIndex)" :size="10" stroke-width="3" />
                    </button>
                    <span class="mini-num">{{ spread.rightIndex + 1 }}</span>
                  </div>
                  <span class="mini-type-tag">{{ getPageTypeShort(spread.rightPage) }}</span>
                </div>

                <p class="mini-excerpt">{{ getPageExcerpt(spread.rightPage) }}</p>

                <div class="mini-bottom-row">
                  <div class="mini-badges">
                    <span v-if="spread.rightPage.drawings" title="Çizim">🎨</span>
                    <span v-if="spread.rightPage.images?.length" title="Görsel/Çıkartma">✨</span>
                  </div>
                  <button
                    v-if="pages.length > 1"
                    type="button"
                    class="mini-del-btn"
                    title="Sayfayı Sil"
                    @click.stop="$emit('delete-page', spread.rightIndex)"
                  >
                    <Trash2 :size="11" />
                  </button>
                </div>
              </div>

              <button
                v-else
                type="button"
                class="mini-sheet right-side empty-add-slot"
                @click="$emit('add-page')"
              >
                <Plus :size="16" />
                <span>Sayfa {{ spread.rightIndex + 1 }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- SINGLE PAGE SLOTS MODE (Virtualized) -->
        <div
          v-else
          class="single-slots-list"
          :style="{
            paddingTop: `${visibleSingleWindow.topPad}px`,
            paddingBottom: `${visibleSingleWindow.bottomPad}px`
          }"
        >
          <div
            v-for="item in visibleSingleWindow.items"
            :key="item.page.id"
            class="single-slot-card"
            :class="{
              active: activePageIndex === item.idx,
              'is-checked': isSlotSelected(item.idx)
            }"
            @click="onSlotCardClick(item.idx, $event)"
          >
            <!-- Multi-Select Checkbox -->
            <button
              type="button"
              class="slot-check-btn"
              :class="{ checked: isSlotSelected(item.idx) }"
              title="Özelleştirme için bu sayfayı seç / kaldır"
              @click.stop="toggleSlotSelection(item.idx)"
            >
              <Check v-if="isSlotSelected(item.idx)" :size="11" stroke-width="3" />
            </button>

            <!-- Individual Mini Paper Thumbnail -->
            <div
              class="single-mini-thumb"
              :class="`mini-${getPageType(item.page)}`"
              :style="getMiniPaperStyle(item.page)"
            >
              <span class="thumb-num">{{ item.idx + 1 }}</span>
            </div>

            <div class="single-slot-info">
              <div class="slot-title-row">
                <span class="slot-name">Sayfa {{ item.idx + 1 }}</span>
                <span class="slot-pattern-badge">{{ getPageTypeShort(item.page) }}</span>
              </div>
              <p class="slot-snippet">{{ getPageExcerpt(item.page) }}</p>
              <div v-if="item.page.drawings || item.page.images?.length || item.page.tapes?.length || item.page.stickies?.length" class="mini-badges">
                <span v-if="item.page.drawings">🎨</span>
                <span v-if="item.page.images?.length">✨</span>
                <span v-if="item.page.tapes?.length">🩹</span>
                <span v-if="item.page.stickies?.length">📌</span>
              </div>
            </div>

            <div class="slot-hover-actions" @click.stop>
              <button
                type="button"
                class="slot-icon-btn"
                title="Altına Sayfa Ekle"
                @click="$emit('add-page-after', item.idx)"
              >
                <Plus :size="13" />
              </button>
              <button
                v-if="pages.length > 1"
                type="button"
                class="slot-icon-btn danger"
                title="Sayfayı Sil"
                @click="$emit('delete-page', item.idx)"
              >
                <Trash2 :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Add Page Button -->
      <div class="slots-footer">
        <button type="button" class="new-slot-primary-btn" @click="$emit('add-page')">
          <Plus :size="16" />
          <span>Yeni Sayfa Ekle (Sayfa {{ pages.length + 1 }})</span>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import {
  Layers, X, ChevronsRight, FileText, BookOpen, Plus, Trash2, Check, CheckSquare
} from '@lucide/vue';
import { PAPER_TYPES, PAPER_SIZES, stripHtmlToText } from '../composables/useNotes.js';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  pages: { type: Array, default: () => [] },
  activePageIndex: { type: Number, default: 0 },
  isDoublePageMode: { type: Boolean, default: false },
  paperSize: { type: String, default: 'a4' },
  paperType: { type: String, default: 'lined' },
  paperColor: { type: String, default: 'cream' },
  palette: { type: Array, default: () => [] }
});

const emit = defineEmits([
  'close',
  'select-page',
  'add-page',
  'add-page-after',
  'delete-page',
  'update:doublePageMode',
  'change-paper-size',
  'apply-paper-style'
]);

const currentPaperSizeObj = computed(() => {
  return PAPER_SIZES.find(s => s.id === props.paperSize) || PAPER_SIZES[0];
});

const isBookModeDisabled = computed(() => !currentPaperSizeObj.value.allowBook);
const currentPaperSizeBadge = computed(() => currentPaperSizeObj.value.badge);

const applyScope = ref('selected'); // 'selected' | 'all'
const selectedIndices = ref([props.activePageIndex]);
const selectedSet = computed(() => new Set(selectedIndices.value));
const slotsScrollRef = ref(null);
const slotsScrollTop = ref(0);
const jumpPageInput = ref(null);
let slotsRafId = null;

function onSlotsScroll(e) {
  const top = e.target.scrollTop;
  if (slotsRafId) return;
  slotsRafId = requestAnimationFrame(() => {
    slotsScrollTop.value = top;
    slotsRafId = null;
  });
}

function handleJumpSubmit() {
  const num = Number(jumpPageInput.value);
  if (!num || Number.isNaN(num)) return;
  const targetIdx = Math.max(0, Math.min(props.pages.length - 1, Math.round(num) - 1));
  emit('select-page', targetIdx);
  if (selectedIndices.value.length <= 1) {
    selectedIndices.value = [targetIdx];
  }
  if (slotsScrollRef.value) {
    const approxY = props.isDoublePageMode
      ? Math.floor(targetIdx / 2) * 152
      : targetIdx * 76;
    slotsScrollRef.value.scrollTo({ top: Math.max(0, approxY - 80), behavior: 'smooth' });
  }
}

// Keep selection valid when pages are added/deleted
watch(() => props.pages.length, (len) => {
  const valid = selectedIndices.value.filter(i => i >= 0 && i < len);
  selectedIndices.value = valid.length > 0 ? valid : [Math.min(props.activePageIndex, Math.max(0, len - 1))];
});

// When activePageIndex changes externally (e.g. clicking on a sheet in editor) and only 1 page was selected, follow active page
watch(() => props.activePageIndex, (newIdx) => {
  if (selectedIndices.value.length <= 1) {
    selectedIndices.value = [newIdx];
  }
});

const effectiveTargetIndices = computed(() => {
  if (applyScope.value === 'all') {
    return props.pages.map((_, idx) => idx);
  }
  if (selectedIndices.value.length > 0) {
    return [...selectedIndices.value].sort((a, b) => a - b);
  }
  return [props.activePageIndex];
});

const isOnlyActiveSelected = computed(() => {
  return selectedIndices.value.length === 1 && selectedIndices.value[0] === props.activePageIndex;
});

const targetSummaryText = computed(() => {
  if (applyScope.value === 'all') {
    return `Tümü (${props.pages.length}s)`;
  }
  const list = effectiveTargetIndices.value;
  if (list.length === 1) {
    return `Sayfa ${list[0] + 1}`;
  }
  if (list.length <= 3) {
    return list.map(i => `S.${i + 1}`).join(', ');
  }
  return `${list.length} Sayfa Seçili`;
});

function getPageType(page) {
  return page?.paperType || props.paperType || 'lined';
}

function getPageColor(page) {
  return page?.paperColor || props.paperColor || 'cream';
}

function getPageTypeShort(page) {
  const t = getPageType(page);
  const found = PAPER_TYPES.find(item => item.id === t);
  return found ? found.name : 'Çizgili';
}

function getMiniPaperStyle(page) {
  const colId = getPageColor(page);
  const found = props.palette.find(c => c.id === colId) || props.palette[0] || {
    bg: '#FAF8F5',
    line: '#DDD6CA',
    text: '#2C2A29'
  };
  return {
    '--mini-bg': found.bg,
    '--mini-line': found.line,
    '--mini-text': found.text
  };
}

// Highlight chip/swatch if all targeted pages currently share the same type/color
const activeSharedType = computed(() => {
  const targets = effectiveTargetIndices.value.map(i => props.pages[i]).filter(Boolean);
  if (!targets.length) return props.paperType;
  const first = getPageType(targets[0]);
  return targets.every(p => getPageType(p) === first) ? first : null;
});

const activeSharedColor = computed(() => {
  const targets = effectiveTargetIndices.value.map(i => props.pages[i]).filter(Boolean);
  if (!targets.length) return props.paperColor;
  const first = getPageColor(targets[0]);
  return targets.every(p => getPageColor(p) === first) ? first : null;
});

function isSlotSelected(idx) {
  if (applyScope.value === 'all') return true;
  return selectedSet.value.has(idx);
}

function toggleSlotSelection(idx) {
  applyScope.value = 'selected';
  if (selectedIndices.value.includes(idx)) {
    if (selectedIndices.value.length > 1) {
      selectedIndices.value = selectedIndices.value.filter(i => i !== idx);
    }
  } else {
    selectedIndices.value = [...selectedIndices.value, idx].sort((a, b) => a - b);
  }
}

function selectOnlyActive() {
  applyScope.value = 'selected';
  selectedIndices.value = [props.activePageIndex];
}

function selectFromActiveToEnd() {
  applyScope.value = 'selected';
  const range = [];
  for (let i = props.activePageIndex; i < props.pages.length; i++) {
    range.push(i);
  }
  selectedIndices.value = range.length > 0 ? range : [props.activePageIndex];
}

function toggleSelectAllSlots() {
  applyScope.value = 'selected';
  if (selectedIndices.value.length === props.pages.length) {
    selectedIndices.value = [props.activePageIndex];
  } else {
    selectedIndices.value = props.pages.map((_, i) => i);
  }
}

function onSlotCardClick(idx, event) {
  if (event && (event.ctrlKey || event.metaKey)) {
    toggleSlotSelection(idx);
    return;
  }
  if (event && event.shiftKey) {
    applyScope.value = 'selected';
    const start = Math.min(props.activePageIndex, idx);
    const end = Math.max(props.activePageIndex, idx);
    const range = [];
    for (let i = start; i <= end; i++) range.push(i);
    selectedIndices.value = range;
    emit('select-page', idx);
    return;
  }

  emit('select-page', idx);
  if (selectedIndices.value.length <= 1) {
    selectedIndices.value = [idx];
  }
}

function applyPattern(typeId) {
  emit('apply-paper-style', {
    scope: applyScope.value,
    indices: effectiveTargetIndices.value,
    paperType: typeId
  });
}

function applyColor(colorId) {
  emit('apply-paper-style', {
    scope: applyScope.value,
    indices: effectiveTargetIndices.value,
    paperColor: colorId
  });
}

const spreads = computed(() => {
  const list = [];
  for (let i = 0; i < props.pages.length; i += 2) {
    list.push({
      spreadIndex: Math.floor(i / 2),
      leftPage: props.pages[i],
      leftIndex: i,
      rightPage: props.pages[i + 1] || null,
      rightIndex: i + 1
    });
  }
  return list;
});

const visibleSingleWindow = computed(() => {
  const total = props.pages.length;
  if (total <= 24) {
    return {
      topPad: 0,
      bottomPad: 0,
      items: props.pages.map((page, idx) => ({ page, idx }))
    };
  }
  const ITEM_H = 76;
  const start = Math.max(0, Math.floor(slotsScrollTop.value / ITEM_H) - 4);
  const end = Math.min(total, start + 20);
  const items = [];
  for (let i = start; i < end; i++) {
    items.push({ page: props.pages[i], idx: i });
  }
  return {
    topPad: start * ITEM_H,
    bottomPad: Math.max(0, (total - end) * ITEM_H),
    items
  };
});

const visibleSpreadWindow = computed(() => {
  const all = spreads.value;
  const total = all.length;
  if (total <= 14) {
    return {
      topPad: 0,
      bottomPad: 0,
      items: all
    };
  }
  const SPREAD_H = 152;
  const start = Math.max(0, Math.floor(slotsScrollTop.value / SPREAD_H) - 3);
  const end = Math.min(total, start + 12);
  return {
    topPad: start * SPREAD_H,
    bottomPad: Math.max(0, (total - end) * SPREAD_H),
    items: all.slice(start, end)
  };
});

function getPageExcerpt(page) {
  if (!page) return 'Boş sayfa...';
  if (typeof page.excerpt === 'string') {
    return page.excerpt ? page.excerpt.slice(0, 52) : 'Boş sayfa...';
  }
  const txt = stripHtmlToText(page.content);
  return txt ? txt.slice(0, 52) : 'Boş sayfa...';
}

function closeDrawer() {
  emit('close');
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    e.stopPropagation();
    emit('close');
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  if (slotsRafId) cancelAnimationFrame(slotsRafId);
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
/* Stable Frosted-Glass Wing — Identical visual language to Sidebar.vue (Klasörler), NO background blur! */
.lumina-slots-wing {
  width: 306px;
  height: calc(100vh - 24px);
  margin: 12px 12px 12px 0;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  box-shadow:
    0 12px 36px -8px rgba(0, 0, 0, 0.08),
    0 0 0 1px var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  color: var(--color-text-main);
  z-index: 46;
}

.slots-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 14px 12px 16px;
  border-bottom: 1px solid var(--border-color);
  gap: 8px;
}

.slots-title-group {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.slots-orb {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.slots-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.slots-title {
  font-size: 14px;
  font-weight: 800;
  margin: 0;
  line-height: 1.15;
  white-space: nowrap;
}

.slots-sub {
  font-size: 10.5px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.slots-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.slots-icon-btn,
.slots-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s ease;
}

.slots-close-btn {
  border-color: var(--border-color);
  background: var(--bg-surface-subtle);
}

.slots-icon-btn:hover {
  background: var(--bg-surface);
  border-color: var(--border-color);
  color: var(--color-primary);
}

.slots-close-btn:hover {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.35);
  color: #ef4444;
}

/* Quick Layout & Customization Controls */
.layout-quick-card {
  padding: 11px 14px;
  background: var(--bg-surface-subtle);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.quick-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.q-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.q-label {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.7px;
  color: var(--color-text-muted);
}

.q-target-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 99px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.q-segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: rgba(0, 0, 0, 0.045);
  padding: 3px;
  border-radius: 10px;
}

[data-theme="dark"] .q-segmented {
  background: rgba(0, 0, 0, 0.25);
}

.q-seg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5.5px 6px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.q-seg-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  font-weight: 700;
}

.q-seg-btn.disabled {
  opacity: 0.38;
  cursor: not-allowed;
  pointer-events: none;
}

/* Selection Helpers */
.selection-helpers {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.sel-helper-chip {
  flex: 1;
  padding: 3.5px 6px;
  border-radius: 7px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.sel-helper-chip:hover,
.sel-helper-chip.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.q-chips {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.q-chip {
  padding: 5px 4px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.q-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.q-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
}

[data-theme="dark"] .q-chip.active {
  color: #111118;
}

.q-swatches {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  padding: 2px 2px;
}

.q-swatch {
  width: 23px;
  height: 23px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: transform 0.15s;
}

.q-swatch:hover {
  transform: scale(1.14);
}

.q-swatch.active {
  transform: scale(1.22);
  box-shadow: 0 0 0 2.5px var(--color-primary);
}

.jump-page-form {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.jump-page-input {
  flex: 1;
  min-width: 0;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--color-text-main);
  font-size: 11px;
  font-weight: 600;
  outline: none;
}

.jump-page-input:focus {
  border-color: var(--color-primary);
}

.jump-page-btn {
  padding: 5px 10px;
  border-radius: 8px;
  border: none;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

[data-theme="dark"] .jump-page-btn {
  color: #111118;
}

/* Slots Scroll */
.slots-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 13px;
}

/* Slot Multi-Select Checkbox */
.slot-check-btn {
  width: 17px;
  height: 17px;
  border-radius: 5px;
  border: 1.5px solid rgba(100, 116, 139, 0.55);
  background: rgba(255, 255, 255, 0.65);
  color: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.14s ease;
}

[data-theme="dark"] .slot-check-btn {
  background: rgba(15, 23, 42, 0.55);
}

.slot-check-btn.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
}

[data-theme="dark"] .slot-check-btn.checked {
  color: #111118;
}

/* Book Spreads */
.spread-slots-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.spread-slot-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.spread-group-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-muted);
  padding: 0 3px;
}

.spread-range {
  font-weight: 600;
  color: var(--color-primary);
}

.mini-book-spread {
  display: flex;
  align-items: stretch;
  height: 118px;
}

.mini-sheet {
  flex: 1;
  background-color: var(--mini-bg);
  color: var(--mini-text);
  border: 1.5px solid var(--mini-line);
  padding: 7px 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  cursor: pointer;
  transition: all 0.18s ease;
  overflow: hidden;
}

.mini-sheet.left-side {
  border-radius: 10px 2px 2px 10px;
  border-right: none;
}

.mini-sheet.right-side {
  border-radius: 2px 10px 10px 2px;
  border-left: none;
}

.mini-sheet.is-checked {
  border-color: var(--color-primary);
}

.mini-sheet.active {
  box-shadow: 0 0 0 2px var(--color-primary);
  z-index: 2;
}

.mini-spine {
  width: 5px;
  background: linear-gradient(90deg, rgba(0,0,0,0.18), rgba(255,255,255,0.2), rgba(0,0,0,0.18));
  z-index: 3;
}

.mini-lined {
  background-image: repeating-linear-gradient(transparent, transparent 11px, var(--mini-line) 11px, var(--mini-line) 12px);
}

.mini-grid {
  background-image:
    repeating-linear-gradient(transparent, transparent 11px, var(--mini-line) 11px, var(--mini-line) 12px),
    repeating-linear-gradient(90deg, transparent, transparent 11px, var(--mini-line) 11px, var(--mini-line) 12px);
}

.mini-dot {
  background-image: radial-gradient(var(--mini-line) 1.15px, transparent 1.15px);
  background-size: 9px 9px;
}

.mini-plain {
  background-image: none;
}

.mini-sheet-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.mini-top-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-num {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 99px;
  background: rgba(0, 0, 0, 0.09);
}

.mini-type-tag {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.72);
  color: #334155;
}

[data-theme="dark"] .mini-type-tag {
  background: rgba(0, 0, 0, 0.48);
  color: #e2e8f0;
}

.mini-excerpt {
  font-size: 9.5px;
  line-height: 1.3;
  opacity: 0.78;
  margin: 3px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mini-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 18px;
}

.mini-badges {
  display: flex;
  gap: 2px;
  font-size: 10px;
}

.mini-del-btn {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: none;
  background: rgba(239, 68, 68, 0.14);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.15s;
}

.mini-sheet:hover .mini-del-btn {
  opacity: 1;
}

.empty-add-slot {
  background: var(--bg-surface-subtle);
  border: 1.5px dashed var(--border-color);
  color: var(--color-primary);
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}

/* Single Slots */
.single-slots-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.single-slot-card {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 9px;
  border-radius: 14px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-surface-subtle);
  cursor: pointer;
  transition: all 0.18s ease;
}

.single-slot-card:hover {
  border-color: var(--color-primary);
}

.single-slot-card.is-checked {
  border-color: color-mix(in srgb, var(--color-primary) 55%, var(--border-color));
}

.single-slot-card.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.single-mini-thumb {
  width: 38px;
  height: 50px;
  border-radius: 7px;
  background-color: var(--mini-bg);
  color: var(--mini-text);
  border: 1px solid var(--mini-line);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thumb-num {
  font-size: 12px;
  font-weight: 800;
}

.single-slot-info {
  flex: 1;
  min-width: 0;
}

.slot-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.slot-name {
  font-size: 12px;
  font-weight: 700;
}

.slot-pattern-badge {
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--color-text-muted);
}

.slot-snippet {
  font-size: 10.5px;
  color: var(--color-text-muted);
  margin: 2px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-hover-actions {
  display: flex;
  gap: 3px;
}

.slot-icon-btn {
  width: 25px;
  height: 25px;
  border-radius: 7px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.slot-icon-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.slot-icon-btn.danger:hover {
  color: #ef4444;
  border-color: #ef4444;
}

/* Footer */
.slots-footer {
  padding: 10px 14px 14px 14px;
  border-top: 1px solid var(--border-color);
}

.new-slot-primary-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 13px;
  border: none;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
}

[data-theme="dark"] .new-slot-primary-btn {
  color: #111118;
}

.new-slot-primary-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

/* Responsive: On smaller screens (< 1380px), float cleanly on right edge WITHOUT blurring the page */
@media (max-width: 1380px) {
  .lumina-slots-wing {
    position: fixed;
    top: 12px;
    right: 48px;
    bottom: 12px;
    margin: 0;
    z-index: 85;
    box-shadow:
      -12px 12px 40px rgba(0, 0, 0, 0.18),
      0 0 0 1px var(--border-color);
  }
}

@media (max-width: 640px) {
  .lumina-slots-wing {
    right: 8px;
    left: 8px;
    width: auto;
    max-width: 340px;
    margin-left: auto;
  }
}

/* Wing Slide Transition */
.wing-slots-enter-active,
.wing-slots-leave-active {
  transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.wing-slots-enter-from,
.wing-slots-leave-to {
  opacity: 0;
  transform: translateX(22px);
}
</style>
