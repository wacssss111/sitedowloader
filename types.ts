
export interface Category {
  id: string;
  name: string;
  icon: string; // FontAwesome class suffix (e.g., 'database')
}

export interface SoftwareItem {
  id: string;
  title: string;
  fileName?: string;
  description: string;
  categoryId: string;
  version: string;
  size: string;
  downloadUrl: string;
  downloads: number;
  createdAt: number;
  isTelegramImport: boolean;
  isSecureLink?: boolean;
  secureLinkUrl?: string;
  tags: string[];
}

export interface TelegramConfig {
  botToken: string;
  adminIds: string[];
  botName: string;
}

export type ViewState = 'home' | 'admin';

export type ThemeMode = 'dark' | 'light' | 'black';

export interface AdminState {
  isAuthenticated: boolean;
  token: string | null;
}
