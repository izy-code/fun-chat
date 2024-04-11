import './app.scss';
import type BaseComponent from './components/base-component';
import Router, { type Route } from './router/router';
import Page from './router/pages';
import { div } from './components/tags';
import SessionStorage from './utils/session-storage';

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
      handleRouteChange: () => this.handleSwitchToPage('@/app/pages/login/login-page'),
    },
    {
      path: Page.LOGIN,
      handleRouteChange: () => this.handleSwitchToPage('@/app/pages/login/login-page'),
    },
    {
      path: Page.ABOUT,
      handleRouteChange: () => this.handleSwitchToPage('@/app/pages/about/about-page'),
    },
    {
      path: Page.CHAT,
      handleRouteChange: () => this.handleSwitchToPage('@/app/pages/chat/chat-page'),
    },
  ];

  // private handleSwitchToLoginPage = (): void => {
  //   import('@/app/pages/login/login-page')
  //     .then(({ default: LoginPageComponent }) => {
  //       this.setPage(LoginPageComponent);
  //     })
  //     .catch((error) => {
  //       throw new Error(`Failed to load login page module: ${error}`);
  //     });
  // };

  // private handleSwitchToAboutPage = (): void => {
  //   import('@/app/pages/about/about-page')
  //     .then(({ default: AboutPageComponent }) => {
  //       this.setPage(AboutPageComponent);
  //     })
  //     .catch((error) => {
  //       throw new Error(`Failed to load about page module: ${error}`);
  //     });
  // };

  // private handleSwitchToChatPage = (): void => {
  //   import('@/app/pages/chat/chat-page')
  //     .then(({ default: ChatPageComponent }: { default: BaseComponent }) => {
  //       this.setPage(ChatPageComponent);
  //     })
  //     .catch((error) => {
  //       throw new Error(`Failed to load chat page module: ${error}`);
  //     });
  // };

  private handleSwitchToPage = (pageComponentPath: string): void => {
    import(pageComponentPath)
      .then(({ default: pageComponent }: { default: BaseComponent }) => {
        this.setPage(pageComponent);
      })
      .catch((error) => {
        throw new Error(`Failed to load page module: ${error}`);
      });
  };

  private setPage(pageComponent: BaseComponent): void {
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
