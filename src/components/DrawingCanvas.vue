<template>
  <div 
    class="drawing-canvas-container" 
    :class="[
      { 'drawing-active': isDrawingMode },
      `cursor-${currentTool}`
    ]"
    ref="containerRef"
  >
    <!-- Dormant Mode: Zero-GPU-Context lightweight image layer when not actively drawing -->
    <img
      v-if="!isDrawingMode && savedDataUrl"
      :src="savedDataUrl"
      class="dormant-drawing-img"
      draggable="false"
      decoding="async"
    />

    <!-- Active Drawing Mode: Interactive hardware-accelerated canvas only mounted when drawing -->
    <canvas
      v-if="isDrawingMode"
      ref="canvasRef"
      class="drawing-canvas"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const MAX_HISTORY = 18;

const props = defineProps({
  isDrawingMode: {
    type: Boolean,
    default: false
  },
  currentTool: {
    type: String, // 'pen', 'highlighter', 'pencil', 'eraser'
    default: 'pen'
  },
  brushColor: {
    type: String,
    default: '#1E293B'
  },
  brushSize: {
    type: Number,
    default: 3
  },
  brushOpacity: {
    type: Number,
    default: 1.0
  },
  initialDrawingData: {
    type: String,
    default: null
  },
  isSmartShape: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save-drawing']);

const containerRef = ref(null);
const canvasRef = ref(null);
const savedDataUrl = ref(props.initialDrawingData || null);

let ctx = null;
let bufferCanvas = null;
let bufferCtx = null;
let lastWidth = 0;
let lastHeight = 0;

// Drawing state
let isDrawing = false;
let currentStroke = [];
const history = ref([]);
const historyIndex = ref(-1);

// Hold-to-Snap engine state
let holdTimer = null;
let resizeTimer = null;
let isSnapped = false;
let holdAnchor = null;
let snappedShapeType = null; // 'line', 'circle', 'rect', 'triangle'
let snappedShapeData = null;
let shapeStartPoint = null;

function getDpr() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

watch(
  () => props.initialDrawingData,
  (newVal) => {
    if (newVal !== savedDataUrl.value) {
      savedDataUrl.value = newVal || null;
      if (props.isDrawingMode && ctx && bufferCtx) {
        initCanvas();
      }
    }
  }
);

watch(
  () => props.isDrawingMode,
  (active) => {
    if (active) {
      nextTick(() => {
        initCanvas();
      });
    } else {
      // Release offscreen canvas buffers when leaving drawing mode to free GPU/RAM
      clearTimeout(holdTimer);
      clearTimeout(resizeTimer);
      ctx = null;
      if (bufferCanvas) {
        bufferCanvas.width = 0;
        bufferCanvas.height = 0;
        bufferCanvas = null;
        bufferCtx = null;
      }
    }
  }
);

function initCanvas(preserveDataUrl = null) {
  if (!props.isDrawingMode) return;
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;

  const dpr = getDpr();
  const width = container.clientWidth || 860;
  const height = Math.max(container.clientHeight || 1100, container.scrollHeight || 1100);
  lastWidth = width;
  lastHeight = height;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (!bufferCanvas) {
    bufferCanvas = document.createElement('canvas');
  }
  bufferCanvas.width = Math.round(width * dpr);
  bufferCanvas.height = Math.round(height * dpr);
  bufferCtx = bufferCanvas.getContext('2d');
  bufferCtx.scale(dpr, dpr);
  bufferCtx.lineCap = 'round';
  bufferCtx.lineJoin = 'round';

  const sourceData = preserveDataUrl || savedDataUrl.value || props.initialDrawingData;
  if (sourceData) {
    const img = new Image();
    img.onload = () => {
      if (!bufferCtx || !ctx) return;
      bufferCtx.drawImage(img, 0, 0, width, height);
      redrawFromBuffer();
      if (history.value.length === 0) {
        saveState();
      }
    };
    img.src = sourceData;
  }
}

function redrawFromBuffer() {
  if (!ctx || !bufferCanvas || !canvasRef.value) return;
  const dpr = getDpr();
  const w = canvasRef.value.width / dpr;
  const h = canvasRef.value.height / dpr;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bufferCanvas, 0, 0, w, h);
}

function handlePointerDown(e) {
  if (!props.isDrawingMode || !ctx) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  e.preventDefault();

  try {
    e.target.setPointerCapture(e.pointerId);
  } catch (err) {}

  isDrawing = true;
  isSnapped = false;
  snappedShapeType = null;

  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = rect.width ? (lastWidth / rect.width) : 1;
  const scaleY = rect.height ? (lastHeight / rect.height) : 1;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

  const startPoint = { x, y, pressure };
  shapeStartPoint = startPoint;
  currentStroke = [startPoint];
  holdAnchor = { x, y };

  redrawFromBuffer();
  drawContinuousStroke(ctx, currentStroke, props.currentTool, props.brushColor, props.brushSize, props.brushOpacity);

  if (props.isSmartShape && props.currentTool === 'pen') {
    startHoldTimer();
  }
}

function handlePointerMove(e) {
  if (!isDrawing || !props.isDrawingMode || !ctx) return;
  e.preventDefault();

  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = rect.width ? (lastWidth / rect.width) : 1;
  const scaleY = rect.height ? (lastHeight / rect.height) : 1;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
  const currentPoint = { x, y, pressure };

  if (isSnapped && snappedShapeData) {
    redrawFromBuffer();
    if (snappedShapeType === 'line') {
      snappedShapeData.p2 = currentPoint;
    }
    drawDynamicShape(ctx, snappedShapeData);
    return;
  }

  currentStroke.push(currentPoint);
  redrawFromBuffer();
  drawContinuousStroke(ctx, currentStroke, props.currentTool, props.brushColor, props.brushSize, props.brushOpacity);

  if (props.isSmartShape && props.currentTool === 'pen') {
    if (!holdAnchor) holdAnchor = { x, y };
    const distFromAnchor = Math.hypot(x - holdAnchor.x, y - holdAnchor.y);
    if (distFromAnchor > 10) {
      holdAnchor = { x, y };
      restartHoldTimer();
    }
  }
}

function startHoldTimer() {
  clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    triggerSnap();
  }, 420);
}

function restartHoldTimer() {
  clearTimeout(holdTimer);
  startHoldTimer();
}

function triggerSnap() {
  if (!isDrawing || currentStroke.length < 5 || isSnapped) return;

  const pStart = shapeStartPoint;
  const pEnd = currentStroke[currentStroke.length - 1];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;
  for (let i = 0; i < currentStroke.length; i++) {
    const pt = currentStroke[i];
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
    sumX += pt.x;
    sumY += pt.y;
  }

  const w = maxX - minX;
  const h = maxY - minY;
  const cx = sumX / currentStroke.length;
  const cy = sumY / currentStroke.length;
  const distStartEnd = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);

  // Check if stroke forms a closed loop
  const isClosed = (distStartEnd < Math.max(50, Math.min(w, h) * 0.50)) && (w > 20 || h > 20) && currentStroke.length > 12;

  if (isClosed) {
    // 1. Circle / Ellipse test via radius variance from center
    const radii = currentStroke.map(p => Math.hypot(p.x - cx, p.y - cy));
    const avgR = radii.reduce((a, b) => a + b, 0) / radii.length;
    const variance = radii.reduce((sum, r) => sum + Math.abs(r - avgR), 0) / radii.length;
    const roundness = variance / Math.max(1, avgR);
    const aspect = Math.min(w, h) / Math.max(1, Math.max(w, h));

    if (roundness < 0.26 && aspect > 0.45) {
      // Circle or Ellipse with realistic full drawn size
      snappedShapeType = 'circle';
      const isAlmostPerfectCircle = aspect > 0.80;
      const radius = (w + h) / 4;
      snappedShapeData = {
        type: 'circle',
        cx,
        cy,
        rx: isAlmostPerfectCircle ? radius : w / 2,
        ry: isAlmostPerfectCircle ? radius : h / 2
      };
    } else {
      // 2. Triangle vs Rectangle / Square
      // Check corner distribution: Count points near bounding box corners vs top-center apex
      const cornerThresh = Math.max(15, Math.min(w, h) * 0.32);
      const hasTopLeft = currentStroke.some(p => Math.hypot(p.x - minX, p.y - minY) < cornerThresh);
      const hasTopRight = currentStroke.some(p => Math.hypot(p.x - maxX, p.y - minY) < cornerThresh);
      const hasBottomLeft = currentStroke.some(p => Math.hypot(p.x - minX, p.y - maxY) < cornerThresh);
      const hasBottomRight = currentStroke.some(p => Math.hypot(p.x - maxX, p.y - maxY) < cornerThresh);
      const hasTopApex = currentStroke.some(p => Math.abs(p.x - cx) < w * 0.28 && Math.abs(p.y - minY) < h * 0.28);

      if (hasTopApex && (!hasTopLeft || !hasTopRight)) {
        // Triangle (Apex at top, base corners at bottom left & right)
        snappedShapeType = 'triangle';
        snappedShapeData = {
          type: 'triangle',
          p1: { x: cx, y: minY },
          p2: { x: minX, y: maxY },
          p3: { x: maxX, y: maxY }
        };
      } else {
        // Rectangle or Square
        snappedShapeType = 'rect';
        const isSquare = Math.abs(w - h) < Math.max(w, h) * 0.20;
        const side = Math.max(w, h);
        snappedShapeData = {
          type: 'rect',
          x: isSquare ? cx - side / 2 : minX,
          y: isSquare ? cy - side / 2 : minY,
          w: isSquare ? side : w,
          h: isSquare ? side : h
        };
      }
    }
  } else {
    // Straight Line
    snappedShapeType = 'line';
    snappedShapeData = {
      type: 'line',
      p1: pStart,
      p2: pEnd
    };
  }

  isSnapped = true;
  redrawFromBuffer();
  drawDynamicShape(ctx, snappedShapeData);
}

function configureTool(targetCtx, tool, color, size, opacity) {
  targetCtx.lineCap = 'round';
  targetCtx.lineJoin = 'round';

  if (tool === 'eraser') {
    targetCtx.globalCompositeOperation = 'destination-out';
    targetCtx.lineWidth = Math.max(10, size * 2.2);
    targetCtx.strokeStyle = 'rgba(0,0,0,1)';
    targetCtx.fillStyle = 'rgba(0,0,0,1)';
    targetCtx.globalAlpha = 1.0;
  } else if (tool === 'highlighter') {
    targetCtx.globalCompositeOperation = 'source-over';
    targetCtx.strokeStyle = color;
    targetCtx.fillStyle = color;
    targetCtx.lineWidth = Math.max(4, size);
    targetCtx.globalAlpha = Math.max(0.05, Math.min(0.95, opacity !== undefined ? opacity : 0.40));
  } else if (tool === 'pencil') {
    targetCtx.globalCompositeOperation = 'source-over';
    targetCtx.strokeStyle = color;
    targetCtx.fillStyle = color;
    targetCtx.lineWidth = Math.max(1, size);
    targetCtx.globalAlpha = Math.max(0.05, Math.min(1.0, (opacity !== undefined ? opacity : 0.72) * 0.85));
  } else {
    // pen (dolma / tükenmez)
    targetCtx.globalCompositeOperation = 'source-over';
    targetCtx.strokeStyle = color;
    targetCtx.fillStyle = color;
    targetCtx.lineWidth = Math.max(1, size);
    targetCtx.globalAlpha = Math.max(0.05, Math.min(1.0, opacity !== undefined ? opacity : 1.0));
  }
}

function drawContinuousStroke(targetCtx, points, tool, color, size, opacity) {
  if (!targetCtx || !points || points.length === 0) return;

  targetCtx.save();
  configureTool(targetCtx, tool, color, size, opacity);

  if (points.length === 1) {
    const p = points[0];
    const r = (tool === 'eraser') ? Math.max(5, size * 1.1) : Math.max(1, size / 2);
    targetCtx.beginPath();
    targetCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.restore();
    return;
  }

  targetCtx.beginPath();
  targetCtx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    targetCtx.lineTo(points[1].x, points[1].y);
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      targetCtx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    const last = points[points.length - 1];
    targetCtx.lineTo(last.x, last.y);
  }

  targetCtx.stroke();
  targetCtx.restore();
}

function drawDynamicShape(targetCtx, data) {
  if (!targetCtx || !data) return;
  targetCtx.save();
  configureTool(targetCtx, props.currentTool, props.brushColor, props.brushSize, props.brushOpacity);

  if (data.type === 'line') {
    targetCtx.beginPath();
    targetCtx.moveTo(data.p1.x, data.p1.y);
    targetCtx.lineTo(data.p2.x, data.p2.y);
    targetCtx.stroke();
  } else if (data.type === 'circle') {
    targetCtx.beginPath();
    targetCtx.ellipse(data.cx, data.cy, data.rx, data.ry, 0, 0, Math.PI * 2);
    targetCtx.stroke();
  } else if (data.type === 'rect') {
    targetCtx.beginPath();
    targetCtx.rect(data.x, data.y, data.w, data.h);
    targetCtx.stroke();
  } else if (data.type === 'triangle') {
    targetCtx.beginPath();
    targetCtx.moveTo(data.p1.x, data.p1.y);
    targetCtx.lineTo(data.p2.x, data.p2.y);
    targetCtx.lineTo(data.p3.x, data.p3.y);
    targetCtx.closePath();
    targetCtx.stroke();
  }

  targetCtx.restore();
}

function handlePointerUp(e) {
  clearTimeout(holdTimer);
  if (!isDrawing) return;
  isDrawing = false;

  try {
    if (e && e.target && e.target.releasePointerCapture) {
      e.target.releasePointerCapture(e.pointerId);
    }
  } catch (err) {}

  if (isSnapped && snappedShapeData) {
    drawDynamicShape(bufferCtx, snappedShapeData);
  } else if (currentStroke.length > 0) {
    drawContinuousStroke(bufferCtx, currentStroke, props.currentTool, props.brushColor, props.brushSize, props.brushOpacity);
  }

  redrawFromBuffer();
  const data = saveState();
  emitDrawing(data);

  currentStroke = [];
  holdAnchor = null;
  isSnapped = false;
  snappedShapeType = null;
  snappedShapeData = null;
  shapeStartPoint = null;
}

function saveState() {
  if (!bufferCanvas) return null;
  const data = bufferCanvas.toDataURL('image/png');
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }
  history.value.push(data);
  if (history.value.length > MAX_HISTORY) {
    history.value.shift();
  }
  historyIndex.value = history.value.length - 1;
  return data;
}

function emitDrawing(precomputedData = null) {
  if (!bufferCanvas && !precomputedData) return;
  const data = precomputedData || bufferCanvas.toDataURL('image/png');
  savedDataUrl.value = data;
  emit('save-drawing', data);
}

function undo() {
  if (!props.isDrawingMode) return;
  if (historyIndex.value > 0) {
    historyIndex.value--;
    restoreSnapshot(history.value[historyIndex.value]);
  } else if (historyIndex.value === 0) {
    historyIndex.value = -1;
    clearCanvas(false);
    savedDataUrl.value = null;
    emit('save-drawing', null);
  }
}

function redo() {
  if (!props.isDrawingMode) return;
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++;
    restoreSnapshot(history.value[historyIndex.value]);
  }
}

function clearCanvas(recordState = true) {
  if (!ctx || !bufferCtx || !canvasRef.value) {
    savedDataUrl.value = null;
    emit('save-drawing', null);
    return;
  }
  const dpr = getDpr();
  const w = canvasRef.value.width / dpr;
  const h = canvasRef.value.height / dpr;

  ctx.clearRect(0, 0, w, h);
  bufferCtx.clearRect(0, 0, w, h);

  if (recordState) {
    savedDataUrl.value = null;
    saveState();
    emit('save-drawing', null);
  }
}

function restoreSnapshot(dataUrl) {
  if (!ctx || !bufferCtx || !canvasRef.value) return;
  const dpr = getDpr();
  const width = canvasRef.value.width / dpr;
  const height = canvasRef.value.height / dpr;
  const img = new Image();
  img.onload = () => {
    if (!ctx || !bufferCtx) return;
    ctx.clearRect(0, 0, width, height);
    bufferCtx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    bufferCtx.drawImage(img, 0, 0, width, height);
    emitDrawing(dataUrl);
  };
  img.src = dataUrl;
}

defineExpose({
  undo,
  redo,
  clearCanvas,
  initCanvas
});

let resizeObserver = null;

onMounted(() => {
  if (props.isDrawingMode) {
    nextTick(() => {
      initCanvas();
    });
  }

  if (window.ResizeObserver && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (!props.isDrawingMode || !bufferCanvas || !ctx || !containerRef.value) return;
      const newW = containerRef.value.clientWidth || 860;
      const newH = Math.max(containerRef.value.clientHeight || 1100, containerRef.value.scrollHeight || 1100);
      if (Math.abs(newW - lastWidth) < 4 && Math.abs(newH - lastHeight) < 24) return;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!props.isDrawingMode || !bufferCanvas || !ctx) return;
        const prevData = savedDataUrl.value || bufferCanvas.toDataURL('image/png');
        initCanvas(prevData);
      }, 180);
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  clearTimeout(holdTimer);
  clearTimeout(resizeTimer);
  if (resizeObserver) resizeObserver.disconnect();
  ctx = null;
  if (bufferCanvas) {
    bufferCanvas.width = 0;
    bufferCanvas.height = 0;
    bufferCanvas = null;
    bufferCtx = null;
  }
});
</script>

<style scoped>
.drawing-canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  mix-blend-mode: multiply;
}

:global([data-theme="dark"]) .drawing-canvas-container {
  mix-blend-mode: normal;
}

.drawing-canvas-container.drawing-active {
  pointer-events: auto;
}

.dormant-drawing-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
}

/* Custom Cursors for Mouse on PC */
.drawing-canvas-container.drawing-active.cursor-pen {
  cursor: crosshair;
}

.drawing-canvas-container.drawing-active.cursor-highlighter {
  cursor: cell;
}

.drawing-canvas-container.drawing-active.cursor-pencil {
  cursor: crosshair;
}

.drawing-canvas-container.drawing-active.cursor-eraser {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="%23334155" stroke-width="2"/></svg>') 10 10, pointer;
}

.drawing-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
</style>
