import SessionStorage from '../common/session-storage';
import Page from './pages';

export default class Router {
  private handleRouteChange: (page: Page) => void;

  constructor(handleRouteChange: (page: Page) => void) {
    this.handleRouteChange = handleRouteChange;

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
    const validPath = Object.values(Page).find((page) => page.toString() === newUrl);

    if (!validPath || (validPath === Page.CHAT && !SessionStorage.getAuthData())) {
      window.location.hash = `#${Page.LOGIN}`;

      return;
    }

    if (validPath === Page.LOGIN && SessionStorage.getAuthData()) {
      window.location.hash = `#${Page.CHAT}`;

      return;
    }

    this.handleRouteChange(validPath);
  }
}
