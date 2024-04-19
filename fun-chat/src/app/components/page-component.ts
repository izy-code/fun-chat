import BaseComponent from './base-component';
import type Router from '@/app/router/router';

export default class PageComponent extends BaseComponent {
  protected router: Router;

  constructor(router: Router) {
    super({ className: 'app-container__page' });

    this.router = router;
  }
}
