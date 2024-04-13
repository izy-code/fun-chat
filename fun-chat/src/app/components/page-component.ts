import BaseComponent from './base-component';
import type Router from '@/app/router/router';
import type SessionStorage from '@/app/utils/session-storage';

export default class PageComponent extends BaseComponent {
  protected router: Router;

  protected storage: SessionStorage;

  constructor(router: Router, storage: SessionStorage) {
    super({ className: 'app-container__page' });

    this.router = router;
    this.storage = storage;
  }
}
