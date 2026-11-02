<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <div class="title-group">
          <h3>📐 Matematik & Bilim Sembolleri</h3>
          <p>Nota eklemek istediğin sembole tıkla</p>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')" title="Kapat (ESC)">&times;</button>
      </div>

      <div class="modal-body">
        <div class="symbols-grid">
          <button 
            v-for="sym in mathSymbols" 
            :key="sym.char"
            class="symbol-btn"
            @click="insertSymbol(sym.char)"
            :title="sym.name"
          >
            <span class="sym-char">{{ sym.char }}</span>
            <span class="sym-name">{{ sym.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits(['close', 'insert']);

const mathSymbols = [
  { char: '√', name: 'Karekök' },
  { char: 'π', name: 'Pi Sayısı' },
  { char: '∑', name: 'Toplam' },
  { char: '∫', name: 'İntegral' },
  { char: '∞', name: 'Sonsuzluk' },
  { char: '≠', name: 'Eşit Değildir' },
  { char: '≈', name: 'Yaklaşık' },
  { char: '≤', name: 'Küçük Eşit' },
  { char: '≥', name: 'Büyük Eşit' },
  { char: '±', name: 'Artı Eksi' },
  { char: 'Δ', name: 'Delta' },
  { char: 'θ', name: 'Teta' },
  { char: 'α', name: 'Alfa' },
  { char: 'β', name: 'Beta' },
  { char: 'λ', name: 'Lamda' },
  { char: '² ', name: 'Kare (Üs 2)' },
  { char: '³ ', name: 'Küp (Üs 3)' },
  { char: '½', name: 'Yarım (1/2)' },
  { char: '¼', name: 'Çeyrek (1/4)' },
  { char: '°', name: 'Derece' }
];

function insertSymbol(char) {
  emit('insert', char);
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation();
    e.stopImmediatePropagation();
    emit('close');
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
  max-width: 440px;
  background: var(--bg-surface, white);
  color: var(--color-text-main, #0f172a);
  border-radius: 20px;
  box-shadow: 0 25px 40px -10px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid var(--border-color, #e2e8f0);
}

.modal-header {
  padding: 18px 20px 14px 20px;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-group h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.title-group p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 16px 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.symbols-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.symbol-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 4px;
  background: var(--bg-surface-subtle, #f8fafc);
  color: var(--color-text-main, #0f172a);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.symbol-btn:hover {
  background: var(--color-primary, #2563eb);
  color: white;
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.symbol-btn:hover .sym-name {
  color: rgba(255, 255, 255, 0.85);
}

.sym-char {
  font-size: 20px;
  font-weight: 700;
  font-family: serif;
}

.sym-name {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-muted, #64748b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}
</style>
