import BaseComponent from '@/app/components/base-component';
import { a, p } from '@/app/components/tags';
import svgPath from '@/assets/icons/rs-school-js.svg';

export default class ChatFooterComponent extends BaseComponent {
  private rssLink: BaseComponent<HTMLLinkElement>;

  constructor() {
    super({ className: 'chat-page__footer', tag: 'footer' });

    const year = p({ className: 'chat-page__year', textContent: '2024' });
    const githubLink = a({
      className: 'chat-page__git-link',
      href: 'https://github.com/izy-code',
      textContent: 'izy-code',
      target: '_blank',
    });

    this.rssLink = a({
      className: 'chat-page__rss-link',
      href: 'https://rs.school',
      target: '_blank',
    });

    this.appendSvgNode();
    this.appendChildren([year, githubLink, this.rssLink]);
  }

  private appendSvgNode(): void {
    const useNode = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    useNode.classList.add('chat-page__rss-link-use');
    svgNode.classList.add('chat-page__rss-link-svg');

    useNode.setAttribute('href', `${svgPath}#icon`);
    useNode.setAttribute('aria-hidden', 'true');

    svgNode.setAttribute('width', '100px');
    svgNode.setAttribute('height', '30px');
    svgNode.setAttribute('role', 'img');
    svgNode.setAttribute('aria-label', 'RS School Logo');

    svgNode.append(useNode);

    this.rssLink.getNode().append(svgNode);
  }
}
