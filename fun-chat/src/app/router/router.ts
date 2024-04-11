import { Page } from './pages';

export type Route = {
  path: Page;
  handleRouteChange: () => void;
};

export default class Router {
  private validRoutes: Route[];

  constructor(routes: Route[]) {
    this.validRoutes = routes;

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

    if (!validRoute) {
      this.redirectToGaragePage();

      return;
    }

    validRoute.handleRouteChange();
  }

  private redirectToGaragePage(): void {
    const garagePageRoute = this.validRoutes.find((route) => route.path === Page.GARAGE);

    if (garagePageRoute) {
      this.navigate(garagePageRoute.path);
    }
  }
}
