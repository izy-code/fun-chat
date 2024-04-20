import BaseComponent from '@/app/components/base-component';

export default class DialogueContentComponent extends BaseComponent<HTMLDivElement> {
  constructor() {
    super({ className: 'dialogue__content', tag: 'div' });
  }
}
