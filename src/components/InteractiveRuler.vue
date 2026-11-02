<template>
  <div 
    v-if="isOpen"
    class="interactive-ruler-wrapper"
    :style="{
      transform: `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`
    }"
    @pointerdown="handlePointerDown"
  >
    <div class="ruler-body" @wheel.prevent="handleWheel">
      <!-- Top Millimeter / Centimeter Scale -->
      <div class="scale-ticks top-scale">
        <div 
          v-for="mm in 50" 
          :key="mm" 
          class="tick-line"
          :class="{ 'cm-tick': mm % 10 === 0, 'half-cm': mm % 5 === 0 && mm % 10 !== 0 }"
        >
          <span v-if="mm % 10 === 0" class="cm-number">{{ mm / 10 }}</span>
        </div>
      </div>

      <!-- Center Controls: Angle Display, Rotate Button & Close -->
      <div class="ruler-center-bar" @pointerdown.stop>
        <button type="button" class="ruler-btn rotate-btn" @click="rotateBy(15)" title="15° Döndür">
          <RotateCw :size="13" />
        </button>
        <span class="angle-badge">{{ Math.round(angle) }}°</span>
        <button type="button" class="ruler-btn reset-angle-btn" @click="angle = 0" title="0° Düzelt">
          0°
        </button>
        <button type="button" class="ruler-btn close-btn" @click="$emit('close')" title="Cetveli Kapat">
          &times;
        </button>
      </div>

      <!-- Bottom Inch / Grid Scale -->
      <div class="scale-ticks bottom-scale">
        <div 
          v-for="mm in 50" 
          :key="'b' + mm" 
          class="tick-line bottom-tick"
          :class="{ 'cm-tick': mm % 10 === 0 }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { RotateCw } from '@lucide/vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

const x = ref(120);
const y = ref(200);
const angle = ref(0);

let isDragging = false;
let startX = 0;
let startY = 0;
let initialX = 0;
let initialY = 0;

function handlePointerDown(e) {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  initialX = x.value;
  initialY = y.value;

  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragEnd);
}

function onDragMove(e) {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  x.value = initialX + dx;
  y.value = initialY + dy;
}

function onDragEnd() {
  isDragging = false;
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragEnd);
}

function handleWheel(e) {
  angle.value = (angle.value + (e.deltaY > 0 ? 5 : -5)) % 360;
}

function rotateBy(deg) {
  angle.value = (angle.value + deg) % 360;
}

onBeforeUnmount(() => {
  onDragEnd();
});
</script>

<style scoped>
.interactive-ruler-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 520px;
  height: 80px;
  z-index: 50;
  cursor: grab;
  touch-action: none;
  user-select: none;
  transform-origin: center center;
}

.interactive-ruler-wrapper:active {
  cursor: grabbing;
}

.ruler-body {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

[data-theme="dark"] .ruler-body {
  background: rgba(30, 41, 59, 0.82);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.5);
}

/* Ticks */
.scale-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  height: 22px;
}

.tick-line {
  width: 1px;
  height: 7px;
  background: rgba(0, 0, 0, 0.4);
  position: relative;
}

[data-theme="dark"] .tick-line {
  background: rgba(255, 255, 255, 0.4);
}

.tick-line.half-cm {
  height: 12px;
}

.tick-line.cm-tick {
  height: 18px;
  width: 1.5px;
  background: rgba(0, 0, 0, 0.8);
}

[data-theme="dark"] .tick-line.cm-tick {
  background: rgba(255, 255, 255, 0.85);
}

.cm-number {
  position: absolute;
  top: 18px;
  left: -4px;
  font-size: 10px;
  font-weight: 700;
  color: #0f172a;
}

[data-theme="dark"] .cm-number {
  color: #f8fafc;
}

.bottom-scale {
  height: 16px;
  align-items: flex-end;
}

.bottom-tick {
  align-self: flex-end;
}

/* Center Controls */
.ruler-center-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.angle-badge {
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 7px;
  border-radius: 4px;
  color: #0f172a;
}

[data-theme="dark"] .angle-badge {
  background: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
}

.ruler-btn {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: white;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  transition: all 0.15s ease;
}

[data-theme="dark"] .ruler-btn {
  background: #1e293b;
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.2);
}

.ruler-btn:hover {
  background: #2563eb;
  color: white;
}

.close-btn {
  font-size: 15px;
  line-height: 1;
}

.close-btn:hover {
  background: #dc2626 !important;
  color: white !important;
}
</style>
