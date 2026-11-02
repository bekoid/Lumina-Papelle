<template>
  <div class="lumina-app-shell" :class="{ 'dark-theme': isDarkMode, 'is-mobile-layout': !isWideScreen }">
    <!-- Mobile/Tablet Glass Backdrop when a Magnetic Wing is opened as Drawer -->
    <Transition name="fade-backdrop">
      <div
        v-if="!isWideScreen && (isLeftPanelOpen || isRightPanelOpen)"
        class="mobile-wing-backdrop no-print"
        @click="closeMobileWings"
      ></div>
    </Transition>

    <!-- LEFT MAGNETIC EDGE TABS (Shown whenever Left Wing is folded) -->
    <div v-if="!isLeftPanelOpen" class="lumina-magnetic-edge left-edge no-print">
      <button
        class="magnetic-tab-btn"
        @click="openLeftWing"
        title="Kitaplık ve Klasörleri Aç"
      >
        <BookOpen :size="17" />
        <span class="mag-label">Kitaplık</span>
        <span class="mag-badge">{{ counts.total }}</span>
      </button>

      <button
        v-if="currentEditingNote"
        type="button"
        class="magnetic-tab-btn"
        :class="{ active: isPageSlotsOpen }"
        @click="togglePageSlots"
        title="Sayfa Slotları & Düzen"
      >
        <Layers :size="16" />
        <span class="mag-label">Slotlar</span>
      </button>
    </div>

    <!-- LEFT MAGNETIC FROSTED WING: KİTAPLIK & KLASÖRLER -->
    <Transition name="wing-left">
      <div
        v-if="isLeftPanelOpen"
        class="wing-slot left-wing-slot no-print"
        :class="{ 'drawer-floating': !isWideScreen }"
      >
        <Sidebar
          :active-category="activeCategory"
          :counts="counts"
          :folders="folders"
          :all-tags="allTags"
          :quick-notes="filteredNotes"
          :current-note-id="currentEditingNote?.id || null"
          :search-query="searchQuery"
          :is-dark-mode="isDarkMode"
          @select-category="onSelectCategory"
          @select-note="handleQuickNoteSelect"
          @create-note="handleQuickCreate"
          @back-to-shelf="handleCloseEditor"
          @update:search-query="searchQuery = $event"
          @open-folder-modal="isFolderModalOpen = true"
          @delete-folder="deleteFolder"
          @toggle-dark="toggleDarkMode"
          @open-settings="isSettingsModalOpen = true"
          @open-guide="isGuideModalOpen = true"
          @collapse="isLeftPanelOpen = false"
        />
      </div>
    </Transition>

    <!-- CENTER MAIN WORKSPACE: EITHER EDITOR OR 3D BOOKSHELF GALLERY -->
    <main class="lumina-center-stage" :class="{ 'with-right-dock-pad': isWideScreen && !isRightPanelOpen }">
      <!-- VIEW A: ACTIVE NOTEBOOK EDITOR -->
      <Editor
        v-if="currentEditingNote"
        :note="currentEditingNote"
        :is-dark-mode="isDarkMode"
        :is-zen-mode="isZenMode"
        :has-open-global-modal="isSettingsModalOpen || isFolderModalOpen || isUnlockModalOpen || isCoverModalOpen || isGuideModalOpen || isBadgesModalOpen || isSpotlightOpen || (!isWideScreen && (isLeftPanelOpen || isRightPanelOpen))"
        v-model:is-page-slots-open="isPageSlotsOpen"
        @back="handleCloseEditor"
        @update="updateCurrentNote"
        @toggle-favorite="toggleFavorite"
        @delete="moveToTrash"
        @toggle-zen="toggleZenMode"
        @page-stats="editorPageStats = $event"
        @open-badges="isBadgesModalOpen = true"
        @open-spotlight="isSpotlightOpen = true"
      />

      <!-- VIEW B: BOOKSHELF & PAGES GALLERY -->
      <div v-else class="lumina-gallery-stage">
        <!-- Floating Glass Gallery Top Capsule -->
        <div class="gallery-header-wrap">
          <header class="lumina-gallery-capsule">
            <div class="gal-left">
              <div class="gal-title-row">
                <h2 class="gal-heading">{{ currentCategoryName }}</h2>
                <span class="gal-count-pill">{{ filteredNotes.length }} Defter</span>
              </div>
            </div>

            <div class="gal-right">
              <!-- Global Spotlight Search Button -->
              <button
                class="gal-icon-pill"
                @click="isSpotlightOpen = true"
                title="Hızlı Arama & Spotlight (Ctrl+K)"
              >
                <Search :size="15" />
                <span class="spot-shortcut hide-xs">Ctrl+K</span>
              </button>

              <!-- Live Level / Gamification Pill -->
              <button
                class="gal-level-pill"
                @click="isBadgesModalOpen = true"
                :title="`Seviye ${currentLevel}: ${currentTitle} (%${levelProgressPercent} • Bu Hafta: ${formattedWeeklyHours})`"
              >
                <span class="lvl-emoji">{{ currentEmoji }}</span>
                <span class="lvl-title hide-sm">Lv.{{ currentLevel }} {{ currentTitle }}</span>
                <span class="lvl-pct">%{{ levelProgressPercent }}</span>
              </button>

              <!-- Ambient Sound Quick Pill -->
              <button
                class="gal-icon-pill"
                :class="{ active: activeAmbientSound !== 'off' }"
                @click="cycleAmbientSound"
                :title="`Odak Sesi: ${currentAmbientObj.name}`"
              >
                <span>{{ currentAmbientObj.emoji }}</span>
              </button>

              <!-- Shelf vs Pages Segmented Switcher -->
              <div class="gal-segmented">
                <button
                  class="gal-seg-btn"
                  :class="{ active: viewMode === 'shelf' }"
                  @click="setViewMode('shelf')"
                  title="3D Ciltli Kitaplık Görünümü"
                >
                  <BookOpen :size="15" />
                  <span class="hide-xs">Kitaplık</span>
                </button>
                <button
                  class="gal-seg-btn"
                  :class="{ active: viewMode === 'pages' }"
                  @click="setViewMode('pages')"
                  title="İç Sayfa Önizleme Görünümü"
                >
                  <LayoutGrid :size="15" />
                  <span class="hide-xs">Sayfalar</span>
                </button>
              </div>

              <!-- Empty Trash Action (Inline 2-step confirmation) or Create New Note CTA -->
              <template v-if="activeCategory === 'trash' && filteredNotes.length > 0">
                <div v-if="isConfirmingEmptyTrash" class="trash-confirm-pill">
                  <button type="button" class="gal-danger-btn confirm-yes" @click="executeEmptyTrash">
                    <Trash2 :size="14" />
                    <span>Kalıcı Sil</span>
                  </button>
                  <button type="button" class="gal-icon-pill" @click="isConfirmingEmptyTrash = false" title="Vazgeç">
                    &times;
                  </button>
                </div>
                <button
                  v-else
                  type="button"
                  class="gal-danger-btn"
                  @click="askEmptyTrash"
                >
                  <Trash2 :size="14" />
                  <span>Boşalt</span>
                </button>
              </template>
              <button
                v-else-if="activeCategory !== 'trash'"
                type="button"
                class="gal-primary-btn"
                @click="createNewNote()"
              >
                <Plus :size="16" />
                <span class="hide-xs">Yeni Defter</span>
              </button>
            </div>
          </header>
        </div>

        <!-- Scrollable Gallery Grid -->
        <div class="gallery-scroll-area">
          <div class="notes-grid" :class="{ 'shelf-layout': viewMode === 'shelf' }">
            <NewNoteCard
              v-if="activeCategory !== 'trash'"
              @create="createNewNote()"
            />

            <template v-if="viewMode === 'shelf'">
              <NotebookCover
                v-for="note in filteredNotes"
                :key="note.id"
                :note="note"
                @open="openNote"
                @request-unlock="openUnlockModal"
                @change-cover="openCoverModalForNote"
                @toggle-favorite="toggleFavorite"
                @delete="moveToTrash"
                @restore="restoreFromTrash"
                @delete-perm="deletePermanently"
              />
            </template>

            <template v-else>
              <NoteCard
                v-for="note in filteredNotes"
                :key="note.id"
                :note="note"
                :is-dark-mode="isDarkMode"
                @open="openNote"
                @request-unlock="openUnlockModal"
                @toggle-favorite="toggleFavorite"
                @delete="moveToTrash"
                @restore="restoreFromTrash"
                @delete-perm="deletePermanently"
              />
            </template>
          </div>

          <!-- Empty States -->
          <div
            v-if="filteredNotes.length === 0 && activeCategory === 'trash'"
            class="lumina-empty-state"
          >
            <div class="empty-orb">🗑️</div>
            <h3>Çöp Kutusu Tertemiz</h3>
            <p>Silinen hiçbir defter bulunmuyor.</p>
          </div>

          <div
            v-else-if="filteredNotes.length === 0 && searchQuery.trim()"
            class="lumina-empty-state"
          >
            <div class="empty-orb">🔍</div>
            <h3>Eşleşen Defter Bulunamadı</h3>
            <p>"{{ searchQuery }}" aramasıyla eşleşen bir içerik yok.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- RIGHT MAGNETIC FROSTED WING: YAPILACAKLAR (TO-DO) -->
    <Transition name="wing-right">
      <div
        v-if="isRightPanelOpen"
        class="wing-slot right-wing-slot no-print"
        :class="{
          'drawer-floating': !isWideScreen,
          'dock-spaced': isWideScreen
        }"
      >
        <NoteTodoPanel
          :note-todos="currentEditingNote?.todos || []"
          :has-active-note="!!currentEditingNote"
          @add-note-todo="onAddNoteTodo"
          @toggle-note-todo="onToggleNoteTodo"
          @delete-note-todo="onDeleteNoteTodo"
          @clear-done-note-todos="onClearDoneNoteTodos"
          @collapse="isRightPanelOpen = false"
        />
      </div>
    </Transition>

    <!-- RIGHT MAGNETIC EDGE DOCK (Always keeps Page Layout & Settings + To-Do Toggle right on the edge!) -->
    <div class="lumina-magnetic-edge right-edge no-print">
      <!-- To-Do Toggle Magnetic Tab -->
      <button
        class="magnetic-tab-btn"
        :class="{ active: isRightPanelOpen }"
        @click="toggleRightWing"
        :title="isRightPanelOpen ? 'Yapılacaklar Bölmesini Katla' : 'Yapılacaklar Bölmesini Aç'"
      >
        <CheckSquare :size="17" />
        <span v-if="!isRightPanelOpen" class="mag-label">Görevler</span>
        <span v-if="pendingTodoCount > 0" class="mag-badge">{{ pendingTodoCount }}</span>
      </button>

      <!-- Page Layout & Slots Magnetic Tab (Visible when editing a notebook) -->
      <button
        v-if="currentEditingNote"
        type="button"
        class="magnetic-tab-btn"
        :class="{ active: isPageSlotsOpen }"
        @click="togglePageSlots"
        title="Sayfa Düzeni ve Sayfa Slotları"
      >
        <Layers :size="17" />
        <span v-if="!isRightPanelOpen" class="mag-label">Düzen</span>
        <span class="mag-badge">{{ editorPageStats.current }}/{{ editorPageStats.total }}</span>
      </button>
    </div>

    <!-- MODALS -->
    <GuideModal
      :is-open="isGuideModalOpen"
      @close="isGuideModalOpen = false"
    />

    <SettingsModal
      :is-open="isSettingsModalOpen"
      @close="isSettingsModalOpen = false"
      @export-backup="exportBackup"
      @import-backup="handleBackupImport"
    />

    <FolderModal
      v-if="isFolderModalOpen"
      @close="isFolderModalOpen = false"
      @create="addFolder($event.name, $event.color)"
    />

    <PinModal
      v-if="isUnlockModalOpen"
      :mode="'unlock'"
      :current-pin="noteToUnlock?.pin"
      @close="isUnlockModalOpen = false"
      @success="onUnlockSuccess"
    />

    <CoverPickerModal
      v-if="isCoverModalOpen && noteToChangeCover"
      :current-cover="noteToChangeCover.coverStyle"
      @close="isCoverModalOpen = false"
      @select="handleCoverSelected"
    />

    <!-- Gamification Badges & Achievement Showcase Modal -->
    <BadgesModal
      :is-open="isBadgesModalOpen"
      @close="isBadgesModalOpen = false"
    />

    <!-- Global Spotlight Quick Search Modal (Ctrl+K) -->
    <SpotlightSearchModal
      :is-open="isSpotlightOpen"
      :notes="notes"
      @select-note="onSpotlightSelectNote"
      @close="isSpotlightOpen = false"
    />

    <!-- Non-Blocking Toast Banner -->
    <Transition name="fade-backdrop">
      <div v-if="toastMessage" class="lumina-toast-banner no-print">
        <span>{{ toastMessage }}</span>
        <button type="button" class="toast-close" @click="toastMessage = ''">&times;</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import {
  Trash2, BookOpen, LayoutGrid, Plus, CheckSquare, Layers, Search
} from '@lucide/vue';
import { useNotes } from './composables/useNotes.js';
import { useSettings, AMBIENT_SOUNDS } from './composables/useSettings.js';
import { useGamification } from './composables/useGamification.js';

import Sidebar from './components/Sidebar.vue';
import NoteTodoPanel from './components/NoteTodoPanel.vue';
import NewNoteCard from './components/NewNoteCard.vue';
import NoteCard from './components/NoteCard.vue';
import NotebookCover from './components/NotebookCover.vue';
import Editor from './components/Editor.vue';
import FolderModal from './components/FolderModal.vue';
import PinModal from './components/PinModal.vue';
import CoverPickerModal from './components/CoverPickerModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import GuideModal from './components/GuideModal.vue';
import BadgesModal from './components/BadgesModal.vue';
import SpotlightSearchModal from './components/SpotlightSearchModal.vue';

const WIDE_BREAKPOINT = 1240;

const {
  isDarkMode,
  viewMode,
  setViewMode,
  toggleDarkMode,
  folders,
  allTags,
  activeCategory,
  searchQuery,
  currentEditingNote,
  counts,
  filteredNotes,
  createNewNote,
  openNote,
  closeEditor,
  updateCurrentNote,
  setNoteCover,
  toggleFavorite,
  moveToTrash,
  restoreFromTrash,
  deletePermanently,
  emptyTrash,
  addFolder,
  deleteFolder,
  exportBackup,
  importBackup
} = useNotes();

function handleCloseEditor() {
  if (typeof window !== 'undefined' && window.__luminaFlushSave) {
    try {
      window.__luminaFlushSave();
    } catch (e) {
      console.warn('Flush save error on close:', e);
    }
  }
  closeEditor();
}

const {
  settings,
  globalTodos,
  activeAmbientSound,
  cycleAmbientSound
} = useSettings();

const currentAmbientObj = computed(() => {
  return AMBIENT_SOUNDS.find(s => s.id === activeAmbientSound.value) || AMBIENT_SOUNDS[0];
});

// ----------------- ADAPTIVE SCREEN RESOLUTION ENGINE -----------------
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1440);
const isWideScreen = computed(() => windowWidth.value >= WIDE_BREAKPOINT);

const initialOpen = isWideScreen.value && settings.value.autoOpenPanelsOnWide;
const isLeftPanelOpen = ref(initialOpen);
const isRightPanelOpen = ref(initialOpen);
const isZenMode = ref(false);

let wasWide = isWideScreen.value;
function handleWindowResize() {
  windowWidth.value = window.innerWidth;
  const nowWide = windowWidth.value >= WIDE_BREAKPOINT;

  if (nowWide !== wasWide) {
    wasWide = nowWide;
    if (nowWide && settings.value.autoOpenPanelsOnWide && !isZenMode.value) {
      isLeftPanelOpen.value = true;
      isRightPanelOpen.value = true;
    } else if (!nowWide) {
      isLeftPanelOpen.value = false;
      isRightPanelOpen.value = false;
    }
  }
}

watch(() => settings.value.autoOpenPanelsOnWide, (autoOpen) => {
  if (isWideScreen.value && !isZenMode.value) {
    isLeftPanelOpen.value = autoOpen;
    isRightPanelOpen.value = autoOpen;
  }
});

function handleAppKeydown(e) {
  if (e.key === 'Escape' && !isWideScreen.value && (isLeftPanelOpen.value || isRightPanelOpen.value)) {
    closeMobileWings();
  }
}

onMounted(() => {
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('keydown', handleAppKeydown);
  window.addEventListener('keydown', handleGlobalAppKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  window.removeEventListener('keydown', handleAppKeydown);
  window.removeEventListener('keydown', handleGlobalAppKeydown);
});

function openLeftWing() {
  if (!isWideScreen.value) {
    isRightPanelOpen.value = false;
    isPageSlotsOpen.value = false;
  }
  isLeftPanelOpen.value = true;
}

function toggleRightWing() {
  if (!isRightPanelOpen.value && !isWideScreen.value) {
    isLeftPanelOpen.value = false;
    isPageSlotsOpen.value = false;
  }
  isRightPanelOpen.value = !isRightPanelOpen.value;
}

function togglePageSlots() {
  const next = !isPageSlotsOpen.value;
  if (next && !isWideScreen.value) {
    isLeftPanelOpen.value = false;
    isRightPanelOpen.value = false;
  }
  isPageSlotsOpen.value = next;
}

function closeMobileWings() {
  isLeftPanelOpen.value = false;
  isRightPanelOpen.value = false;
}

function toggleZenMode() {
  isZenMode.value = !isZenMode.value;
  if (isZenMode.value) {
    isLeftPanelOpen.value = false;
    isRightPanelOpen.value = false;
  } else if (isWideScreen.value && settings.value.autoOpenPanelsOnWide) {
    isLeftPanelOpen.value = true;
    isRightPanelOpen.value = true;
  }
}

// ----------------- PAGE SLOTS & MODALS STATE -----------------
const isPageSlotsOpen = ref(false);
const editorPageStats = ref({ current: 1, total: 1 });
const isSettingsModalOpen = ref(false);
const isGuideModalOpen = ref(false);
const isFolderModalOpen = ref(false);
const isUnlockModalOpen = ref(false);
const noteToUnlock = ref(null);
const isCoverModalOpen = ref(false);
const noteToChangeCover = ref(null);
const isBadgesModalOpen = ref(false);
const isSpotlightOpen = ref(false);

const {
  currentLevel,
  levelProgressPercent,
  currentTitle,
  currentEmoji,
  formattedWeeklyHours
} = useGamification();

function onSpotlightSelectNote(note) {
  if (note) {
    if (note.isLocked) {
      requestUnlock(note);
    } else {
      openNote(note);
    }
  }
}

function handleGlobalAppKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    isSpotlightOpen.value = !isSpotlightOpen.value;
  }
}

// Reset page slots drawer when closing editor
watch(currentEditingNote, (val) => {
  if (!val) {
    isPageSlotsOpen.value = false;
    isZenMode.value = false;
  }
});

// ----------------- RIGHT WING NOTE TO-DO HANDLERS -----------------
const pendingTodoCount = computed(() => {
  const list = currentEditingNote.value ? (currentEditingNote.value.todos || []) : globalTodos.value;
  return list.filter(t => !t.done).length;
});

function onAddNoteTodo(text) {
  if (!currentEditingNote.value) return;
  const list = [...(currentEditingNote.value.todos || [])];
  list.push({
    id: `td_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    text,
    done: false,
    createdAt: new Date().toISOString()
  });
  updateCurrentNote({ todos: list });
}

function onToggleNoteTodo(id) {
  if (!currentEditingNote.value) return;
  const list = (currentEditingNote.value.todos || []).map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  updateCurrentNote({ todos: list });
}

function onDeleteNoteTodo(id) {
  if (!currentEditingNote.value) return;
  const list = (currentEditingNote.value.todos || []).filter(t => t.id !== id);
  updateCurrentNote({ todos: list });
}

function onClearDoneNoteTodos() {
  if (!currentEditingNote.value) return;
  const list = (currentEditingNote.value.todos || []).filter(t => !t.done);
  updateCurrentNote({ todos: list });
}

// ----------------- NAVIGATION & ACTIONS -----------------
function onSelectCategory(cat) {
  activeCategory.value = cat;
  if (!isWideScreen.value) isLeftPanelOpen.value = false;
}

function handleQuickNoteSelect(note) {
  if (note.isLocked) {
    openUnlockModal(note);
  } else {
    openNote(note);
  }
  if (!isWideScreen.value) isLeftPanelOpen.value = false;
}

function handleQuickCreate() {
  createNewNote();
  if (!isWideScreen.value) isLeftPanelOpen.value = false;
}

function openUnlockModal(note) {
  noteToUnlock.value = note;
  isUnlockModalOpen.value = true;
}

function onUnlockSuccess() {
  if (noteToUnlock.value) {
    openNote(noteToUnlock.value);
  }
  isUnlockModalOpen.value = false;
  noteToUnlock.value = null;
}

function openCoverModalForNote(note) {
  noteToChangeCover.value = note;
  isCoverModalOpen.value = true;
}

function handleCoverSelected(coverStyleId) {
  if (noteToChangeCover.value) {
    setNoteCover(noteToChangeCover.value.id, coverStyleId);
  }
  isCoverModalOpen.value = false;
  noteToChangeCover.value = null;
}

const toastMessage = ref('');
let toastTimer = null;
function showToast(msg) {
  toastMessage.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 3800);
}

function handleBackupImport(jsonStr) {
  const res = importBackup(jsonStr);
  if (res.success) {
    showToast(`✅ Yedek başarıyla yüklendi! (${res.count} defter içe aktarıldı)`);
  } else {
    showToast('⚠️ Geçersiz yedek dosyası! Lütfen geçerli bir JSON dosyası seçin.');
  }
}

const currentCategoryName = computed(() => {
  if (activeCategory.value === 'all') return 'Tüm Defterlerim';
  if (activeCategory.value === 'favorites') return 'Favorilerim';
  if (activeCategory.value === 'trash') return 'Çöp Kutusu';
  if (activeCategory.value.startsWith('tag_')) {
    return '#' + activeCategory.value.replace('tag_', '');
  }
  if (activeCategory.value.startsWith('folder_')) {
    const fId = activeCategory.value.replace('folder_', '');
    const folder = folders.value.find(f => f.id === fId);
    return folder ? folder.name : 'Klasör';
  }
  return 'Defterlerim';
});

const isConfirmingEmptyTrash = ref(false);
let emptyTrashTimer = null;

watch(activeCategory, () => {
  isConfirmingEmptyTrash.value = false;
});

function askEmptyTrash() {
  isConfirmingEmptyTrash.value = true;
  clearTimeout(emptyTrashTimer);
  emptyTrashTimer = setTimeout(() => {
    isConfirmingEmptyTrash.value = false;
  }, 4500);
}

function executeEmptyTrash() {
  isConfirmingEmptyTrash.value = false;
  emptyTrash();
  showToast('🗑️ Çöp kutusu tamamen temizlendi.');
}
</script>

<style scoped>
.lumina-app-shell {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  position: relative;
  background: transparent;
}

/* MAGNETIC EDGE DOCKS (Lumina Pro Signature) */
.lumina-magnetic-edge {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lumina-magnetic-edge.left-edge {
  left: 0;
  align-items: flex-start;
}

.lumina-magnetic-edge.right-edge {
  right: 0;
  align-items: flex-end;
}

.magnetic-tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 11px 8px;
  min-width: 40px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  color: var(--color-text-muted);
  cursor: pointer;
  box-shadow:
    0 8px 24px -4px rgba(0, 0, 0, 0.10),
    0 0 0 1px var(--border-color);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.left-edge .magnetic-tab-btn {
  border-left: none;
  border-radius: 0 16px 16px 0;
  padding-left: 10px;
}

.left-edge .magnetic-tab-btn:hover {
  padding-left: 15px;
  color: var(--color-primary);
  background: var(--bg-surface);
}

.right-edge .magnetic-tab-btn {
  border-right: none;
  border-radius: 16px 0 0 16px;
  padding-right: 10px;
}

.right-edge .magnetic-tab-btn:hover {
  padding-right: 15px;
  color: var(--color-primary);
  background: var(--bg-surface);
}

.magnetic-tab-btn.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.mag-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.mag-badge {
  font-size: 9.5px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 99px;
  background: var(--color-primary);
  color: #ffffff;
  line-height: 1.3;
}

[data-theme="dark"] .mag-badge {
  color: #111118;
}

/* WING SLOTS & SLIDE-OVER DRAWERS */
.wing-slot {
  display: flex;
  flex-shrink: 0;
  z-index: 50;
}

.right-wing-slot.dock-spaced :deep(.lumina-right-wing) {
  margin-right: 50px;
}

.wing-slot.drawer-floating {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 80;
}

.left-wing-slot.drawer-floating {
  left: 0;
}

.right-wing-slot.drawer-floating {
  right: 0;
}

.right-wing-slot.drawer-floating :deep(.lumina-right-wing) {
  margin: 12px 12px 12px 0;
}

.mobile-wing-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(15, 12, 24, 0.28);
  backdrop-filter: blur(5px);
}

/* CENTER STAGE */
.lumina-center-stage {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: padding 0.25s ease;
}

.lumina-center-stage.with-right-dock-pad {
  padding-right: 42px;
}

/* GALLERY STAGE */
.lumina-gallery-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.gallery-header-wrap {
  padding: 12px 22px 4px 22px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  z-index: 20;
}

.lumina-gallery-capsule {
  width: 100%;
  max-width: 1320px;
  min-height: 54px;
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  box-shadow:
    0 10px 30px -8px rgba(0, 0, 0, 0.06),
    0 0 0 1px var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.gal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gal-heading {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: var(--color-text-main);
}

.gal-count-pill {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.gal-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gal-icon-pill {
  height: 34px;
  padding: 0 11px;
  border-radius: 99px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.16s;
}

.gal-icon-pill.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.spot-shortcut {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-muted);
  margin-left: 4px;
}

.gal-level-pill {
  height: 34px;
  padding: 0 12px;
  border-radius: 99px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.16s ease;
  user-select: none;
}

.gal-level-pill:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.gal-level-pill .lvl-emoji {
  font-size: 14px;
}

.gal-level-pill .lvl-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--color-text-main);
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gal-level-pill .lvl-pct {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-primary);
}

.gal-segmented {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.08);
}

.gal-seg-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
}

.gal-seg-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

.gal-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  border: none;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s, opacity 0.16s;
}

[data-theme="dark"] .gal-primary-btn {
  color: #111118;
}

.gal-primary-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.gal-danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.10);
  color: #ef4444;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.gal-danger-btn.confirm-yes {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.trash-confirm-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.lumina-toast-banner {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--bg-surface);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.18);
  color: var(--color-text-main);
  font-size: 13px;
  font-weight: 600;
}

.toast-close {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.gallery-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 26px 60px 26px;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 22px;
  max-width: 1320px;
  margin: 0 auto;
}

.notes-grid.shelf-layout {
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 26px;
}

.lumina-empty-state {
  margin: 60px auto;
  max-width: 360px;
  padding: 32px 24px;
  border-radius: 24px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  text-align: center;
  color: var(--color-text-muted);
}

.empty-orb {
  font-size: 40px;
  margin-bottom: 10px;
}

.lumina-empty-state h3 {
  font-size: 16.5px;
  color: var(--color-text-main);
  margin: 0 0 6px 0;
}

.lumina-empty-state p {
  font-size: 13px;
  margin: 0;
}

/* Wing Animations */
.wing-left-enter-active,
.wing-left-leave-active,
.wing-right-enter-active,
.wing-right-leave-active {
  transition: opacity 0.25s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.wing-left-enter-from,
.wing-left-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}

.wing-right-enter-from,
.wing-right-leave-to {
  opacity: 0;
  transform: translateX(28px);
}

.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
}

/* Mobile & Tablet Edge Refinements */
@media (max-width: 1239px) {
  .gallery-header-wrap {
    padding: 12px 48px 4px 48px;
  }
  .gallery-scroll-area {
    padding: 16px 46px 60px 46px;
  }
}

@media (max-width: 640px) {
  .gallery-header-wrap {
    padding: 10px 40px 4px 40px;
  }
  .gallery-scroll-area {
    padding: 14px 38px 50px 38px;
  }
  .gal-heading {
    font-size: 15.5px;
  }
  .hide-xs {
    display: none;
  }
  .mag-label {
    display: none;
  }
  .magnetic-tab-btn {
    padding: 9px 6px;
    min-width: 32px;
  }
}
</style>
