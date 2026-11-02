import { toRaw } from 'vue';

const DB_NAME = 'PastelNoteLuminaDB';
const DB_VERSION = 1;
const STORE_NOTES = 'notes';

let dbPromise = null;

/**
 * Deeply unwraps Vue 3 reactive Proxy objects into plain JS objects
 * suitable for structured cloning in IndexedDB without JSON.stringify overhead.
 */
function deepUnwrap(val) {
  if (val === null || typeof val !== 'object') return val;
  const raw = toRaw(val);
  if (Array.isArray(raw)) {
    const arr = new Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      arr[i] = deepUnwrap(raw[i]);
    }
    return arr;
  }
  const out = {};
  const keys = Object.keys(raw);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    out[k] = deepUnwrap(raw[k]);
  }
  return out;
}

export function openLuminaDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => {
      console.warn('IndexedDB open error:', e.target.error);
      resolve(null);
    };
  });

  return dbPromise;
}

export async function loadAllNotesFromDB() {
  const db = await openLuminaDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NOTES, 'readonly');
      const store = tx.objectStore(STORE_NOTES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(null);
    } catch (err) {
      resolve(null);
    }
  });
}

export async function saveSingleNoteToDB(note) {
  if (!note || !note.id) return;
  const db = await openLuminaDB();
  if (!db) return;

  const plainNote = deepUnwrap(note);
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NOTES, 'readwrite');
      const store = tx.objectStore(STORE_NOTES);
      store.put(plainNote);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (err) {
      resolve(false);
    }
  });
}

export async function saveMultipleNotesToDB(notesList) {
  if (!Array.isArray(notesList)) return;
  const db = await openLuminaDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NOTES, 'readwrite');
      const store = tx.objectStore(STORE_NOTES);
      for (let i = 0; i < notesList.length; i++) {
        if (notesList[i]?.id) {
          store.put(deepUnwrap(notesList[i]));
        }
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (err) {
      resolve(false);
    }
  });
}

export async function deleteNoteFromDB(noteId) {
  if (!noteId) return;
  const db = await openLuminaDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NOTES, 'readwrite');
      const store = tx.objectStore(STORE_NOTES);
      store.delete(noteId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (err) {
      resolve(false);
    }
  });
}

export async function deleteMultipleNotesFromDB(noteIds) {
  if (!Array.isArray(noteIds) || !noteIds.length) return;
  const db = await openLuminaDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NOTES, 'readwrite');
      const store = tx.objectStore(STORE_NOTES);
      for (let i = 0; i < noteIds.length; i++) {
        store.delete(noteIds[i]);
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (err) {
      resolve(false);
    }
  });
}

export async function replaceAllNotesInDB(notesList) {
  const db = await openLuminaDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NOTES, 'readwrite');
      const store = tx.objectStore(STORE_NOTES);
      store.clear();
      for (let i = 0; i < notesList.length; i++) {
        if (notesList[i]?.id) {
          store.put(deepUnwrap(notesList[i]));
        }
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (err) {
      resolve(false);
    }
  });
}
