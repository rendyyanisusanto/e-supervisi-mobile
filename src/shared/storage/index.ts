import { Preferences } from '@capacitor/preferences';

export class StorageService {
  static async set(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await Preferences.set({ key, value: stringValue });
  }

  static async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  static async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  static async clear(): Promise<void> {
    await Preferences.clear();
  }
}
