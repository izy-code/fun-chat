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

    if (!validRoute || (validRoute.path === Page.CHAT && !this.storage.getAuthData())) {
      this.redirectToPage(Page.LOGIN);

      return;
    }

    if ([Page.EMPTY, Page.LOGIN].includes(validRoute.path) && this.storage.getAuthData()) {
      this.redirectToPage(Page.CHAT);

      return;
    }

    validRoute.handleRouteChange();
  }

  private redirectToPage(pagePath: Page): void {
    const pageRoute = this.validRoutes.find((route) => route.path === pagePath);

    if (pageRoute) {
      this.navigate(pageRoute.path);
    }
  }
}
