<template>
  <div 
    ref="sheetRootRef"
    class="digital-sheet"
    :data-page-index="pageIndex"
    :class="[
      `pattern-${paperType}`,
      `align-${align}`,
      `book-side-${bookSide}`,
      `size-${paperSize}`,
      { 
        'is-book-mode': isBookMode && paperSize !== 'a3' && paperSize !== 'canvas',
        'is-active-page': isActive,
        'is-canvas-mode': paperSize === 'canvas'
      }
    ]"
    :style="sheetThemeStyle"
    @pointerdown="handleSheetPointerDown"
    @click="handleSheetClick"
  >
    <!-- Subtle Whisper-Light Page Header -->
    <div class="sheet-top-header no-print" @click.stop>
      <div class="page-header-left">
        <div class="page-num-badge">
          <span class="page-pill-dot"></span>
          <span>Sayfa {{ pageNumber }}</span>
          <span class="total-pages-hint">/ {{ totalPages }}</span>
        </div>

        <button
          type="button"
          class="sheet-pattern-pill"
          @click="cycleSheetPattern"
          :title="`Bu sayfanın deseni: ${paperTypeLabel} (Sadece bu sayfayı değiştirmek için tıkla)`"
        >
          <span class="sheet-color-dot" :style="{ backgroundColor: sheetColorConfig.preview }"></span>
          <span>{{ paperTypeLabel }}</span>
        </button>
      </div>

      <div class="sheet-actions">
        <button 
          type="button"
          class="sheet-action-btn"
          @click="$emit('add-page-after', pageIndex)"
          title="Bu sayfadan sonra yeni sayfa aç"
        >
          <Plus :size="12" />
          <span>Yeni Sayfa</span>
        </button>

        <button 
          v-if="totalPages > 1"
          type="button"
          class="sheet-action-btn del-btn"
          @click="$emit('delete-page', pageIndex)"
          title="Bu sayfayı sil"
        >
          <Trash2 :size="12" />
        </button>
      </div>
    </div>

    <!-- The Paper Body with Text, Stickers/Images, Post-its, Tapes & Drawing Canvas -->
    <div class="sheet-content-wrapper" ref="sheetWrapperRef">
      <!-- Text Layer -->
      <div
        ref="editableAreaRef"
        class="note-editable-area"
        :class="[`align-${align}`, { 'handwriting-font': fontFamily === 'Caveat', 'drawing-lock': isDrawingMode }]"
        :style="{ 
          textAlign: align,
          color: sheetColorConfig.text,
          fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : undefined
        }"
        :contenteditable="!isDrawingMode"
        spellcheck="false"
        :data-placeholder="pageIndex === 0 ? 'Düşüncelerinizi buraya bırakın... Satırlar çizgilere kusursuz hizalanır.' : `Sayfa ${pageNumber}...`"
        @focus="$emit('focus-page', pageIndex)"
        @click="handleSmartLinePlacement"
        @input="onEditableInput"
        @blur="onEditableInput"
        @keydown="onEditableKeydown"
        @paste="onEditablePaste"
      ></div>

      <!-- Freeform Draggable & Resizable Images / Transparent Stickers Layer -->
      <DraggableImage
        v-for="img in localImages"
        :key="img.id"
        :image="img"
        :page-index="pageIndex"
        :total-pages="totalPages"
        :is-selected="selectedElementId === img.id"
        :disabled="isDrawingMode"
        @select="$emit('select-element', $event)"
        @update="updateImage"
        @delete="removeImage"
        @transfer-to-page="$emit('transfer-image', $event)"
      />

      <!-- Draggable Post-it Sticky Notes -->
      <DraggableSticky
        v-for="sticky in localStickies"
        :key="sticky.id"
        :sticky="sticky"
        :is-selected="selectedElementId === sticky.id"
        :disabled="isDrawingMode"
        @select="$emit('select-element', $event)"
        @update="updateSticky"
        @delete="removeSticky"
      />

      <!-- Flashcard Study Tapes & Washi Tapes -->
      <StudyTape
        v-for="tape in localTapes"
        :key="tape.id"
        :tape="tape"
        :is-selected="selectedElementId === tape.id"
        :disabled="isDrawingMode"
        @select="$emit('select-element', $event)"
        @update="updateTape"
        @delete="removeTape"
      />

      <!-- Drawing Layer -->
      <DrawingCanvas
        ref="drawingCanvasRef"
        :is-drawing-mode="isDrawingMode"
        :current-tool="currentTool"
        :brush-color="brushColor"
        :brush-size="brushSize"
        :brush-opacity="brushOpacity"
        :initial-drawing-data="page.drawings"
        :is-smart-shape="isSmartShape"
        @save-drawing="onDrawingSave"
      />
    </div>

    <!-- Authentic Book Page Bottom Number & Word Count -->
    <div class="sheet-bottom-dock">
      <div class="sheet-bottom-num">
        — {{ pageNumber }} —
      </div>
      <div v-if="pageWordCount > 0" class="sheet-word-count no-print" title="Bu sayfadaki kelime ve karakter sayısı">
        {{ pageWordCount }} kelime • {{ pageCharCount }} karakter
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Plus, Trash2 } from '@lucide/vue';
import { PAPER_TYPES, resolvePaperColor } from '../composables/useNotes.js';
import { playKeystrokeSound } from '../composables/useSettings.js';
import DrawingCanvas from './DrawingCanvas.vue';
import DraggableImage from './DraggableImage.vue';
import DraggableSticky from './DraggableSticky.vue';
import StudyTape from './StudyTape.vue';

const props = defineProps({
  page: { type: Object, required: true },
  pageIndex: { type: Number, required: true },
  pageNumber: { type: Number, required: true },
  totalPages: { type: Number, default: 1 },
  isActive: { type: Boolean, default: false },
  isDarkMode: { type: Boolean, default: false },
  paperSize: { type: String, default: 'a4' },
  paperType: { type: String, default: 'lined' },
  paperColor: { type: String, default: 'cream' },
  align: { type: String, default: 'left' },
  fontFamily: { type: String, default: 'Plus Jakarta Sans' },
  fontSize: { type: Number, default: 17 },
  isDrawingMode: { type: Boolean, default: false },
  currentTool: { type: String, default: 'pen' },
  brushColor: { type: String, default: '#1E293B' },
  brushSize: { type: Number, default: 3 },
  brushOpacity: { type: Number, default: 1.0 },
  isSmartShape: { type: Boolean, default: true },
  isBookMode: { type: Boolean, default: false },
  bookSide: { type: String, default: 'single' },
  selectedElementId: { type: String, default: null },
  textColor: { type: String, default: '#2C2A29' }
});

const emit = defineEmits([
  'update-content',
  'update-drawings',
  'update-images',
  'update-stickies',
  'update-tapes',
  'update-page-style',
  'select-element',
  'add-page-after',
  'delete-page',
  'focus-page',
  'transfer-image'
]);

const sheetColorConfig = computed(() => {
  return resolvePaperColor(props.paperColor, props.isDarkMode);
});

const sheetThemeStyle = computed(() => {
  const c = sheetColorConfig.value;
  return {
    '--paper-bg': c.bg,
    '--paper-line': c.line,
    '--paper-text': c.text,
    '--note-font-size': `${props.fontSize || 17}px`
  };
});

const paperTypeLabel = computed(() => {
  const found = PAPER_TYPES.find(pt => pt.id === props.paperType);
  return found ? found.name : 'Çizgili';
});

const pageWordCount = computed(() => {
  const raw = (props.page?.content || '').replace(/<[^>]+>/g, ' ').trim();
  if (!raw) return 0;
  return raw.split(/\s+/).filter(Boolean).length;
});

const pageCharCount = computed(() => {
  const raw = (props.page?.content || '').replace(/<[^>]+>/g, '').trim();
  return raw.length;
});

function cycleSheetPattern() {
  const ids = PAPER_TYPES.map(pt => pt.id);
  const curIdx = ids.indexOf(props.paperType);
  const nextType = ids[(curIdx + 1) % ids.length];
  emit('update-page-style', {
    pageIndex: props.pageIndex,
    paperType: nextType
  });
}

const sheetRootRef = ref(null);
const editableAreaRef = ref(null);
const sheetWrapperRef = ref(null);
const drawingCanvasRef = ref(null);

const localImages = ref(props.page.images ? [...props.page.images] : []);
const localStickies = ref(props.page.stickies ? [...props.page.stickies] : []);
const localTapes = ref(props.page.tapes ? [...props.page.tapes] : []);

// Watch page ID changes or external updates without disturbing active typing cursor
watch(() => props.page.id, () => {
  setEditableContent(props.page.content || '');
});

watch(() => props.page, (newVal) => {
  if (!newVal) return;
  localImages.value = newVal.images ? [...newVal.images] : [];
  localStickies.value = newVal.stickies ? [...newVal.stickies] : [];
  localTapes.value = newVal.tapes ? [...newVal.tapes] : [];

  if (
    editableAreaRef.value &&
    document.activeElement !== editableAreaRef.value &&
    editableAreaRef.value.innerHTML !== (newVal.content || '')
  ) {
    setEditableContent(newVal.content || '');
  }
}, { deep: true });

onMounted(() => {
  setEditableContent(props.page.content || '');
});

function setEditableContent(html) {
  if (!editableAreaRef.value) return;
  editableAreaRef.value.innerHTML = html || '';
}

function onEditableInput() {
  if (!editableAreaRef.value) return;
  emit('update-content', {
    pageIndex: props.pageIndex,
    content: editableAreaRef.value.innerHTML
  });
}

function onEditableKeydown(e) {
  // Ignore isolated modifier keys
  if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
    return;
  }
  playKeystrokeSound();
}

function onEditablePaste(e) {
  const items = (e.clipboardData || window.clipboardData)?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type && item.type.startsWith('image/')) {
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) continue;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target?.result;
        if (!base64) return;
        const newImg = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          src: base64,
          x: 45 + Math.random() * 30,
          y: 60 + Math.random() * 40,
          width: 260,
          height: 195,
          rotation: 0
        };
        localImages.value.push(newImg);
        emit('update-images', {
          pageIndex: props.pageIndex,
          images: localImages.value
        });
      };
      reader.readAsDataURL(file);
      return;
    }
  }
}

function handleSheetPointerDown(e) {
  emit('focus-page', props.pageIndex);
}

function getExistingContentBottom(area) {
  if (!area) return 0;
  const areaRect = area.getBoundingClientRect();
  const style = window.getComputedStyle(area);
  const padTop = parseFloat(style.paddingTop) || 0;

  if (!area.hasChildNodes() || area.innerText.trim().length === 0) {
    return areaRect.top + padTop;
  }

  try {
    const range = document.createRange();
    range.selectNodeContents(area);
    range.collapse(false);
    const rects = range.getClientRects();
    if (rects.length > 0) {
      return rects[rects.length - 1].bottom;
    }
  } catch (err) {}

  const last = area.lastElementChild;
  if (last) {
    return last.getBoundingClientRect().bottom;
  }

  return areaRect.top + padTop;
}

function handleSmartLinePlacement(e) {
  if (e._smartLinePlaced) return;
  if (props.isDrawingMode) return;
  const area = editableAreaRef.value;
  if (!area) return;

  if (e.target.closest('input, textarea, button, .study-tape-wrapper, .draggable-sticky-wrapper, .draggable-image-wrapper, .sheet-top-header, .sheet-bottom-dock')) {
    return;
  }

  const sel = window.getSelection();
  if (sel && !sel.isCollapsed && sel.toString().length > 0) {
    return;
  }

  const areaRect = area.getBoundingClientRect();
  const style = window.getComputedStyle(area);
  const lineHeight = parseFloat(style.lineHeight) || (props.isBookMode ? 36 : 40);
  const paddingTop = parseFloat(style.paddingTop) || 0;

  if (e.clientY < areaRect.top) return;

  const contentBottom = getExistingContentBottom(area);

  // If user clicked below existing content (threshold of ~40% line height)
  if (e.clientY > contentBottom + (lineHeight * 0.4)) {
    e._smartLinePlaced = true;
    const isCompletelyEmpty = area.innerText.trim().length === 0;

    if (isCompletelyEmpty) {
      const clickOffsetY = Math.max(0, e.clientY - (areaRect.top + paddingTop));
      const targetLineIdx = Math.min(28, Math.floor(clickOffsetY / lineHeight));

      if (targetLineIdx > 0) {
        area.innerHTML = '';
        let targetLine = null;
        for (let i = 0; i <= targetLineIdx; i++) {
          const div = document.createElement('div');
          div.appendChild(document.createElement('br'));
          area.appendChild(div);
          targetLine = div;
        }

        if (targetLine && sel) {
          const r = document.createRange();
          r.setStart(targetLine, 0);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }
        area.focus();
        onEditableInput();
        return;
      }
    } else {
      const distanceBelow = e.clientY - contentBottom;
      const linesToAdd = Math.min(26, Math.max(1, Math.round(distanceBelow / lineHeight)));

      let targetLine = null;
      for (let i = 0; i < linesToAdd; i++) {
        const div = document.createElement('div');
        div.appendChild(document.createElement('br'));
        area.appendChild(div);
        targetLine = div;
      }

      if (targetLine && sel) {
        const r = document.createRange();
        r.setStart(targetLine, 0);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      area.focus();
      onEditableInput();
      return;
    }
  }
}

function handleSheetClick(e) {
  emit('focus-page', props.pageIndex);
  if (props.isDrawingMode) return;
  if (e.target.closest('input, textarea, button, .study-tape-wrapper, .draggable-sticky-wrapper, .draggable-image-wrapper, .sheet-top-header, .sheet-bottom-dock')) {
    return;
  }
  if (props.selectedElementId) {
    emit('select-element', null);
  }
  handleSmartLinePlacement(e);
  if (editableAreaRef.value && e.target !== editableAreaRef.value) {
    editableAreaRef.value.focus();
  }
}

function onDrawingSave(dataUrl) {
  emit('update-drawings', {
    pageIndex: props.pageIndex,
    drawings: dataUrl
  });
}

function updateImage(updated) {
  const idx = localImages.value.findIndex(i => i.id === updated.id);
  if (idx !== -1) {
    localImages.value[idx] = { ...localImages.value[idx], ...updated };
    emit('update-images', { pageIndex: props.pageIndex, images: localImages.value });
  }
}

function removeImage(imgId) {
  localImages.value = localImages.value.filter(i => i.id !== imgId);
  emit('update-images', { pageIndex: props.pageIndex, images: localImages.value });
}

function updateSticky(updated) {
  const idx = localStickies.value.findIndex(s => s.id === updated.id);
  if (idx !== -1) {
    localStickies.value[idx] = { ...localStickies.value[idx], ...updated };
    emit('update-stickies', { pageIndex: props.pageIndex, stickies: localStickies.value });
  }
}

function removeSticky(stickyId) {
  localStickies.value = localStickies.value.filter(s => s.id !== stickyId);
  emit('update-stickies', { pageIndex: props.pageIndex, stickies: localStickies.value });
}

function updateTape(updated) {
  const idx = localTapes.value.findIndex(t => t.id === updated.id);
  if (idx !== -1) {
    localTapes.value[idx] = { ...localTapes.value[idx], ...updated };
    emit('update-tapes', { pageIndex: props.pageIndex, tapes: localTapes.value });
  }
}

function removeTape(tapeId) {
  localTapes.value = localTapes.value.filter(t => t.id !== tapeId);
  emit('update-tapes', { pageIndex: props.pageIndex, tapes: localTapes.value });
}

function getCurrentContent() {
  return editableAreaRef.value ? editableAreaRef.value.innerHTML : (props.page.content || '');
}

defineExpose({
  sheetRootRef,
  scrollIntoViewSmooth: () => {
    sheetRootRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  focusText: () => editableAreaRef.value?.focus(),
  undoDrawing: () => drawingCanvasRef.value?.undo(),
  redoDrawing: () => drawingCanvasRef.value?.redo(),
  clearDrawing: () => drawingCanvasRef.value?.clearCanvas(true),
  getSheetElement: () => sheetRootRef.value,
  getCurrentContent,
  insertHtml: (html) => {
    editableAreaRef.value?.focus();
    document.execCommand('insertHTML', false, html);
    onEditableInput();
  },
  insertText: (text) => {
    editableAreaRef.value?.focus();
    document.execCommand('insertText', false, text);
    onEditableInput();
  }
});
</script>

<style scoped>
.digital-sheet {
  --effective-line: color-mix(in srgb, var(--paper-line, #DDD6CA) calc(var(--line-opacity, 0.78) * 100%), transparent);
  width: 794px;
  min-height: 1123px;
  background-color: var(--paper-bg, #FAF8F5);
  box-shadow:
    0 20px 50px -12px rgba(0, 0, 0, 0.09),
    0 4px 16px -2px rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  padding: 24px 48px 52px 48px;
  position: relative;
  border: 1px solid var(--effective-line);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.digital-sheet.is-active-page,
.digital-sheet:hover,
.digital-sheet:has(.draggable-image-wrapper.selected),
.digital-sheet:has(.is-dragging) {
  z-index: 25;
}

/* Paper Size Standards: A4, A5, A3, Canvas */
.digital-sheet.size-a4 {
  width: 794px;
  min-height: 1123px;
}

.digital-sheet.size-a4.is-book-mode {
  width: 560px;
  min-height: 794px;
  padding: 20px 34px 44px 34px;
}

.digital-sheet.size-a5 {
  width: 560px;
  min-height: 794px;
  padding: 20px 36px 44px 36px;
}

.digital-sheet.size-a5.is-book-mode {
  width: 440px;
  min-height: 622px;
  padding: 16px 26px 36px 26px;
}

.digital-sheet.size-a3 {
  width: 1123px;
  min-height: 1588px;
  padding: 36px 56px 64px 56px;
}

.digital-sheet.size-canvas {
  width: 1200px;
  min-height: 1200px;
  padding: 28px 40px 48px 40px;
  border-radius: 12px;
  box-shadow: 0 16px 48px -10px rgba(0, 0, 0, 0.12);
}

.digital-sheet.is-active-page {
  box-shadow:
    0 24px 55px -12px rgba(0, 0, 0, 0.12),
    0 0 0 1.5px var(--color-primary-soft);
}

/* Book Mode: Left & Right Page Spreads */
.digital-sheet.is-book-mode {
  padding: 20px 34px 44px 34px;
}

.digital-sheet.book-side-left {
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
  border-right-width: 0;
  box-shadow:
    inset -22px 0 26px -14px rgba(0, 0, 0, 0.13),
    0 18px 40px -10px rgba(0, 0, 0, 0.09);
}

.digital-sheet.book-side-right {
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  border-top-right-radius: 18px;
  border-bottom-right-radius: 18px;
  border-left-width: 0;
  box-shadow:
    inset 22px 0 26px -14px rgba(0, 0, 0, 0.13),
    0 18px 40px -10px rgba(0, 0, 0, 0.09);
}

/* Canvas Mode: Pristine artboard without book creases */
.digital-sheet.is-canvas-mode {
  border-radius: 12px !important;
  box-shadow: 0 16px 48px -10px rgba(0, 0, 0, 0.12) !important;
}

/* Top Header */
.sheet-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--effective-line);
  user-select: none;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-num-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--paper-text, #2C2A29);
  opacity: 0.65;
}

.sheet-pattern-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  border-radius: 99px;
  border: 1px solid var(--effective-line);
  background: rgba(128, 128, 128, 0.06);
  color: var(--paper-text, #2C2A29);
  font-size: 10.5px;
  font-weight: 600;
  opacity: 0.68;
  cursor: pointer;
  transition: all 0.16s ease;
}

.sheet-pattern-pill:hover {
  opacity: 1;
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.sheet-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
}

.page-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.total-pages-hint {
  font-weight: 500;
  opacity: 0.65;
}

.sheet-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0.55;
  transition: opacity 0.2s ease;
}

.digital-sheet:hover .sheet-actions {
  opacity: 1;
}

.sheet-action-btn {
  background: rgba(128, 128, 128, 0.06);
  border: 1px solid var(--effective-line);
  border-radius: 99px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--paper-text, #2C2A29);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.sheet-action-btn:hover {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

[data-theme="dark"] .sheet-action-btn:hover {
  color: #111118;
}

.sheet-action-btn.del-btn:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

/* Sheet Content Wrapper & Paper Patterns */
.sheet-content-wrapper {
  position: relative;
  flex: 1;
  min-height: 920px;
}

.digital-sheet.is-book-mode .sheet-content-wrapper {
  min-height: 780px;
}

/* 1. Lined Paper (Synced to 40px line-height / 36px in Book Mode) */
.digital-sheet.pattern-lined .sheet-content-wrapper {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 39px,
    var(--effective-line) 39px,
    var(--effective-line) 40px
  );
}

.digital-sheet.is-book-mode.pattern-lined .sheet-content-wrapper {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 35px,
    var(--effective-line) 35px,
    var(--effective-line) 36px
  );
}

/* 2. Grid Paper */
.digital-sheet.pattern-grid .sheet-content-wrapper {
  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 39px,
      var(--effective-line) 39px,
      var(--effective-line) 40px
    ),
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent 39px,
      var(--effective-line) 39px,
      var(--effective-line) 40px
    );
}

.digital-sheet.is-book-mode.pattern-grid .sheet-content-wrapper {
  background-image:
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 35px,
      var(--effective-line) 35px,
      var(--effective-line) 36px
    ),
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent 35px,
      var(--effective-line) 35px,
      var(--effective-line) 36px
    );
}

/* 3. Dot Grid (Bullet Journal) Paper */
.digital-sheet.pattern-dot .sheet-content-wrapper {
  background-image: radial-gradient(var(--effective-line) 1.45px, transparent 1.45px);
  background-size: 20px 20px;
  background-position: 0 19px;
}

.digital-sheet.is-book-mode.pattern-dot .sheet-content-wrapper {
  background-image: radial-gradient(var(--effective-line) 1.35px, transparent 1.35px);
  background-size: 18px 18px;
  background-position: 0 17px;
}

/* 4. Cornell Note Format (Vertical cue margin + Bottom summary line + Horizontal lines) */
.digital-sheet.pattern-cornell .sheet-content-wrapper {
  background-image: 
    linear-gradient(to right, transparent 0px, transparent 180px, var(--effective-line) 180px, var(--effective-line) 181.5px, transparent 181.5px),
    linear-gradient(to top, transparent 0px, transparent 150px, var(--effective-line) 150px, var(--effective-line) 151.5px, transparent 151.5px),
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 39px,
      var(--effective-line) 39px,
      var(--effective-line) 40px
    );
}

.digital-sheet.is-book-mode.pattern-cornell .sheet-content-wrapper {
  background-image: 
    linear-gradient(to right, transparent 0px, transparent 140px, var(--effective-line) 140px, var(--effective-line) 141.5px, transparent 141.5px),
    linear-gradient(to top, transparent 0px, transparent 130px, var(--effective-line) 130px, var(--effective-line) 131.5px, transparent 131.5px),
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 35px,
      var(--effective-line) 35px,
      var(--effective-line) 36px
    );
}

/* 5. Weekly Planner Format (7 Column Grid with Lined Rows) */
.digital-sheet.pattern-planner .sheet-content-wrapper {
  background-image:
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent calc((100% - 6px) / 7),
      var(--effective-line) calc((100% - 6px) / 7),
      var(--effective-line) calc((100% - 6px) / 7 + 1px)
    ),
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 39px,
      var(--effective-line) 39px,
      var(--effective-line) 40px
    );
}

.digital-sheet.is-book-mode.pattern-planner .sheet-content-wrapper {
  background-image:
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent calc((100% - 6px) / 7),
      var(--effective-line) calc((100% - 6px) / 7),
      var(--effective-line) calc((100% - 6px) / 7 + 1px)
    ),
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 35px,
      var(--effective-line) 35px,
      var(--effective-line) 36px
    );
}

/* Note Editable Area */
.note-editable-area {
  position: relative;
  z-index: 1;
  outline: none;
  min-height: 920px;
  font-size: var(--note-font-size, 17.5px);
  line-height: 40px;
  padding-top: 2px;
  white-space: pre-wrap;
  word-break: break-word;
  user-select: text;
  cursor: text;
}

.note-editable-area.drawing-lock {
  pointer-events: none !important;
  user-select: none;
  cursor: default;
}

.note-editable-area.handwriting-font {
  font-size: calc(var(--note-font-size, 17.5px) * 1.35);
}

.digital-sheet.is-book-mode .note-editable-area {
  min-height: 780px;
  font-size: calc(var(--note-font-size, 17.5px) * 0.92);
  line-height: 36px;
}

.digital-sheet.is-book-mode .note-editable-area.handwriting-font {
  font-size: 22px;
}

.note-editable-area.align-justify {
  text-align: justify;
}

.note-editable-area:empty:before {
  content: attr(data-placeholder);
  color: rgba(120, 120, 128, 0.45);
  pointer-events: none;
  display: block;
}

/* Bottom Page Num */
.sheet-bottom-dock {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 18px;
}

.sheet-bottom-num {
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--paper-text, #2C2A29);
  opacity: 0.35;
  letter-spacing: 1px;
  user-select: none;
}

.sheet-word-count {
  position: absolute;
  right: 12px;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--paper-text, #2C2A29);
  opacity: 0.28;
  user-select: none;
  pointer-events: none;
  letter-spacing: 0.3px;
  transition: opacity 0.2s ease;
}

.sheet-bottom-dock:hover .sheet-word-count {
  opacity: 0.65;
}
</style>
