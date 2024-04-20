import './chat-dialogue.scss';
import BaseComponent from '@/app/components/base-component';
import DialogueHeaderComponent from './header/dialogue-header';
import DialogueContentComponent from './content/dialogue-content';
import DialogueFormComponent from './form/dialogue-form';

export default class ChatDialogueComponent extends BaseComponent {
  constructor() {
    super({ className: 'chat-page__dialogue dialogue', tag: 'section' });

    const header = new DialogueHeaderComponent();
    const content = new DialogueContentComponent();
    const form = new DialogueFormComponent();

    this.appendChildren([header, content, form]);
  }
}
