import './app.scss';
import type BaseComponent from './components/base-component';
import Router, { type Route } from './router/router';
import Page from './router/pages';
import { div } from './components/tags';
import SessionStorage from './utils/session-storage';
import type PageComponent from './components/page-component';

const COMPONENT_RENEWAL_TRANSITION_TIME_MS = 600;
const OPACITY_TRANSITION_TIME_MS = 700;

export default class App {
  private container: BaseComponent;

  private storage: SessionStorage;

  private router: Router;

  constructor() {
    this.container = div({ className: 'app-container' });
    this.storage = new SessionStorage();
    this.router = new Router(this.createRoutes(), this.storage);
  }

  public start(): void {
    document.body.append(this.container.getNode());
  }

  private createRoutes = (): Route[] => [
    {
      path: Page.EMPTY,
      handleRouteChange: () => this.handleSwitchToPage(() => import(`@/app/pages/login/login-page`)),
    },
    {
      path: Page.LOGIN,
      handleRouteChange: () => this.handleSwitchToPage(() => import(`@/app/pages/login/login-page`)),
    },
    {
      path: Page.ABOUT,
      handleRouteChange: () => this.handleSwitchToPage(() => import('@/app/pages/about/about-page')),
    },
    {
      path: Page.CHAT,
      handleRouteChange: () => this.handleSwitchToPage(() => import('@/app/pages/chat/chat-page')),
    },
  ];

  private handleSwitchToPage = (importModule: () => Promise<unknown>): void => {
    importModule()
      .then((importedModule) => {
        const { default: PageClass } = importedModule as {
          default: new (router: Router, storage: SessionStorage) => PageComponent;
        };

        this.setPage(new PageClass(this.router, this.storage));
      })
      .catch((error) => {
        throw new Error(`Failed to load page module: ${error}`);
      });
  };

  private setPage(pageComponent: PageComponent): void {
    this.container.removeClass('app-container--opaque');

    setTimeout(() => {
      this.container.removeChildren();
      this.container.append(pageComponent);
    }, COMPONENT_RENEWAL_TRANSITION_TIME_MS);

    setTimeout(() => {
      this.container.addClass('app-container--opaque');
    }, OPACITY_TRANSITION_TIME_MS);
  }
}
