<template>
  <div ref="railRef" class="index-tabs-rail no-print">
    <!-- Existing Tabs -->
    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="index-tab-ear"
      :style="{ backgroundColor: tab.color }"
      @click="$emit('select-tab', tab)"
      :title="`${tab.title} Bölümüne Git`"
    >
      <span class="tab-vertical-text">{{ tab.title }}</span>
      <button type="button" class="tab-del" title="Sekmeyi Sil" @click.stop="$emit('delete-tab', tab.id)">&times;</button>
    </div>

    <!-- Add New Tab Button + Inline Popover (Works 100% natively in Electron!) -->
    <div class="add-tab-anchor">
      <button
        type="button"
        class="add-tab-ear"
        :class="{ active: isPopoverOpen }"
        @click.stop="togglePopover"
        title="Yeni İndeks Sekmesi Ekle"
      >
        <span>+</span>
      </button>

      <div v-if="isPopoverOpen" class="index-tab-popover" @click.stop @pointerdown.stop>
        <div class="popover-head">
          <span class="popover-title">Yeni İndeks Kulakçığı</span>
          <button type="button" class="popover-close" @click="closePopover" title="Kapat">&times;</button>
        </div>

        <input
          ref="tabInputRef"
          v-model="newTabTitle"
          type="text"
          maxlength="24"
          placeholder="Örn: 1. Ünite, Formüller..."
          class="popover-input"
          @keydown.stop
          @keydown.enter.prevent="submitNewTab"
          @keydown.esc.stop.prevent="closePopover"
        />

        <div class="popover-colors">
          <button
            v-for="col in tabPastelColors"
            :key="col"
            type="button"
            class="pop-color-dot"
            :class="{ active: selectedColor === col }"
            :style="{ backgroundColor: col }"
            @click="selectedColor = col"
          ></button>
        </div>

        <div class="popover-actions">
          <button type="button" class="pop-btn cancel" @click="closePopover">Vazgeç</button>
          <button type="button" class="pop-btn confirm" :disabled="!newTabTitle.trim()" @click="submitNewTab">
            Ekle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  tabs: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['add-tab', 'delete-tab', 'select-tab']);

const tabPastelColors = ['#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#FB923C'];

const railRef = ref(null);
const tabInputRef = ref(null);
const isPopoverOpen = ref(false);
const newTabTitle = ref('');
const selectedColor = ref(tabPastelColors[0]);

function togglePopover() {
  if (isPopoverOpen.value) {
    closePopover();
  } else {
    selectedColor.value = tabPastelColors[props.tabs.length % tabPastelColors.length];
    newTabTitle.value = '';
    isPopoverOpen.value = true;
    nextTick(() => {
      tabInputRef.value?.focus();
    });
  }
}

function closePopover() {
  isPopoverOpen.value = false;
  newTabTitle.value = '';
}

function submitNewTab() {
  const clean = newTabTitle.value.trim();
  if (!clean) return;
  emit('add-tab', {
    id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: clean,
    color: selectedColor.value,
    targetY: 0
  });
  closePopover();
}

function handleOutsidePointer(e) {
  if (isPopoverOpen.value && railRef.value && !railRef.value.contains(e.target)) {
    closePopover();
  }
}

function handleEscape(e) {
  if (e.key === 'Escape' && isPopoverOpen.value) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    closePopover();
  }
}

onMounted(() => {
  window.addEventListener('pointerdown', handleOutsidePointer);
  window.addEventListener('keydown', handleEscape, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handleOutsidePointer);
  window.removeEventListener('keydown', handleEscape, true);
});
</script>

<style scoped>
.index-tabs-rail {
  position: absolute;
  right: -32px;
  top: 60px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 16;
}

.index-tab-ear {
  width: 32px;
  min-height: 70px;
  border-radius: 0 8px 8px 0;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 8px 2px;
  color: white;
  transition: transform 0.15s ease, filter 0.15s ease;
  user-select: none;
}

.index-tab-ear:hover {
  transform: translateX(4px);
  filter: brightness(1.08);
}

.tab-vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.tab-del {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  cursor: pointer;
  line-height: 1;
  padding: 2px;
}

.tab-del:hover {
  color: white;
}

.add-tab-anchor {
  position: relative;
}

.add-tab-ear {
  width: 28px;
  height: 28px;
  border-radius: 0 6px 6px 0;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-surface, white);
  color: var(--color-primary, #2563eb);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 1px 2px 4px rgba(0,0,0,0.1);
  transition: all 0.15s ease;
}

.add-tab-ear:hover,
.add-tab-ear.active {
  transform: translateX(3px);
  background: var(--color-primary);
  color: white;
}

.index-tab-popover {
  position: absolute;
  right: 38px;
  top: -4px;
  width: 224px;
  padding: 12px 13px;
  border-radius: 16px;
  background: var(--bg-surface);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 9px;
  z-index: 80;
}

.popover-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popover-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-main);
}

.popover-close {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
}

.popover-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 9px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
  font-size: 12px;
  outline: none;
}

.popover-input:focus {
  border-color: var(--color-primary);
}

.popover-colors {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
}

.pop-color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: transform 0.14s;
}

.pop-color-dot.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.pop-btn {
  padding: 5px 11px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.pop-btn.cancel {
  background: var(--bg-surface-subtle);
  color: var(--color-text-muted);
}

.pop-btn.confirm {
  background: var(--color-primary);
  color: #ffffff;
}

[data-theme="dark"] .pop-btn.confirm {
  color: #111118;
}

.pop-btn.confirm:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
