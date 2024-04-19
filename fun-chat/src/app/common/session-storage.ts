import type { User } from '../interfaces';

const APP_KEY = 'izy-fun-chat';
const AUTH_DATA_KEY = 'authData';

export default class SessionStorage {
  private static dataMap: Map<string, unknown> = new Map();

  public static getAuthData(): User | null {
    return this.getField<User>(AUTH_DATA_KEY);
  }

  public static setAuthData(authData: User): void {
    this.setField(AUTH_DATA_KEY, authData);
  }

  public static clearAppData(): void {
    this.dataMap = new Map();
    sessionStorage.removeItem(APP_KEY);
  }

  private static getField<T>(key: string): T | null {
    if (sessionStorage.getItem(APP_KEY) && this.dataMap.has(key)) {
      return this.dataMap.get(key) as T;
    }

    return null;
  }

  private static setField(key: string, value: unknown): void {
    this.dataMap.set(key, value);
    this.saveData();
  }

  private static deleteField(key: string): void {
    this.dataMap.delete(key);
    this.saveData();
  }

  public static getData(): void {
    const storageString = sessionStorage.getItem(APP_KEY);

    if (storageString) {
      const storageObject = JSON.parse(storageString) as unknown;

      if (!(storageObject instanceof Object)) {
        throw new TypeError('Invalid storage object type');
      }

      this.dataMap = new Map(Object.entries(storageObject));
    }
  }

  private static saveData(): void {
    const dataObject = Object.fromEntries(this.dataMap.entries());

    sessionStorage.setItem(APP_KEY, JSON.stringify(dataObject));
  }
}

SessionStorage.getData();
