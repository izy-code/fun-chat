import type { User } from '../interfaces';

const APP_KEY = 'izy-fun-chat';
const AUTH_DATA_KEY = 'authData';

export default class SessionStorage {
  private dataMap: Map<string, unknown>;

  constructor() {
    this.dataMap = new Map();
    this.getData();
  }

  public getAuthData(): User | null {
    return this.getField<User>(AUTH_DATA_KEY);
  }

  public setAuthData(authData: User): void {
    this.setField(AUTH_DATA_KEY, authData);
  }

  public clearAppData(): void {
    this.dataMap = new Map();
    sessionStorage.removeItem(APP_KEY);
  }

  private getField<T>(key: string): T | null {
    if (sessionStorage.getItem(APP_KEY) && this.dataMap.has(key)) {
      return this.dataMap.get(key) as T;
    }

    return null;
  }

  private setField(key: string, value: unknown): void {
    this.dataMap.set(key, value);
    this.saveData();
  }

  private deleteField(key: string): void {
    this.dataMap.delete(key);
    this.saveData();
  }

  private getData(): void {
    const storageString = sessionStorage.getItem(APP_KEY);

    if (storageString) {
      const storageObject = JSON.parse(storageString) as unknown;

      if (!(storageObject instanceof Object)) {
        throw new TypeError('Invalid storage object type');
      }

      this.dataMap = new Map(Object.entries(storageObject));
    }
  }

  private saveData(): void {
    const dataObject = Object.fromEntries(this.dataMap.entries());

    sessionStorage.setItem(APP_KEY, JSON.stringify(dataObject));
  }
}
