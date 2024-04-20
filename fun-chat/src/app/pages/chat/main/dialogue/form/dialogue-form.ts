import BaseComponent from '@/app/components/base-component';

export default class DialogueFormComponent extends BaseComponent<HTMLFormElement> {
  constructor() {
    super({ className: 'dialogue__form', tag: 'form' });
  }
}
