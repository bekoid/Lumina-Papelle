<template>
  <aside class="lumina-right-wing no-print" @click.stop @pointerdown.stop>
    <!-- Header -->
    <div class="todo-wing-header">
      <div class="todo-brand-row">
        <div class="todo-title-group">
          <div class="todo-orb">
            <CheckSquare :size="15" />
          </div>
          <div>
            <h3 class="todo-heading">Yapılacaklar</h3>
            <span class="todo-sub-caption">
              {{ activeScope === 'note' && hasActiveNote ? 'Bu Defterin Görevleri' : 'Genel Ajanda Görevleri' }}
            </span>
          </div>
        </div>

        <div class="todo-right-btns">
          <span
            class="todo-progress-pill"
            :class="{ completed: totalCount > 0 && doneCount === totalCount }"
          >
            {{ doneCount }}/{{ totalCount }}
          </span>
          <button
            class="wing-collapse-btn"
            @click="$emit('collapse')"
            title="Kenar Kulakçığına Katla"
          >
            <ChevronsRight :size="17" />
          </button>
        </div>
      </div>

      <!-- Scope Switcher when inside a Note (Note Tasks vs Global Daily Tasks) -->
      <div v-if="hasActiveNote" class="scope-tabs">
        <button
          class="scope-tab"
          :class="{ active: activeScope === 'note' }"
          @click="activeScope = 'note'"
        >
          <span>📄 Bu Defter</span>
          <span v-if="noteTodos.length" class="mini-c">{{ noteTodos.length }}</span>
        </button>
        <button
          class="scope-tab"
          :class="{ active: activeScope === 'global' }"
          @click="activeScope = 'global'"
        >
          <span>🌟 Genel</span>
          <span v-if="globalTodos.length" class="mini-c">{{ globalTodos.length }}</span>
        </button>
      </div>

      <!-- Smooth Progress Bar -->
      <div v-if="totalCount > 0" class="progress-track">
        <div class="progress-fill" :style="{ width: `${progressPct}%` }"></div>
      </div>

      <!-- XP Bonus Toast -->
      <Transition name="fade-slide">
        <div v-if="xpToast" class="xp-toast-banner">
          <Sparkles :size="13" />
          <span>{{ xpToast }}</span>
        </div>
      </Transition>
    </div>

    <!-- Quick Add Input -->
    <div class="todo-add-box">
      <input
        ref="inputRef"
        type="text"
        v-model="newTodoText"
        :placeholder="activeScope === 'note' && hasActiveNote ? '+ Bu deftere görev ekle...' : '+ Genel görev ekle...'"
        class="todo-glass-input"
        @keydown.stop
        @keydown.enter.prevent="submitTodo"
      />
      <button
        class="todo-submit-btn"
        :disabled="!newTodoText.trim()"
        @click="submitTodo"
        title="Ekle"
      >
        <Plus :size="15" />
      </button>
    </div>

    <!-- Filter Chips -->
    <div v-if="currentList.length > 0" class="filter-bar">
      <div class="f-chips">
        <button class="f-chip" :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">Tümü</button>
        <button class="f-chip" :class="{ active: filterMode === 'active' }" @click="filterMode = 'active'">Bekleyen</button>
        <button class="f-chip" :class="{ active: filterMode === 'done' }" @click="filterMode = 'done'">Biten</button>
      </div>
      <button
        v-if="doneCount > 0"
        class="clear-done-btn"
        @click="handleClearDone"
        title="Tamamlananları Temizle"
      >
        Temizle
      </button>
    </div>

    <!-- Tasks Scroll List -->
    <div class="todo-scroll-list">
      <div v-if="displayedTodos.length === 0" class="todo-empty-card">
        <Sparkles :size="24" class="empty-sparkle" />
        <p class="empty-main">
          {{ filterMode === 'done' ? 'Henüz tamamlanan görev yok' : 'Zihniniz berrak, liste tertemiz!' }}
        </p>
        <span class="empty-sub">Yukarıdan yeni bir hedef ekleyip odaklanmaya başlayın.</span>
      </div>

      <div
        v-for="item in displayedTodos"
        :key="item.id"
        class="todo-glass-item"
        :class="{ done: item.done }"
        @click="handleToggle(item.id)"
      >
        <span class="custom-check" :class="{ checked: item.done }">
          <Check v-if="item.done" :size="11" stroke-width="3" />
        </span>

        <span class="todo-item-txt">{{ item.text }}</span>

        <button
          class="todo-remove-btn"
          title="Sil"
          @click.stop="handleDelete(item.id)"
        >
          <Trash2 :size="13" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { CheckSquare, ChevronsRight, Plus, Check, Trash2, Sparkles } from '@lucide/vue';
import { useSettings } from '../composables/useSettings.js';
import { useGamification } from '../composables/useGamification.js';

const props = defineProps({
  noteTodos: {
    type: Array,
    default: () => []
  },
  hasActiveNote: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'add-note-todo',
  'toggle-note-todo',
  'delete-note-todo',
  'clear-done-note-todos',
  'collapse'
]);

const {
  globalTodos,
  addGlobalTodo,
  toggleGlobalTodo,
  deleteGlobalTodo,
  clearCompletedGlobalTodos
} = useSettings();

const inputRef = ref(null);
const newTodoText = ref('');
const activeScope = ref(props.hasActiveNote ? 'note' : 'global');
const filterMode = ref('all');

watch(() => props.hasActiveNote, (hasNote) => {
  activeScope.value = hasNote ? 'note' : 'global';
});

const isNoteScope = computed(() => props.hasActiveNote && activeScope.value === 'note');

const currentList = computed(() => {
  return isNoteScope.value ? props.noteTodos : globalTodos.value;
});

const displayedTodos = computed(() => {
  if (filterMode.value === 'active') return currentList.value.filter(t => !t.done);
  if (filterMode.value === 'done') return currentList.value.filter(t => t.done);
  return currentList.value;
});

const totalCount = computed(() => currentList.value.length);
const doneCount = computed(() => currentList.value.filter(t => t.done).length);
const progressPct = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round((doneCount.value / totalCount.value) * 100);
});

function submitTodo() {
  const txt = newTodoText.value.trim();
  if (!txt) return;
  if (isNoteScope.value) {
    emit('add-note-todo', txt);
  } else {
    addGlobalTodo(txt);
  }
  newTodoText.value = '';
}

const { awardTodoXP } = useGamification();
const xpToast = ref('');
let toastTimer = null;

function showXpToast(msg) {
  xpToast.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    xpToast.value = '';
  }, 3200);
}

function handleToggle(id) {
  const item = currentList.value.find(t => t.id === id);
  if (item && !item.done) {
    const res = awardTodoXP(item);
    if (res.success) {
      showXpToast(res.message);
    }
  }

  if (isNoteScope.value) {
    emit('toggle-note-todo', id);
  } else {
    toggleGlobalTodo(id);
  }
}

function handleDelete(id) {
  if (isNoteScope.value) {
    emit('delete-note-todo', id);
  } else {
    deleteGlobalTodo(id);
  }
}

function handleClearDone() {
  if (isNoteScope.value) {
    emit('clear-done-note-todos');
  } else {
    clearCompletedGlobalTodos();
  }
}

defineExpose({
  focusInput: () => inputRef.value?.focus()
});
</script>

<style scoped>
.lumina-right-wing {
  width: 278px;
  height: calc(100vh - 24px);
  margin: 12px 12px 12px 0;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  box-shadow:
    0 12px 36px -8px rgba(0, 0, 0, 0.07),
    0 0 0 1px var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 16px 14px;
  overflow: hidden;
  z-index: 45;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.todo-wing-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.todo-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.todo-title-group {
  display: flex;
  align-items: center;
  gap: 9px;
}

.todo-orb {
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

.todo-heading {
  font-size: 14.5px;
  font-weight: 800;
  margin: 0;
  color: var(--color-text-main);
  line-height: 1.15;
}

.todo-sub-caption {
  font-size: 10.5px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.todo-right-btns {
  display: flex;
  align-items: center;
  gap: 5px;
}

.todo-progress-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--bg-surface-subtle);
  color: var(--color-primary);
}

.todo-progress-pill.completed {
  background: rgba(16, 185, 129, 0.18);
  color: #10b981;
}

.xp-toast-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  animation: popIn 0.2s ease;
  margin-top: 6px;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.wing-collapse-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.wing-collapse-btn:hover {
  background: var(--bg-surface);
  color: var(--color-primary);
}

/* Scope Tabs */
.scope-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: rgba(0, 0, 0, 0.04);
  padding: 3px;
  border-radius: 11px;
}

[data-theme="dark"] .scope-tabs {
  background: rgba(0, 0, 0, 0.25);
}

.scope-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s;
}

.scope-tab.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.mini-c {
  font-size: 10px;
  padding: 0 5px;
  border-radius: 99px;
  background: var(--color-primary-soft);
}

.progress-track {
  width: 100%;
  height: 4px;
  border-radius: 99px;
  background: var(--bg-surface-subtle);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--color-primary), #10b981);
  transition: width 0.3s ease;
}

/* Add Input */
.todo-add-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 5px 4px 11px;
  border-radius: 13px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  margin-bottom: 10px;
  transition: all 0.18s;
}

.todo-add-box:focus-within {
  background: var(--bg-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.todo-glass-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 12.5px;
  color: var(--color-text-main);
  padding: 4px 0;
}

.todo-glass-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.75;
}

.todo-submit-btn {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  border: none;
  background: var(--color-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

[data-theme="dark"] .todo-submit-btn {
  color: #111118;
}

.todo-submit-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 2px;
}

.f-chips {
  display: flex;
  gap: 4px;
}

.f-chip {
  padding: 2px 8px;
  border-radius: 99px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.f-chip.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.clear-done-btn {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.clear-done-btn:hover {
  color: #ef4444;
}

/* Scroll List */
.todo-scroll-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 2px;
}

.todo-empty-card {
  margin-top: 24px;
  padding: 22px 14px;
  border-radius: 16px;
  border: 1px dashed var(--border-color);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.empty-sparkle {
  color: var(--color-primary);
  opacity: 0.7;
}

.empty-main {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.empty-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.todo-glass-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8.5px 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  cursor: pointer;
  transition: all 0.16s ease;
}

.todo-glass-item:hover {
  background: var(--bg-surface);
  border-color: var(--color-primary);
}

.custom-check {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1.5px solid var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.16s ease;
}

.custom-check.checked {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff;
}

.todo-item-txt {
  flex: 1;
  font-size: 12.5px;
  line-height: 1.35;
  color: var(--color-text-main);
  word-break: break-word;
}

.todo-glass-item.done .todo-item-txt {
  text-decoration: line-through;
  opacity: 0.5;
}

.todo-remove-btn {
  opacity: 0;
  border: none;
  background: transparent;
  color: #ef4444;
  padding: 3px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s;
}

.todo-glass-item:hover .todo-remove-btn {
  opacity: 1;
}
</style>
