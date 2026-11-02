<template>
  <aside class="lumina-left-wing no-print" @click.stop>
    <!-- Header: Brand + Collapse -->
    <div class="wing-header">
      <div class="brand-group" @click="$emit('open-settings')" title="Tema & Stüdyo Ayarları">
        <div class="brand-orb">{{ currentTheme.emoji }}</div>
        <div class="brand-meta">
          <h1 class="brand-title">Lumina</h1>
          <span class="brand-theme-pill">{{ currentTheme.name }}</span>
        </div>
      </div>

      <div class="wing-header-actions">
        <button
          class="wing-icon-btn"
          @click="$emit('toggle-dark')"
          :title="isDarkMode ? 'Açık Pastel Moda Geç' : 'Koyu Pastel Moda Geç'"
        >
          <Sun v-if="isDarkMode" :size="16" class="sun-ic" />
          <Moon v-else :size="16" class="moon-ic" />
        </button>

        <button
          class="wing-icon-btn collapse-btn"
          @click="$emit('collapse')"
          title="Kenar Kulakçığına Katla"
        >
          <ChevronsLeft :size="17" />
        </button>
      </div>
    </div>

    <!-- Search Pill -->
    <div class="wing-search">
      <Search :size="15" class="search-ic" />
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        placeholder="Defterlerde veya #etiket ara..."
        class="wing-search-input"
      />
      <button
        v-if="searchQuery"
        class="clear-btn"
        @click="$emit('update:searchQuery', '')"
      >
        &times;
      </button>
    </div>

    <!-- If inside Editor: Back to Full Shelf Gallery + Quick Create -->
    <div v-if="currentNoteId" class="editor-bridge-bar">
      <button class="shelf-return-btn" @click="$emit('back-to-shelf')">
        <LayoutGrid :size="15" />
        <span>Kitaplık Rafı</span>
      </button>
      <button class="quick-new-btn" @click="$emit('create-note')" title="Yeni Defter Aç">
        <Plus :size="15" />
        <span>Yeni</span>
      </button>
    </div>

    <!-- Scrollable Navigation -->
    <nav class="wing-scroll">
      <!-- Categories -->
      <div class="section-cap">KİTAPLIK</div>

      <button
        class="wing-nav-btn"
        :class="{ active: activeCategory === 'all' && !currentNoteId }"
        @click="handleCategoryClick('all')"
      >
        <div class="nav-l">
          <BookOpen :size="16" class="nav-ic" />
          <span>Tüm Defterler</span>
        </div>
        <span class="nav-count">{{ counts.total }}</span>
      </button>

      <button
        class="wing-nav-btn"
        :class="{ active: activeCategory === 'favorites' }"
        @click="handleCategoryClick('favorites')"
      >
        <div class="nav-l">
          <Star :size="16" class="nav-ic star-ic" />
          <span>Favoriler</span>
        </div>
        <span class="nav-count">{{ counts.favorites }}</span>
      </button>

      <!-- Folders -->
      <div class="section-row">
        <span class="section-cap">KLASÖRLER</span>
        <button class="mini-add-btn" @click="$emit('open-folder-modal')">
          <FolderPlus :size="13" />
          <span>Yeni</span>
        </button>
      </div>

      <div v-if="folders.length === 0" class="empty-hint-row">
        Henüz klasör oluşturulmadı
      </div>

      <div class="folders-stack">
        <button
          v-for="folder in folders"
          :key="folder.id"
          class="wing-nav-btn folder-row"
          :class="{ active: activeCategory === `folder_${folder.id}` }"
          @click="handleCategoryClick(`folder_${folder.id}`)"
        >
          <div class="nav-l">
            <span class="folder-orb" :style="{ backgroundColor: folder.color }"></span>
            <span class="truncate-txt">{{ folder.name }}</span>
          </div>
          <div class="nav-r">
            <template v-if="pendingDeleteFolderId === folder.id">
              <span
                class="folder-confirm-yes"
                title="Silmeyi Onayla"
                @click.stop="executeDeleteFolder(folder.id)"
              >
                Sil ✓
              </span>
              <span
                class="folder-confirm-no"
                title="Vazgeç"
                @click.stop="pendingDeleteFolderId = null"
              >
                &times;
              </span>
            </template>
            <template v-else>
              <span class="nav-count">{{ counts.folderCounts[folder.id] || 0 }}</span>
              <span
                class="folder-del-ic"
                title="Klasörü Sil"
                @click.stop="askDeleteFolder(folder.id)"
              >
                <Trash2 :size="12" />
              </span>
            </template>
          </div>
        </button>
      </div>

      <!-- Quick Notebooks List (Especially magical when inside Editor or filtering!) -->
      <template v-if="quickNotes.length > 0 && activeCategory !== 'trash'">
        <div class="section-row">
          <span class="section-cap">HIZLI DEFTER GEÇİŞİ</span>
        </div>
        <div class="quick-notes-stack">
          <button
            v-for="n in quickNotes.slice(0, 12)"
            :key="n.id"
            class="quick-note-item"
            :class="{ active: currentNoteId === n.id }"
            @click="$emit('select-note', n)"
          >
            <span class="qn-dot" :class="`paper-${n.paperColor || 'cream'}`"></span>
            <span class="qn-title">{{ n.title || 'Başlıksız Defter' }}</span>
            <span v-if="n.isLocked" class="qn-lock">🔒</span>
            <span v-else-if="n.pages?.length > 1" class="qn-pages">{{ n.pages.length }}s</span>
          </button>
        </div>
      </template>

      <!-- Tags -->
      <template v-if="allTags && allTags.length > 0">
        <div class="section-cap" style="margin-top: 8px;">ETİKETLER</div>
        <div class="tags-cloud">
          <button
            v-for="tag in allTags"
            :key="tag"
            class="tag-chip"
            :class="{ active: activeCategory === `tag_${tag}` }"
            @click="handleCategoryClick(`tag_${tag}`)"
          >
            #{{ tag }}
          </button>
        </div>
      </template>

      <!-- Spacer pushes the bottom dock to the footer of the sidebar -->
      <div class="wing-spacer"></div>

      <!-- Bottom Utility Dock: Lumina Rehberi, Ayarlar, Çöp Kutusu -->
      <div class="wing-bottom-dock">
        <!-- Lumina Guide & Feature Tour Button -->
        <button
          type="button"
          class="wing-nav-btn guide-row"
          @click="$emit('open-guide')"
          title="Lumina Papelle Özellikler & İpuçları Rehberi"
        >
          <div class="nav-l">
            <Sparkles :size="15" class="nav-ic guide-ic" />
            <span>Lumina Rehberi</span>
          </div>
          <span class="guide-badge">İpuçları</span>
        </button>

        <!-- Ayarlar -->
        <button
          type="button"
          class="wing-nav-btn settings-row"
          @click="$emit('open-settings')"
          title="Stüdyo Ayarları & 9 Pastel Tema"
        >
          <div class="nav-l">
            <Settings :size="15" class="nav-ic settings-ic" />
            <span>Ayarlar</span>
          </div>
        </button>

        <!-- Çöp Kutusu -->
        <button
          class="wing-nav-btn trash-row"
          :class="{ active: activeCategory === 'trash' }"
          @click="handleCategoryClick('trash')"
          title="Çöp Kutusu"
        >
          <div class="nav-l">
            <Trash2 :size="15" class="nav-ic" />
            <span>Çöp Kutusu</span>
          </div>
          <span class="nav-count">{{ counts.trash }}</span>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import {
  BookOpen, Star, Trash2, FolderPlus, Search, Sun, Moon,
  Settings, ChevronsLeft, LayoutGrid, Plus, Sparkles
} from '@lucide/vue';
import { useSettings } from '../composables/useSettings.js';

const props = defineProps({
  activeCategory: { type: String, required: true },
  counts: { type: Object, required: true },
  folders: { type: Array, required: true },
  allTags: { type: Array, default: () => [] },
  quickNotes: { type: Array, default: () => [] },
  currentNoteId: { type: String, default: null },
  searchQuery: { type: String, default: '' },
  isDarkMode: { type: Boolean, default: false }
});

const emit = defineEmits([
  'select-category',
  'select-note',
  'create-note',
  'back-to-shelf',
  'update:searchQuery',
  'open-folder-modal',
  'delete-folder',
  'toggle-dark',
  'open-settings',
  'open-guide',
  'collapse'
]);

const { currentTheme } = useSettings();

function handleCategoryClick(cat) {
  emit('select-category', cat);
  if (props.currentNoteId) {
    emit('back-to-shelf');
  }
}

const pendingDeleteFolderId = ref(null);
let folderDelTimer = null;

function askDeleteFolder(folderId) {
  pendingDeleteFolderId.value = folderId;
  clearTimeout(folderDelTimer);
  folderDelTimer = setTimeout(() => {
    if (pendingDeleteFolderId.value === folderId) {
      pendingDeleteFolderId.value = null;
    }
  }, 4000);
}

function executeDeleteFolder(folderId) {
  pendingDeleteFolderId.value = null;
  emit('delete-folder', folderId);
}
</script>

<style scoped>
.lumina-left-wing {
  width: 268px;
  height: calc(100vh - 24px);
  margin: 12px 0 12px 12px;
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
  overflow: hidden;
  z-index: 45;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.wing-header {
  padding: 16px 14px 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 0;
}

.brand-orb {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--color-primary-soft);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.brand-group:hover .brand-orb {
  transform: scale(1.06) rotate(-4deg);
}

.brand-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: var(--color-text-main);
  margin: 0;
  line-height: 1.15;
}

.brand-theme-pill {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wing-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wing-icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s ease;
}

.wing-icon-btn:hover {
  background: var(--bg-surface);
  border-color: var(--border-color);
  color: var(--color-primary);
}

.sun-ic { color: #f59e0b; }
.moon-ic { color: var(--color-primary); }

/* Search */
.wing-search {
  margin: 4px 12px 10px 12px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-ic {
  position: absolute;
  left: 11px;
  color: var(--color-text-muted);
  pointer-events: none;
  opacity: 0.75;
}

.wing-search-input {
  width: 100%;
  padding: 8px 28px 8px 32px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
  font-size: 12.5px;
  outline: none;
  transition: all 0.18s ease;
}

.wing-search-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.75;
}

.wing-search-input:focus {
  background: var(--bg-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.clear-btn {
  position: absolute;
  right: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 15px;
  cursor: pointer;
}

/* Editor Bridge Bar */
.editor-bridge-bar {
  display: flex;
  gap: 6px;
  margin: 0 12px 10px 12px;
}

.shelf-return-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 11px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--color-text-main);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
}

.shelf-return-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.quick-new-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 11px;
  border-radius: 11px;
  border: none;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.16s;
}

[data-theme="dark"] .quick-new-btn {
  color: #111118;
}

.quick-new-btn:hover {
  opacity: 0.9;
}

/* Scroll Nav */
.wing-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-cap {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.85px;
  color: var(--color-text-muted);
  opacity: 0.8;
  padding: 8px 8px 4px 8px;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 4px 8px;
}

.section-row .section-cap {
  padding: 0;
}

.mini-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.empty-hint-row {
  font-size: 11.5px;
  color: var(--color-text-muted);
  opacity: 0.65;
  padding: 4px 10px 6px 10px;
}

.wing-nav-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7.5px 10px;
  border-radius: 11px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.wing-nav-btn:hover {
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
}

.wing-nav-btn.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 700;
}

.nav-l {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.nav-r {
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-ic {
  flex-shrink: 0;
}

.star-ic {
  color: #f59e0b;
}

.nav-count {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 99px;
  background: var(--bg-surface-subtle);
  color: var(--color-text-muted);
}

.wing-nav-btn.active .nav-count {
  background: var(--color-primary);
  color: #ffffff;
}

[data-theme="dark"] .wing-nav-btn.active .nav-count {
  color: #111118;
}

.folder-orb {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.truncate-txt {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 135px;
}

.folder-del-ic {
  opacity: 0;
  display: inline-flex;
  padding: 3px;
  border-radius: 5px;
  color: var(--color-text-muted);
  transition: all 0.15s;
}

.folder-row:hover .folder-del-ic {
  opacity: 1;
}

.folder-del-ic:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

.folder-confirm-yes {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 99px;
  background: #ef4444;
  color: #ffffff;
}

.folder-confirm-no {
  font-size: 14px;
  font-weight: 700;
  padding: 0 4px;
  color: var(--color-text-muted);
}

/* Quick Notes Switcher */
.quick-notes-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quick-note-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6.5px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-main);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.quick-note-item:hover {
  background: var(--bg-surface-subtle);
}

.quick-note-item.active {
  background: var(--bg-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.qn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #FAF8F5;
}
.qn-dot.paper-rose { background: #FDA4AF; }
.qn-dot.paper-peach { background: #FDBA74; }
.qn-dot.paper-butter { background: #FDE047; }
.qn-dot.paper-mint { background: #86EFAC; }
.qn-dot.paper-sky { background: #7DD3FC; }
.qn-dot.paper-indigo { background: #A5B4FC; }
.qn-dot.paper-lilac { background: #D8B4FE; }

.qn-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qn-pages {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  opacity: 0.75;
}

.qn-lock {
  font-size: 10px;
}

/* Tags Cloud */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 2px 6px;
}

.tag-chip {
  padding: 3px 8px;
  border-radius: 99px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.tag-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
}

[data-theme="dark"] .tag-chip.active {
  color: #111118;
}

.wing-spacer {
  flex: 1;
  min-height: 16px;
}

.wing-bottom-dock {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
}

.guide-row {
  background: var(--bg-surface-subtle);
  border: 1px dashed var(--border-color);
  border-radius: 10px;
}

.guide-row:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.guide-ic {
  color: var(--color-primary);
}

.guide-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1.5px 7px;
  border-radius: 99px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.settings-row {
  border-radius: 10px;
}

.settings-row:hover {
  background: var(--bg-surface-subtle);
  color: var(--color-primary);
}

.settings-ic {
  transition: transform 0.3s ease;
}

.settings-row:hover .settings-ic {
  transform: rotate(45deg);
}

.trash-row {
  border-radius: 10px;
}

.trash-row:hover {
  color: #ef4444;
}
</style>
