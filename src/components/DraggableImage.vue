<template>
  <div 
    class="draggable-image-wrapper"
    :class="{ 
      selected: isSelected, 
      'drawing-locked': disabled, 
      'is-sticker': image.isSticker,
      'is-dragging': isDragging
    }"
    :style="{
      transform: `translate3d(${localX}px, ${localY}px, 0)`,
      width: `${localWidth}px`,
      zIndex: isDragging ? 99999 : (isSelected ? 50 : 8)
    }"
    @pointerdown.stop="handlePointerDown"
  >
    <div class="image-inner">
      <img :src="image.src" class="placed-image" draggable="false" decoding="async" />

      <!-- Delete Button (Shown when selected) -->
      <button 
        v-if="isSelected && !disabled" 
        class="img-delete-btn" 
        @pointerdown.stop
        @click.stop="$emit('delete', image.id)"
        title="Resmi Sil"
      >
        &times;
      </button>

      <!-- Quick Page Shift Pill (Shown when selected and multiple pages exist) -->
      <div v-if="isSelected && !disabled && totalPages > 1" class="page-shift-pill" @pointerdown.stop>
        <button
          v-if="pageIndex > 0"
          type="button"
          class="shift-btn"
          @click.stop="$emit('transfer-to-page', { fromPageIndex: pageIndex, toPageIndex: pageIndex - 1, imageId: image.id, x: localX, y: 60 })"
          :title="`Sayfa ${pageIndex}'e Taşı`"
        >
          <span>↑ S.{{ pageIndex }}</span>
        </button>
        <span class="shift-cur">S.{{ pageIndex + 1 }}</span>
        <button
          v-if="pageIndex < totalPages - 1"
          type="button"
          class="shift-btn"
          @click.stop="$emit('transfer-to-page', { fromPageIndex: pageIndex, toPageIndex: pageIndex + 1, imageId: image.id, x: localX, y: 60 })"
          :title="`Sayfa ${pageIndex + 2}'ye Taşı`"
        >
          <span>↓ S.{{ pageIndex + 2 }}</span>
        </button>
      </div>

      <!-- Resize Handle (Bottom-Right) -->
      <div 
        v-if="isSelected && !disabled" 
        class="resize-handle se-handle"
        @pointerdown.stop="handleResizeStart"
        title="Boyutlandır"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, inject } from 'vue';

const stageScale = inject('stageScale', ref(1));

const props = defineProps({
  image: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  pageIndex: {
    type: Number,
    default: 0
  },
  totalPages: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['select', 'update', 'delete', 'transfer-to-page']);

const localX = ref(props.image.x || 0);
const localY = ref(props.image.y || 0);
const localWidth = ref(props.image.width || 240);
const localHeight = ref(props.image.height || 180);

const isDragging = ref(false);
let hasMoved = false;
let startX = 0;
let startY = 0;
let initialImgX = 0;
let initialImgY = 0;

let isResizing = false;
let initialWidth = 0;
let initialHeight = 0;
let aspectRatio = 1;

watch(
  () => [props.image.x, props.image.y, props.image.width, props.image.height],
  ([nx, ny, nw, nh]) => {
    if (!isDragging.value && !isResizing) {
      localX.value = nx ?? 0;
      localY.value = ny ?? 0;
      localWidth.value = nw ?? 240;
      localHeight.value = nh ?? 180;
    }
  }
);

function handlePointerDown(e) {
  if (props.disabled) return;
  emit('select', props.image.id);

  isDragging.value = true;
  hasMoved = false;
  startX = e.clientX;
  startY = e.clientY;
  initialImgX = localX.value;
  initialImgY = localY.value;

  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragEnd);
}

function onDragMove(e) {
  if (!isDragging.value) return;
  const s = stageScale.value || 1;
  const dx = (e.clientX - startX) / s;
  const dy = (e.clientY - startY) / s;
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) hasMoved = true;

  localX.value = Math.round(initialImgX + dx);
  localY.value = Math.round(initialImgY + dy);
}

function onDragEnd(e) {
  if (isDragging.value && hasMoved) {
    // Check if the image was dragged over another page sheet
    const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY) || [];
    const targetSheet = elementsAtPoint.find(el => el.classList && el.classList.contains('digital-sheet'));

    if (targetSheet) {
      const targetPageStr = targetSheet.getAttribute('data-page-index');
      if (targetPageStr !== null && targetPageStr !== undefined) {
        const targetIdx = parseInt(targetPageStr, 10);
        if (!isNaN(targetIdx) && targetIdx !== props.pageIndex) {
          const contentWrapper = targetSheet.querySelector('.sheet-content-wrapper') || targetSheet;
          const rect = contentWrapper.getBoundingClientRect();
          const s = stageScale.value || 1;
          const dropX = Math.max(10, Math.round((e.clientX - rect.left) / s - (localWidth.value / 2)));
          const dropY = Math.max(10, Math.round((e.clientY - rect.top) / s - 30));

          emit('transfer-to-page', {
            fromPageIndex: props.pageIndex,
            toPageIndex: targetIdx,
            imageId: props.image.id,
            x: dropX,
            y: dropY
          });
          isDragging.value = false;
          hasMoved = false;
          window.removeEventListener('pointermove', onDragMove);
          window.removeEventListener('pointerup', onDragEnd);
          return;
        }
      }
    }

    emit('update', {
      id: props.image.id,
      x: Math.max(0, localX.value),
      y: Math.max(0, localY.value),
      width: localWidth.value,
      height: localHeight.value
    });
  }
  isDragging.value = false;
  hasMoved = false;
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
}

function handleResizeStart(e) {
  if (props.disabled) return;
  e.stopPropagation();
  isResizing = true;
  hasMoved = false;
  startX = e.clientX;
  startY = e.clientY;
  initialWidth = localWidth.value || 260;
  initialHeight = localHeight.value || 180;
  aspectRatio = initialWidth / Math.max(1, initialHeight);

  window.addEventListener('pointermove', onResizeMove);
  window.addEventListener('pointerup', onResizeEnd);
}

function onResizeMove(e) {
  if (!isResizing) return;
  const s = stageScale.value || 1;
  const dx = (e.clientX - startX) / s;
  if (Math.abs(dx) > 1) hasMoved = true;
  const newWidth = Math.max(60, Math.min(800, initialWidth + dx));
  const newHeight = newWidth / aspectRatio;

  localWidth.value = Math.round(newWidth);
  localHeight.value = Math.round(newHeight);
}

function onResizeEnd() {
  if (isResizing && hasMoved) {
    emit('update', {
      id: props.image.id,
      x: localX.value,
      y: localY.value,
      width: localWidth.value,
      height: localHeight.value
    });
  }
  isResizing = false;
  hasMoved = false;
  window.removeEventListener('pointermove', onResizeMove);
  window.removeEventListener('pointerup', onResizeEnd);
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
  window.removeEventListener('pointermove', onResizeMove);
  window.removeEventListener('pointerup', onResizeEnd);
});
</script>

<style scoped>
.draggable-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
  z-index: 8;
  cursor: grab;
  user-select: none;
}

.draggable-image-wrapper:active {
  cursor: grabbing;
}

.draggable-image-wrapper.is-dragging {
  z-index: 99999 !important;
  opacity: 0.94;
  cursor: grabbing;
  filter: drop-shadow(0 14px 30px rgba(0, 0, 0, 0.28));
}

.draggable-image-wrapper.drawing-locked {
  pointer-events: none;
}

.image-inner {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: visible;
  transition: box-shadow 0.15s ease;
}

.placed-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  pointer-events: none;
  background: white;
}

.draggable-image-wrapper.is-sticker .placed-image {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.22));
}

.draggable-image-wrapper.selected .image-inner {
  outline: 2px dashed #2563eb;
  outline-offset: 4px;
}

.draggable-image-wrapper.is-sticker.selected .image-inner {
  outline: 2px dashed #ec4899;
}

.img-delete-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: 2px solid white;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
  z-index: 10;
}

.img-delete-btn:hover {
  transform: scale(1.15);
  background: #dc2626;
}

.resize-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #2563eb;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.se-handle {
  right: -8px;
  bottom: -8px;
  cursor: se-resize;
}

.page-shift-pill {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.18));
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  z-index: 20;
  white-space: nowrap;
}

.shift-btn {
  background: var(--color-primary-soft, rgba(124, 58, 237, 0.12));
  color: var(--color-primary, #7c3aed);
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
}

.shift-btn:hover {
  background: var(--color-primary, #7c3aed);
  color: #ffffff;
  transform: scale(1.06);
}

.shift-cur {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-muted, #64748b);
  padding: 0 4px;
}
</style>
