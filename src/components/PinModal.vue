<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <div class="header-icon-box">
          <Lock :size="20" />
        </div>
        <div class="header-text">
          <h3>{{ mode === 'set' ? 'Notu Şifrele' : 'Korumalı Not' }}</h3>
          <p>{{ mode === 'set' ? 'Bu nota erişmek için 4 haneli bir PIN belirleyin' : 'Bu notu açmak için PIN kodunu girin' }}</p>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')" title="Kapat (ESC)">&times;</button>
      </div>

      <div class="modal-body">
        <div class="pin-display">
          <div 
            v-for="i in 4" 
            :key="i" 
            class="pin-dot"
            :class="{ filled: enteredPin.length >= i }"
          ></div>
        </div>

        <div v-if="errorMessage" class="error-text">
          {{ errorMessage }}
        </div>

        <!-- Keypad -->
        <div class="keypad-grid">
          <button 
            v-for="digit in [1, 2, 3, 4, 5, 6, 7, 8, 9]" 
            :key="digit"
            class="key-btn"
            @click="pressDigit(digit.toString())"
          >
            {{ digit }}
          </button>
          <button class="key-btn action-key" @click="clearPin" title="Temizle">
            C
          </button>
          <button class="key-btn" @click="pressDigit('0')">
            0
          </button>
          <button class="key-btn action-key" @click="backspace" title="Sil">
            ⌫
          </button>
        </div>
      </div>

      <div class="modal-footer" v-if="mode === 'set' && currentPin">
        <button class="btn btn-danger-link" @click="$emit('remove-pin')">
          Şifreyi Kaldır
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Lock } from '@lucide/vue';

const props = defineProps({
  mode: {
    type: String, // 'set' or 'unlock'
    default: 'unlock'
  },
  currentPin: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close', 'success', 'remove-pin']);

const enteredPin = ref('');
const errorMessage = ref('');

function pressDigit(digit) {
  if (enteredPin.value.length < 4) {
    enteredPin.value += digit;
    errorMessage.value = '';

    if (enteredPin.value.length === 4) {
      verifyPin();
    }
  }
}

function backspace() {
  enteredPin.value = enteredPin.value.slice(0, -1);
  errorMessage.value = '';
}

function clearPin() {
  enteredPin.value = '';
  errorMessage.value = '';
}

function verifyPin() {
  if (props.mode === 'set') {
    emit('success', enteredPin.value);
    emit('close');
  } else {
    if (enteredPin.value === props.currentPin) {
      emit('success', enteredPin.value);
      emit('close');
    } else {
      errorMessage.value = 'Hatalı PIN kodu! Lütfen tekrar deneyin.';
      setTimeout(() => {
        enteredPin.value = '';
      }, 400);
    }
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation();
    e.stopImmediatePropagation();
    emit('close');
  } else if (/^[0-9]$/.test(e.key)) {
    e.stopPropagation();
    pressDigit(e.key);
  } else if (e.key === 'Backspace') {
    e.stopPropagation();
    backspace();
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown, true));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true));
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 340px;
  background: var(--bg-surface, white);
  color: var(--color-text-main, #0f172a);
  border-radius: 20px;
  box-shadow: 0 25px 40px -10px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid var(--border-color, #e2e8f0);
}

@keyframes modalScale {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  padding: 20px 20px 14px 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}

.header-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

[data-theme="dark"] .header-icon-box {
  background: #1e293b;
  color: #60a5fa;
}

.header-text h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.header-text p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
  line-height: 1.4;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 10px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pin-display {
  display: flex;
  gap: 16px;
  margin: 8px 0;
}

.pin-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: transparent;
  transition: all 0.15s ease;
}

.pin-dot.filled {
  background: #2563eb;
  border-color: #2563eb;
  transform: scale(1.15);
}

.error-text {
  font-size: 12px;
  font-weight: 500;
  color: #ef4444;
  text-align: center;
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
}

.key-btn {
  height: 52px;
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-surface-subtle, #f8fafc);
  color: var(--color-text-main, #0f172a);
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
}

.key-btn:hover {
  background: #e2e8f0;
}

[data-theme="dark"] .key-btn:hover {
  background: #334155;
}

.key-btn:active {
  transform: scale(0.95);
}

.action-key {
  font-size: 16px;
  color: var(--color-text-muted, #64748b);
}

.modal-footer {
  padding: 10px 20px 16px 20px;
  display: flex;
  justify-content: center;
}

.btn-danger-link {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
</style>
