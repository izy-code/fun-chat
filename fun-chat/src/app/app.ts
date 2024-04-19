import './app.scss';
import type BaseComponent from './components/base-component';
import Router from './router/router';
import Page from './router/pages';
import { div } from './components/tags';
import type PageComponent from './components/page-component';

const COMPONENT_RENEWAL_TRANSITION_TIME_MS = 600;
const OPACITY_TRANSITION_TIME_MS = 700;

const pageImports = {
  [Page.EMPTY]: () => import('@/app/pages/login/login-page'),
  [Page.LOGIN]: () => import('@/app/pages/login/login-page'),
  [Page.ABOUT]: () => import('@/app/pages/about/about-page'),
  [Page.CHAT]: () => import('@/app/pages/chat/chat-page'),
} as const;

export default class App {
  private container: BaseComponent;

  private router: Router;

  constructor() {
    this.container = div({ className: 'app-container' });
    this.router = new Router(this.handleRouteChange);
  }

  public start(): void {
    document.body.append(this.container.getNode());
  }

  private handleRouteChange = (page: Page): void => {
    pageImports[page]()
      .then(({ default: PageComponent }) => {
        this.setPage(new PageComponent(this.router));
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
