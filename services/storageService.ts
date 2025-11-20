
import { SoftwareItem, Category, TelegramConfig } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_ITEMS = 'softvault_items_v2';
const STORAGE_KEY_CATS = 'softvault_categories_v2';
const STORAGE_KEY_TG = 'softvault_tg_config_v1';
const ADMIN_KEY_HASH = '12345';

// Seed Categories
const SEED_CATEGORIES: Category[] = [
  { id: 'cat_softs', name: 'Software', icon: 'compact-disc' },
  { id: 'cat_db', name: 'Databases', icon: 'database' },
  { id: 'cat_scripts', name: 'Scripts', icon: 'code' },
  { id: 'cat_configs', name: 'Configs', icon: 'sliders' },
];

// Seed Items
const SEED_DATA: SoftwareItem[] = [
  {
    id: '1',
    title: 'DevToolkit Pro',
    fileName: 'devkit_pro_v2.4.0.exe',
    description: 'All-in-one developer utility belt for debugging and compilation.',
    categoryId: 'cat_softs',
    version: '2.4.0',
    size: '145 MB',
    downloadUrl: '#',
    downloads: 1240,
    createdAt: Date.now() - 10000000,
    isTelegramImport: false,
    tags: ['Utility', 'Dev']
  },
  {
    id: '2',
    title: 'LeakCheck DB 2024',
    fileName: 'leak_check_2024_dump.sql.gz',
    description: 'Sample database for vulnerability testing purposes only.',
    categoryId: 'cat_db',
    version: '1.0.0',
    size: '450 MB',
    downloadUrl: '#',
    downloads: 850,
    createdAt: Date.now() - 5000000,
    isTelegramImport: true,
    tags: ['SQL', 'Data']
  }
];

// Seed Telegram Config
const SEED_TG_CONFIG: TelegramConfig = {
  botToken: '8556897542:AAFxIbAG-nYJxnWzi1XS_StRT51gqprBIWo',
  adminIds: ['7808015273', '1337704966'],
  botName: 'FeitovManagerBot'
};

// --- CATEGORIES ---

export const getCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error && data && data.length > 0) return data;
    if (data && data.length === 0) {
        // Init seed if empty
        await Promise.all(SEED_CATEGORIES.map(c => supabase.from('categories').insert(c)));
        return SEED_CATEGORIES;
    }
  }

  // Fallback LocalStorage
  const stored = localStorage.getItem(STORAGE_KEY_CATS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(SEED_CATEGORIES));
    return SEED_CATEGORIES;
  }
  return JSON.parse(stored);
};

export const addCategory = async (cat: Category): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('categories').insert(cat);
    return;
  }
  // Local
  const current = JSON.parse(localStorage.getItem(STORAGE_KEY_CATS) || JSON.stringify(SEED_CATEGORIES));
  const updated = [...current, cat];
  localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(updated));
};

export const deleteCategory = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('categories').delete().eq('id', id);
    return;
  }
  // Local
  const current = JSON.parse(localStorage.getItem(STORAGE_KEY_CATS) || '[]');
  const updated = current.filter((c: Category) => c.id !== id);
  localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(updated));
};

// --- SOFTWARE ---

export const getSoftwareList = async (): Promise<SoftwareItem[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    
    if (error) console.error("Supabase Error:", error);

    if (!error && data) {
        // Transform snake_case from DB to camelCase for app
        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            fileName: item.file_name,
            description: item.description,
            categoryId: item.category_id,
            version: item.version,
            size: item.size,
            downloadUrl: '#', // DB doesn't store this dynamic mock
            downloads: Number(item.downloads),
            createdAt: Number(item.created_at),
            isTelegramImport: item.is_telegram_import,
            isSecureLink: item.is_secure_link,
            secureLinkUrl: item.secure_link_url,
            tags: item.tags || []
        }));
    }
  }

  // Fallback LocalStorage
  const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const addSoftware = async (item: SoftwareItem): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    // Transform camelCase to snake_case for DB
    const dbItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        category_id: item.categoryId,
        version: item.version,
        size: item.size,
        downloads: item.downloads,
        created_at: item.createdAt,
        is_telegram_import: item.isTelegramImport,
        tags: item.tags,
        file_name: item.fileName,
        is_secure_link: item.isSecureLink,
        secure_link_url: item.secureLinkUrl
    };
    const { error } = await supabase.from('items').insert(dbItem);
    if (error) console.error("Supabase Insert Error:", error);
    return;
  }

  // Local
  const current = await getSoftwareList(); // This actually calls local in fallback mode
  const updated = [item, ...current];
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
};

export const deleteSoftware = async (id: string): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('items').delete().eq('id', id);
    return;
  }

  // Local
  const current = await getSoftwareList();
  const updated = current.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
};

export const updateSoftware = async (updatedItem: SoftwareItem): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
     const dbItem = {
        title: updatedItem.title,
        description: updatedItem.description,
        category_id: updatedItem.categoryId,
        version: updatedItem.version,
        size: updatedItem.size,
        downloads: updatedItem.downloads,
        is_telegram_import: updatedItem.isTelegramImport,
        tags: updatedItem.tags,
        file_name: updatedItem.fileName,
        is_secure_link: updatedItem.isSecureLink,
        secure_link_url: updatedItem.secureLinkUrl
    };
    await supabase.from('items').update(dbItem).eq('id', updatedItem.id);
    return;
  }

  // Local
  const current = await getSoftwareList();
  const index = current.findIndex(i => i.id === updatedItem.id);
  if (index !== -1) {
    current[index] = updatedItem;
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(current));
  }
};

// --- CONFIGS ---

export const getTelegramConfig = (): TelegramConfig => {
  const stored = localStorage.getItem(STORAGE_KEY_TG);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_TG, JSON.stringify(SEED_TG_CONFIG));
    return SEED_TG_CONFIG;
  }
  return JSON.parse(stored);
};

export const verifyAdminKey = (key: string): boolean => {
  return key === ADMIN_KEY_HASH; 
};
