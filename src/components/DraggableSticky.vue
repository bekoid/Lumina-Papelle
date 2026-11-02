<template>
  <div 
    class="draggable-sticky-wrapper"
    :class="{ selected: isSelected, 'drawing-locked': disabled }"
    :style="{
      transform: `translate3d(${localX}px, ${localY}px, 0)`,
      width: `${localWidth}px`
    }"
    @pointerdown.stop="handlePointerDown"
  >
    <div class="sticky-inner" :style="{ backgroundColor: sticky.color || '#FEF08A' }">
      <!-- Tape visual header bar used as drag handle -->
      <div class="sticky-header" @pointerdown.stop="handlePointerDown">
        <div class="sticky-tape"></div>
        <div class="header-actions" @pointerdown.stop>
          <!-- Color picker mini dropdown / cycle -->
          <button class="sticky-tool-btn" @click.stop="cycleColor" title="Rengi Değiştir">
            🎨
          </button>
          <!-- Delete button -->
          <button class="sticky-tool-btn delete" @click.stop="$emit('delete', sticky.id)" title="Yapışkan Notu Sil">
            &times;
          </button>
        </div>
      </div>

      <!-- Editable text inside sticky -->
      <textarea 
        class="sticky-textarea"
        :value="sticky.text"
        placeholder="Yapışkan not yazın..."
        @input="onTextInput"
        @pointerdown.stop
      ></textarea>

      <!-- Resize Handle -->
      <div 
        class="sticky-resize-handle"
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
  sticky: {
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
  }
});

const emit = defineEmits(['select', 'update', 'delete']);

const stickyColors = ['#FEF08A', '#FED7AA', '#FECDD3', '#BBF7D0', '#BAE6FD', '#E9D5FF'];

const localX = ref(props.sticky.x || 0);
const localY = ref(props.sticky.y || 0);
const localWidth = ref(props.sticky.width || 210);

watch(
  () => [props.sticky.x, props.sticky.y, props.sticky.width],
  ([nx, ny, nw]) => {
    if (!isDragging && !isResizing) {
      localX.value = nx ?? 0;
      localY.value = ny ?? 0;
      localWidth.value = nw ?? 210;
    }
  }
);

let isDragging = false;
let hasMoved = false;
let startX = 0;
let startY = 0;
let initialX = 0;
let initialY = 0;

let isResizing = false;
let initialWidth = 0;

function handlePointerDown(e) {
  if (props.disabled) return;
  emit('select', props.sticky.id);

  isDragging = true;
  hasMoved = false;
  startX = e.clientX;
  startY = e.clientY;
  initialX = localX.value;
  initialY = localY.value;

  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragEnd);
}

function onDragMove(e) {
  if (!isDragging) return;
  const s = stageScale.value || 1;
  const dx = (e.clientX - startX) / s;
  const dy = (e.clientY - startY) / s;
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) hasMoved = true;

  localX.value = Math.max(0, Math.round(initialX + dx));
  localY.value = Math.max(0, Math.round(initialY + dy));
}

function onDragEnd() {
  if (isDragging && hasMoved) {
    emit('update', {
      id: props.sticky.id,
      x: localX.value,
      y: localY.value,
      width: localWidth.value,
      text: props.sticky.text,
      color: props.sticky.color
    });
  }
  isDragging = false;
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
  initialWidth = localWidth.value || 200;

  window.addEventListener('pointermove', onResizeMove);
  window.addEventListener('pointerup', onResizeEnd);
}

function onResizeMove(e) {
  if (!isResizing) return;
  const s = stageScale.value || 1;
  const dx = (e.clientX - startX) / s;
  if (Math.abs(dx) > 1) hasMoved = true;
  const newWidth = Math.max(140, Math.min(450, initialWidth + dx));

  localWidth.value = Math.round(newWidth);
}

function onResizeEnd() {
  if (isResizing && hasMoved) {
    emit('update', {
      id: props.sticky.id,
      x: localX.value,
      y: localY.value,
      width: localWidth.value,
      text: props.sticky.text,
      color: props.sticky.color
    });
  }
  isResizing = false;
  hasMoved = false;
  window.removeEventListener('pointermove', onResizeMove);
  window.removeEventListener('pointerup', onResizeEnd);
}

function onTextInput(e) {
  emit('update', {
    id: props.sticky.id,
    x: localX.value,
    y: localY.value,
    width: localWidth.value,
    text: e.target.value,
    color: props.sticky.color
  });
}

function cycleColor() {
  const current = props.sticky.color || stickyColors[0];
  const idx = stickyColors.indexOf(current);
  const nextColor = stickyColors[(idx + 1) % stickyColors.length];

  emit('update', {
    id: props.sticky.id,
    x: localX.value,
    y: localY.value,
    width: localWidth.value,
    text: props.sticky.text,
    color: nextColor
  });
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
  window.removeEventListener('pointermove', onResizeMove);
  window.removeEventListener('pointerup', onResizeEnd);
});
</script>

<style scoped>
.draggable-sticky-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  touch-action: none;
  z-index: 9;
  user-select: none;
}

.draggable-sticky-wrapper.drawing-locked {
  pointer-events: none;
}

.sticky-inner {
  position: relative;
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 8px 20px -3px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1);
  padding: 8px 12px 14px 12px;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease;
  transform: rotate(-0.5deg);
}

.draggable-sticky-wrapper.selected .sticky-inner {
  transform: rotate(0deg) scale(1.02);
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.22);
}

.sticky-header {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  margin-bottom: 6px;
}

.sticky-header:active {
  cursor: grabbing;
}

.sticky-tape {
  width: 44px;
  height: 14px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px dashed rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  margin-top: -12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sticky-tool-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.sticky-tool-btn:hover {
  opacity: 1;
}

.sticky-tool-btn.delete {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  color: #dc2626;
}

.sticky-textarea {
  width: 100%;
  min-height: 100px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Caveat', cursive, sans-serif;
  font-size: 19px;
  line-height: 24px;
  color: #262626;
  cursor: text;
}

.sticky-textarea::placeholder {
  color: rgba(0, 0, 0, 0.35);
}

.sticky-resize-handle {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 12px;
  height: 12px;
  cursor: se-resize;
  background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.3) 50%);
}
</style>
