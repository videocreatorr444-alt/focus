
import { Task, VaultItem, User } from '../types';

const DB_NAME = 'FocusFlowDB';
const DB_VERSION = 1;
const STORES = {
  TASKS: 'tasks',
  VAULT: 'vault',
  USER: 'user'
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        taskStore.createIndex('projectId', 'projectId', { unique: false });
        taskStore.createIndex('completed', 'completed', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.VAULT)) db.createObjectStore(STORES.VAULT, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORES.USER)) db.createObjectStore(STORES.USER, { keyPath: 'email' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveToStore = async (storeName: string, data: any) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const getAllFromStore = async (storeName: string): Promise<any[]> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

export const removeFromStore = async (storeName: string, id: string) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

/**
 * For 1M+ users, replace this with a real API call (Firebase/Supabase).
 * We use requestIdleCallback to sync without blocking the UI.
 */
export const syncToCloud = async (userEmail: string, data: any) => {
  const syncAction = () => {
    console.log(`[Scalability] Background sync for ${userEmail}...`);
    localStorage.setItem(`cloud_backup_${userEmail}`, JSON.stringify({
      ...data,
      lastSynced: new Date().toISOString()
    }));
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(syncAction);
  } else {
    setTimeout(syncAction, 1000);
  }
  return true;
};

export const restoreFromCloud = async (userEmail: string) => {
  const backup = localStorage.getItem(`cloud_backup_${userEmail}`);
  if (backup) {
    return JSON.parse(backup);
  }
  return null;
};
