import { ref, computed, watch } from 'vue';
import { useSettings } from './useSettings.js';
import {
  loadAllNotesFromDB,
  saveSingleNoteToDB,
  saveMultipleNotesToDB,
  deleteNoteFromDB,
  deleteMultipleNotesFromDB,
  replaceAllNotesInDB
} from './useStorage.js';

const STORAGE_KEY_NOTES = 'pastel_notes_data_v3';
const STORAGE_KEY_FOLDERS = 'pastel_folders_data_v3';
const STORAGE_KEY_VIEWMODE = 'pastel_view_mode_v1';

export const LIGHT_PASTEL_COLORS = [
  { id: 'cream', name: 'Doğal Fildişi', bg: '#FAF8F5', line: '#DDD6CA', text: '#2C2A29', preview: '#FAF8F5', tone: 'light' },
  { id: 'white', name: 'Kar Beyazı', bg: '#FFFFFF', line: '#E2E8F0', text: '#0F172A', preview: '#FFFFFF', tone: 'light' },
  { id: 'rose', name: 'Sakura Pembesi', bg: '#FFF2F4', line: '#FBCFE8', text: '#4C0519', preview: '#FFE4E6', tone: 'light' },
  { id: 'peach', name: 'Kayısı Krem', bg: '#FFF7ED', line: '#FED7AA', text: '#431407', preview: '#FFEDD5', tone: 'light' },
  { id: 'butter', name: 'Vanilya Sarısı', bg: '#FEFCE8', line: '#FDE68A', text: '#422006', preview: '#FEF9C3', tone: 'light' },
  { id: 'mint', name: 'Adaçayı Yeşili', bg: '#F1FCF5', line: '#BBF7D0', text: '#052E16', preview: '#DCFCE7', tone: 'light' },
  { id: 'sky', name: 'Buzul Mavisi', bg: '#F0F9FF', line: '#BAE6FD', text: '#082F49', preview: '#E0F2FE', tone: 'light' },
  { id: 'indigo', name: 'Lavanta Sis', bg: '#F3F4FF', line: '#C7D2FE', text: '#1E1B4B', preview: '#E0E7FF', tone: 'light' },
  { id: 'lilac', name: 'Mürdüm Leylak', bg: '#FAF5FF', line: '#E9D5FF', text: '#3B0764', preview: '#F3E8FF', tone: 'light' }
];

export const DARK_PASTEL_COLORS = [
  { id: 'dark_carbon', name: 'Gece Karbon', bg: '#1B1C24', line: '#313444', text: '#E2E8F0', preview: '#1B1C24', tone: 'dark' },
  { id: 'dark_obsidian', name: 'Koyu Obsidyen', bg: '#10121A', line: '#25293A', text: '#F8FAFC', preview: '#10121A', tone: 'dark' },
  { id: 'dark_rose', name: 'Gece Sakura', bg: '#26151E', line: '#4A2538', text: '#FCE7F3', preview: '#3D1C2C', tone: 'dark' },
  { id: 'dark_peach', name: 'Gece Kayısı', bg: '#261813', line: '#4A2E23', text: '#FFEDD5', preview: '#3C2319', tone: 'dark' },
  { id: 'dark_butter', name: 'Gece Kehribar', bg: '#242011', line: '#473F1F', text: '#FEF9C3', preview: '#383216', tone: 'dark' },
  { id: 'dark_mint', name: 'Gece Adaçayı', bg: '#12241C', line: '#1F4735', text: '#DCFCE7', preview: '#163829', tone: 'dark' },
  { id: 'dark_sky', name: 'Gece Buzul', bg: '#121E2C', line: '#223E5A', text: '#E0F2FE', preview: '#172E44', tone: 'dark' },
  { id: 'dark_indigo', name: 'Gece Lavanta', bg: '#18192E', line: '#2E315B', text: '#E0E7FF', preview: '#232546', tone: 'dark' },
  { id: 'dark_lilac', name: 'Gece Mürdüm', bg: '#20142D', line: '#402657', text: '#F3E8FF', preview: '#311D44', tone: 'dark' }
];

export const ALL_PAPER_COLORS = [...LIGHT_PASTEL_COLORS, ...DARK_PASTEL_COLORS];

export function resolvePaperColor(id, isDarkMode = false) {
  if (!id) return isDarkMode ? DARK_PASTEL_COLORS[0] : LIGHT_PASTEL_COLORS[0];
  // Direct match in dark
  const darkMatch = DARK_PASTEL_COLORS.find(c => c.id === id);
  if (darkMatch) return darkMatch;
  // Direct match in light
  const lightMatch = LIGHT_PASTEL_COLORS.find(c => c.id === id);
  if (lightMatch) return lightMatch;
  // Legacy alias support: if note had old dark paper id like 'cream' while isDarkMode was on
  if (isDarkMode) {
    const legacyIdx = LIGHT_PASTEL_COLORS.findIndex(c => c.id === id);
    if (legacyIdx >= 0 && DARK_PASTEL_COLORS[legacyIdx]) {
      return DARK_PASTEL_COLORS[legacyIdx];
    }
  }
  return isDarkMode ? DARK_PASTEL_COLORS[0] : LIGHT_PASTEL_COLORS[0];
}

export const COVER_STYLES = [
  { id: 'leather-brown', name: 'Taba Deri', type: 'leather', color: '#78350F', badge: 'Dikişli Vintage Deri' },
  { id: 'leather-black', name: 'Gece Derisi', type: 'leather', color: '#1E293B', badge: 'Asil Siyah Cilt' },
  { id: 'spiral-kraft', name: 'Spiral Telli Kraft', type: 'spiral', color: '#D97706', badge: 'Eskiz Defteri' },
  { id: 'marble-rose', name: 'Gül Mermer', type: 'marble', color: '#F43F5E', badge: 'Altın Damarlı Mermer' },
  { id: 'marble-mint', name: 'Zümrüt Mermer', type: 'marble', color: '#10B981', badge: 'Pastel Nane Mermer' },
  { id: 'linen-navy', name: 'Gece Keten Kumaş', type: 'linen', color: '#1E1B4B', badge: 'Dokulu Kumaş Cilt' },
  { id: 'linen-cream', name: 'Doğal Keten Bej', type: 'linen', color: '#A8A29E', badge: 'Minimalist Keten' },
  { id: 'pastel-sunset', name: 'Pastel Gün Batımı', type: 'gradient', color: '#FB7185', badge: 'Yumuşak Gradyan' }
];

export const PAPER_TYPES = [
  { id: 'lined', name: 'Çizgili', desc: 'Klasik satırlı defter' },
  { id: 'grid', name: 'Kareli', desc: 'Matematik ve çizim ızgarası' },
  { id: 'dot', name: 'Noktalı', desc: 'Modern Bullet Journal noktalı sayfa' },
  { id: 'plain', name: 'Düz', desc: 'Serbest boş sayfa' },
  { id: 'cornell', name: 'Cornell Notu', desc: 'Sol ipucu sütunu ve alt sentez özeti' },
  { id: 'planner', name: 'Haftalık Planlayıcı', desc: '7 sütunlu minimalist ajanda' }
];

export const PAPER_SIZES = [
  { id: 'a4', name: 'A4 Standart', badge: 'A4', desc: 'Klasik Defter (210 × 297 mm)', width: 794, minHeight: 1123, allowBook: true },
  { id: 'a5', name: 'A5 Ajanda', badge: 'A5', desc: 'Kompakt Ajanda (148 × 210 mm)', width: 560, minHeight: 794, allowBook: true },
  { id: 'a3', name: 'A3 Tabaka', badge: 'A3', desc: 'Büyük Çizim & Mimari (297 × 420 mm)', width: 1123, minHeight: 1588, allowBook: false },
  { id: 'canvas', name: 'Serbest Tuval', badge: 'Tuval', desc: 'Geniş Sanat & Eskiz Tuvali', width: 1200, minHeight: 1200, allowBook: false }
];

export function stripHtmlToText(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/div>|<\/p>|<\/li>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function enrichPageCache(p, fallbackType = 'lined', fallbackColor = 'cream', pageNumber = 1) {
  const raw = p.content || '';
  const rawLen = raw.length;
  let excerpt = p.excerpt;
  let searchText = p.searchText;

  if (p._cachedRawLen !== rawLen || typeof excerpt !== 'string' || typeof searchText !== 'string') {
    const plain = raw ? stripHtmlToText(raw) : '';
    excerpt = plain.slice(0, 150);
    searchText = plain.toLowerCase();
  }

  return {
    ...p,
    pageNumber,
    paperType: p.paperType || fallbackType,
    paperColor: p.paperColor || fallbackColor,
    content: raw,
    excerpt,
    searchText,
    _cachedRawLen: rawLen,
    drawings: p.drawings || null,
    images: p.images || [],
    stickies: p.stickies || [],
    tapes: p.tapes || []
  };
}

export function computeNoteMeta(note) {
  const fallbackType = note.paperType || 'lined';
  const fallbackColor = note.paperColor || 'cream';
  const pages = Array.isArray(note.pages) && note.pages.length > 0 ? note.pages : [];
  const pageCount = pages.length || 1;
  const firstPage = pages[0] || {};
  const firstPageType = firstPage.paperType || fallbackType;
  const firstPageColor = firstPage.paperColor || fallbackColor;

  let hasMixedPaper = false;
  let hasDrawings = Boolean(note.drawings);
  let hasImages = Boolean(note.images && note.images.length > 0);
  let hasStickies = Boolean(note.stickies && note.stickies.length > 0);

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    if (!hasMixedPaper && (p.paperType || fallbackType) !== firstPageType) {
      hasMixedPaper = true;
    }
    if (!hasDrawings && p.drawings) {
      hasDrawings = true;
    }
    if (!hasImages && p.images && p.images.length > 0) {
      hasImages = true;
    }
    if (!hasStickies && p.stickies && p.stickies.length > 0) {
      hasStickies = true;
    }
  }

  const firstExcerpt =
    typeof firstPage.excerpt === 'string'
      ? firstPage.excerpt
      : stripHtmlToText(firstPage.content || note.content || '').slice(0, 150);

  const paperSize = note.paperSize || 'a4';
  const sizeObj = PAPER_SIZES.find(s => s.id === paperSize) || PAPER_SIZES[0];

  return {
    pageCount,
    firstPageType,
    firstPageColor,
    paperSize,
    paperSizeBadge: sizeObj.badge,
    hasMixedPaper,
    hasDrawings,
    hasImages,
    hasStickies,
    excerptText: firstExcerpt || 'Boş sayfa...'
  };
}

export function normalizeNote(n) {
  const fallbackType = n.paperType || 'lined';
  const fallbackColor = n.paperColor || 'cream';
  const paperSize = n.paperSize || 'a4';
  const isA3OrCanvas = paperSize === 'a3' || paperSize === 'canvas';
  const isDoublePage = isA3OrCanvas ? false : (n.isDoublePage !== undefined ? !!n.isDoublePage : false);

  let pages = n.pages;
  if (!pages || !Array.isArray(pages) || pages.length === 0) {
    pages = [
      enrichPageCache(
        {
          id: `page_${n.id}_1`,
          pageNumber: 1,
          paperType: fallbackType,
          paperColor: fallbackColor,
          content: n.content || '',
          drawings: n.drawings || null,
          images: n.images || [],
          stickies: n.stickies || [],
          tapes: n.tapes || []
        },
        fallbackType,
        fallbackColor,
        1
      )
    ];
  } else {
    pages = pages.map((p, idx) => enrichPageCache(p, fallbackType, fallbackColor, idx + 1));
  }

  const normalized = {
    ...n,
    paperSize,
    isDoublePage,
    pages,
    fontFamily: n.fontFamily || 'Plus Jakarta Sans',
    tags: n.tags || [],
    stickies: n.stickies || [],
    tapes: n.tapes || [],
    todos: n.todos || [],
    voiceMemos: n.voiceMemos || [],
    indexTabs: n.indexTabs || [],
    isLocked: !!n.isLocked,
    pin: n.pin || null,
    coverStyle: n.coverStyle || 'leather-brown'
  };
  normalized.meta = computeNoteMeta(normalized);
  return normalized;
}

export function useNotes() {
  const { settings, toggleDarkMode: toggleSettingsDark } = useSettings();

  const isDarkMode = computed(() => settings.value.isDarkMode);
  const viewMode = ref(loadViewMode()); // 'pages' or 'shelf'
  const notes = ref(loadInitialNotesFromLocalStorage());
  const folders = ref(loadFolders());
  const activeCategory = ref('all');
  const searchQuery = ref('');
  const debouncedSearchQuery = ref('');
  const currentEditingNote = ref(null);

  // Per-note debounced IndexedDB persistence timers
  const noteSaveTimers = new Map();
  let searchDebounceTimer = null;

  watch(searchQuery, (val) => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    if (!val || !val.trim()) {
      debouncedSearchQuery.value = '';
      return;
    }
    searchDebounceTimer = setTimeout(() => {
      debouncedSearchQuery.value = val.toLowerCase().trim();
    }, 160);
  });

  function loadViewMode() {
    try {
      return localStorage.getItem(STORAGE_KEY_VIEWMODE) || 'shelf';
    } catch (e) {
      return 'shelf';
    }
  }

  function setViewMode(mode) {
    viewMode.value = mode;
    try {
      localStorage.setItem(STORAGE_KEY_VIEWMODE, mode);
    } catch (e) {}
  }

  function toggleDarkMode() {
    toggleSettingsDark();
  }

  function loadInitialNotesFromLocalStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_NOTES) || localStorage.getItem('pastel_notes_data_v2');
      let list = [];
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          list = parsed
            .filter(n => n && n.id && !String(n.id).startsWith('note_demo_'))
            .map(n => normalizeNote(n));
        }
      }

      // Synchronous immediate emergency draft restore for frame 0
      try {
        const emergencyDraftStr = localStorage.getItem('lumina_active_draft_note');
        if (emergencyDraftStr) {
          const emergencyDraft = JSON.parse(emergencyDraftStr);
          if (emergencyDraft && emergencyDraft.id) {
            const targetIdx = list.findIndex(n => n.id === emergencyDraft.id);
            if (targetIdx !== -1) {
              const existingNote = list[targetIdx];
              const draftTime = new Date(emergencyDraft.updatedAt || 0).getTime();
              const existingTime = new Date(existingNote.updatedAt || 0).getTime();
              if (draftTime >= existingTime) {
                list[targetIdx] = normalizeNote({
                  ...existingNote,
                  ...emergencyDraft,
                  updatedAt: emergencyDraft.updatedAt || existingNote.updatedAt
                });
              }
            }
          }
        }
      } catch (e) {}

      return list;
    } catch (e) {
      console.error('LocalStorage notes read warning:', e);
    }
    return [];
  }

  // Hydrate & migrate seamlessly with IndexedDB + Emergency Auto-Recovery
  async function hydrateFromIndexedDB() {
    try {
      const dbNotes = await loadAllNotesFromDB();
      if (dbNotes && dbNotes.length > 0) {
        let normalizedList = dbNotes
          .filter(n => n && n.id && !String(n.id).startsWith('note_demo_'))
          .map(n => normalizeNote(n));

        // 🛡️ EMERGENCY DRAFT RECOVERY:
        // If app crashed or was abruptly closed, check if a newer draft exists in localStorage
        try {
          const emergencyDraftStr = localStorage.getItem('lumina_active_draft_note');
          if (emergencyDraftStr) {
            const emergencyDraft = JSON.parse(emergencyDraftStr);
            if (emergencyDraft && emergencyDraft.id) {
              const targetIdx = normalizedList.findIndex(n => n.id === emergencyDraft.id);
              if (targetIdx !== -1) {
                const existingNote = normalizedList[targetIdx];
                const draftTime = new Date(emergencyDraft.updatedAt || 0).getTime();
                const existingTime = new Date(existingNote.updatedAt || 0).getTime();
                if (draftTime >= existingTime) {
                  console.log('⚡ Lumina Güvenlik: Son yazılan kurtarma taslağı geri yüklendi:', emergencyDraft.id);
                  normalizedList[targetIdx] = normalizeNote({
                    ...existingNote,
                    ...emergencyDraft,
                    updatedAt: emergencyDraft.updatedAt || existingNote.updatedAt
                  });
                  // Persist recovered note back to IndexedDB
                  saveSingleNoteToDB(normalizedList[targetIdx]);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Emergency draft check error:', e);
        }

        notes.value = normalizedList;

        if (currentEditingNote.value) {
          const updatedRef = normalizedList.find(n => n.id === currentEditingNote.value.id);
          if (updatedRef) currentEditingNote.value = updatedRef;
        }
      } else if (notes.value.length > 0) {
        // Migrate existing localStorage notes into IndexedDB
        await saveMultipleNotesToDB(notes.value);
      }
    } catch (err) {
      console.error('IndexedDB hydration error:', err);
    }
  }

  hydrateFromIndexedDB();

  function loadFolders() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_FOLDERS) || localStorage.getItem('pastel_folders_data_v2');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Folders loading error:', e);
    }
    return [];
  }

  function scheduleSaveNote(note, immediate = false) {
    if (!note || !note.id) return;
    if (noteSaveTimers.has(note.id)) {
      clearTimeout(noteSaveTimers.get(note.id));
      noteSaveTimers.delete(note.id);
    }

    const performSave = () => {
      noteSaveTimers.delete(note.id);
      saveSingleNoteToDB(note);
      tryImmediateSyncBackup();
    };

    if (immediate) {
      performSave();
    } else {
      // Snappy 120ms debounce
      const timer = setTimeout(performSave, 120);
      noteSaveTimers.set(note.id, timer);
    }
  }

  // Synchronous and immediate backup to localStorage
  function tryImmediateSyncBackup() {
    try {
      const totalPages = notes.value.reduce((acc, n) => acc + (n.meta?.pageCount || n.pages?.length || 1), 0);
      if (totalPages <= 140) {
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes.value));
      }
    } catch (e) {
      // Handled if quota exceeded
    }
  }

  function flushAllPendingSaves() {
    noteSaveTimers.forEach((timer, noteId) => {
      clearTimeout(timer);
      const note = notes.value.find(n => n.id === noteId);
      if (note) {
        saveSingleNoteToDB(note);
      }
    });
    noteSaveTimers.clear();
    tryImmediateSyncBackup();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushAllPendingSaves);
    window.addEventListener('pagehide', flushAllPendingSaves);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) flushAllPendingSaves();
    });
  }

  function persistFolders() {
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders.value));
    } catch (e) {
      console.error('Folders save error:', e);
    }
  }

  watch(folders, persistFolders, { deep: true });

  const counts = computed(() => {
    let total = 0;
    let favorites = 0;
    let trash = 0;
    const folderCounts = {};
    folders.value.forEach(f => {
      folderCounts[f.id] = 0;
    });

    for (let i = 0; i < notes.value.length; i++) {
      const n = notes.value[i];
      if (n.isTrash) {
        trash++;
      } else {
        total++;
        if (n.isFavorite) favorites++;
        if (n.folderId && folderCounts[n.folderId] !== undefined) {
          folderCounts[n.folderId]++;
        }
      }
    }

    return { total, favorites, trash, folderCounts };
  });

  const allTags = computed(() => {
    const set = new Set();
    notes.value.forEach(n => {
      if (!n.isTrash && Array.isArray(n.tags)) {
        n.tags.forEach(t => set.add(t));
      }
    });
    return Array.from(set).sort();
  });

  const filteredNotes = computed(() => {
    let list = notes.value;

    if (activeCategory.value === 'trash') {
      list = list.filter(n => n.isTrash);
    } else {
      list = list.filter(n => !n.isTrash);

      if (activeCategory.value === 'favorites') {
        list = list.filter(n => n.isFavorite);
      } else if (activeCategory.value.startsWith('tag_')) {
        const tag = activeCategory.value.replace('tag_', '');
        list = list.filter(n => Array.isArray(n.tags) && n.tags.includes(tag));
      } else if (activeCategory.value.startsWith('folder_')) {
        const fId = activeCategory.value.replace('folder_', '');
        list = list.filter(n => n.folderId === fId);
      }
    }

    const q = debouncedSearchQuery.value;
    if (q) {
      list = list.filter(n => {
        if (n.title && n.title.toLowerCase().includes(q)) return true;
        if (Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes(q))) return true;
        if (n.pages && n.pages.some(p => (p.searchText !== undefined ? p.searchText : stripHtmlToText(p.content).toLowerCase()).includes(q))) {
          return true;
        }
        return false;
      });
    }

    return [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  });

  const currentPalette = computed(() => {
    return isDarkMode.value ? DARK_PASTEL_COLORS : LIGHT_PASTEL_COLORS;
  });

  function createNewNote(folderId = null) {
    let initialFolder = folderId;
    if (!initialFolder && activeCategory.value.startsWith('folder_')) {
      initialFolder = activeCategory.value.replace('folder_', '');
    }

    const coverOptions = ['marble-rose', 'pastel-sunset', 'marble-mint', 'linen-cream', 'leather-brown', 'spiral-kraft', 'linen-navy'];
    const chosenCover = coverOptions[notes.value.length % coverOptions.length];

    const defaultPaperType = settings.value.defaultPaperType || 'lined';
    const defaultPaperColor = settings.value.defaultPaperColor || 'cream';
    const defaultPaperSize = settings.value.defaultPaperSize || 'a4';
    const isA3OrCanvas = defaultPaperSize === 'a3' || defaultPaperSize === 'canvas';

    const newNote = normalizeNote({
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: '',
      content: '',
      paperSize: defaultPaperSize,
      paperType: defaultPaperType,
      paperColor: defaultPaperColor,
      coverStyle: chosenCover,
      align: 'left',
      fontFamily: settings.value.defaultFontFamily || 'Plus Jakarta Sans',
      fontSize: 18,
      isDoublePage: isA3OrCanvas ? false : !!settings.value.defaultBookMode,
      pages: [
        {
          id: `page_${Date.now()}_1`,
          pageNumber: 1,
          paperType: defaultPaperType,
          paperColor: defaultPaperColor,
          content: '',
          excerpt: '',
          searchText: '',
          _cachedRawLen: 0,
          drawings: null,
          images: [],
          stickies: [],
          tapes: []
        }
      ],
      drawings: null,
      images: [],
      attachments: [],
      stickies: [],
      tapes: [],
      todos: [],
      voiceMemos: [],
      indexTabs: [
        { id: 'tab_default', title: 'Genel', color: '#8B5CF6', targetY: 0 }
      ],
      tags: [],
      isLocked: false,
      pin: null,
      folderId: initialFolder,
      isFavorite: false,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    notes.value.unshift(newNote);
    currentEditingNote.value = newNote;
    scheduleSaveNote(newNote, true);
    return newNote;
  }

  function openNote(note) {
    currentEditingNote.value = note;
  }

  function closeEditor() {
    flushAllPendingSaves();
    currentEditingNote.value = null;
  }

  function updateCurrentNote(updates, targetId = null) {
    const id = targetId || updates?.id || currentEditingNote.value?.id;
    if (!id) return;
    const idx = notes.value.findIndex(n => n.id === id);
    if (idx !== -1) {
      const merged = {
        ...notes.value[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      if (Array.isArray(merged.pages)) {
        const fbType = merged.paperType || 'lined';
        const fbColor = merged.paperColor || 'cream';
        merged.pages = merged.pages.map((p, pIdx) => enrichPageCache(p, fbType, fbColor, pIdx + 1));
      }
      merged.meta = computeNoteMeta(merged);
      notes.value[idx] = merged;
      if (currentEditingNote.value && currentEditingNote.value.id === id) {
        currentEditingNote.value = merged;
      }
      // Immediate persistence to IndexedDB and LocalStorage - zero risk of lost work
      scheduleSaveNote(merged, true);
    }
  }

  function setNoteCover(id, coverStyle) {
    const note = notes.value.find(n => n.id === id);
    if (note) {
      note.coverStyle = coverStyle;
      note.updatedAt = new Date().toISOString();
      if (currentEditingNote.value?.id === id) {
        currentEditingNote.value.coverStyle = coverStyle;
      }
      scheduleSaveNote(note, true);
    }
  }

  function toggleFavorite(id, event) {
    if (event) event.stopPropagation();
    const note = notes.value.find(n => n.id === id);
    if (note) {
      note.isFavorite = !note.isFavorite;
      note.updatedAt = new Date().toISOString();
      scheduleSaveNote(note, true);
    }
  }

  function moveToTrash(id, event) {
    if (event) event.stopPropagation();
    const note = notes.value.find(n => n.id === id);
    if (note) {
      note.isTrash = true;
      note.updatedAt = new Date().toISOString();
      if (currentEditingNote.value?.id === id) {
        currentEditingNote.value = null;
      }
      scheduleSaveNote(note, true);
    }
  }

  function restoreFromTrash(id, event) {
    if (event) event.stopPropagation();
    const note = notes.value.find(n => n.id === id);
    if (note) {
      note.isTrash = false;
      note.updatedAt = new Date().toISOString();
      scheduleSaveNote(note, true);
    }
  }

  function deletePermanently(id, event) {
    if (event) event.stopPropagation();
    notes.value = notes.value.filter(n => n.id !== id);
    if (currentEditingNote.value?.id === id) {
      currentEditingNote.value = null;
    }
    deleteNoteFromDB(id);
    tryBestEffortLocalBackup();
  }

  function emptyTrash() {
    const trashIds = notes.value.filter(n => n.isTrash).map(n => n.id);
    notes.value = notes.value.filter(n => !n.isTrash);
    if (trashIds.length > 0) {
      deleteMultipleNotesFromDB(trashIds);
      tryBestEffortLocalBackup();
    }
  }

  function addFolder(name, color = '#8B5CF6') {
    if (!name.trim()) return;
    const newF = {
      id: `f_${Date.now()}`,
      name: name.trim(),
      color: color || '#8B5CF6',
      icon: 'Folder'
    };
    folders.value.push(newF);
    persistFolders();
    return newF;
  }

  function deleteFolder(id) {
    const modifiedNotes = [];
    notes.value.forEach(n => {
      if (n.folderId === id) {
        n.folderId = null;
        modifiedNotes.push(n);
      }
    });
    folders.value = folders.value.filter(f => f.id !== id);
    if (activeCategory.value === `folder_${id}`) {
      activeCategory.value = 'all';
    }
    if (modifiedNotes.length > 0) {
      saveMultipleNotesToDB(modifiedNotes);
      tryBestEffortLocalBackup();
    }
  }

  function exportBackup() {
    const backupData = {
      version: '4.0-lumina',
      exportedAt: new Date().toISOString(),
      notes: notes.value,
      folders: folders.value,
      settings: settings.value
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PastelNote_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.notes)) {
        const normalized = data.notes.map(n => normalizeNote(n));
        notes.value = normalized;
        if (Array.isArray(data.folders)) {
          folders.value = data.folders;
        }
        replaceAllNotesInDB(normalized);
        tryBestEffortLocalBackup();
        persistFolders();
        return { success: true, count: normalized.length };
      }
    } catch (e) {
      console.error('Backup import error:', e);
    }
    return { success: false };
  }

  return {
    isDarkMode,
    viewMode,
    setViewMode,
    toggleDarkMode,
    currentPalette,
    notes,
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
  };
}
