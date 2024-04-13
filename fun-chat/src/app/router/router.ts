import type SessionStorage from '../utils/session-storage';
import Page from './pages';

export type Route = {
  path: Page;
  handleRouteChange: () => void;
};

export default class Router {
  private validRoutes: Route[];

  private storage: SessionStorage;

  constructor(routes: Route[], storage: SessionStorage) {
    this.validRoutes = routes;
    this.storage = storage;

    window.addEventListener('hashchange', this.navigate);
    document.addEventListener('DOMContentLoaded', this.navigate);
  }

  public navigate = (url: Event | string): void => {
    if (typeof url === 'string') {
      window.location.hash = url;
    }

    const urlHashFragment = window.location.hash.slice(1);

    this.urlChangeHandler(urlHashFragment);
  };

  private urlChangeHandler(newUrl: string): void {
    const validRoute = this.validRoutes.find((route) => String(route.path) === newUrl);

    if (
      !validRoute ||
      validRoute.path === Page.EMPTY ||
      (validRoute.path === Page.CHAT && !this.storage.getAuthData())
    ) {
      window.location.hash = `#${Page.LOGIN}`;

      return;
    }

    if (validRoute.path === Page.LOGIN && this.storage.getAuthData()) {
      window.location.hash = `#${Page.CHAT}`;

      return;
    }

    validRoute.handleRouteChange();
  }
}
