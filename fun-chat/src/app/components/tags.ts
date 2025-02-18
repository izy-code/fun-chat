import BaseComponent, { type TagProps, type ChildrenType } from './base-component';

export const header = (props: TagProps, ...children: ChildrenType[]): BaseComponent =>
  new BaseComponent({ ...props, tag: 'header' }, ...children);

export const main = (props: TagProps, ...children: ChildrenType[]): BaseComponent =>
  new BaseComponent({ ...props, tag: 'main' }, ...children);

export const nav = (props: TagProps, ...children: ChildrenType[]): BaseComponent =>
  new BaseComponent({ ...props, tag: 'nav' }, ...children);

export const div = (props: TagProps<HTMLDivElement>, ...children: ChildrenType[]): BaseComponent<HTMLDivElement> =>
  new BaseComponent(props, ...children);

export const section = (props: TagProps, ...children: ChildrenType[]): BaseComponent =>
  new BaseComponent({ ...props, tag: 'section' }, ...children);

export const p = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLParagraphElement> =>
  new BaseComponent({ ...props, tag: 'p' }, ...children);

export const span = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLSpanElement> =>
  new BaseComponent({ ...props, tag: 'span' }, ...children);

export const label = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLLabelElement> =>
  new BaseComponent({ ...props, tag: 'label' }, ...children);

export const input = (props: TagProps<HTMLInputElement>): BaseComponent<HTMLInputElement> =>
  new BaseComponent({ ...props, tag: 'input' });

export const h1 = (className: string, textContent: string): BaseComponent<HTMLHeadingElement> =>
  new BaseComponent({ tag: 'h1', className, textContent });

export const h2 = (className: string, textContent: string): BaseComponent<HTMLHeadingElement> =>
  new BaseComponent({ tag: 'h2', className, textContent });

export const h3 = (className: string, textContent: string): BaseComponent<HTMLHeadingElement> =>
  new BaseComponent({ tag: 'h3', className, textContent });

export const a = (props: TagProps<HTMLLinkElement>, ...children: ChildrenType[]): BaseComponent<HTMLLinkElement> =>
  new BaseComponent({ ...props, tag: 'a' }, ...children);

export const img = ({ className = '', src = '', alt = '' }): BaseComponent<HTMLImageElement> =>
  new BaseComponent({
    tag: 'img',
    className,
    src,
    alt,
  });

export const form = (
  { className = '', method = 'get', action = '' },
  ...children: ChildrenType[]
): BaseComponent<HTMLFormElement> =>
  new BaseComponent(
    {
      tag: 'form',
      className,
      method,
      action,
    },
    ...children,
  );

export const thead = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLTableSectionElement> =>
  new BaseComponent({ ...props, tag: 'thead' }, ...children);

export const tbody = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLTableSectionElement> =>
  new BaseComponent({ ...props, tag: 'tbody' }, ...children);

export const tr = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLTableRowElement> =>
  new BaseComponent({ ...props, tag: 'tr' }, ...children);

export const th = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLTableCellElement> =>
  new BaseComponent({ ...props, tag: 'th' }, ...children);

export const td = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLTableCellElement> =>
  new BaseComponent({ ...props, tag: 'td' }, ...children);

export const ul = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLUListElement> =>
  new BaseComponent({ ...props, tag: 'ul' }, ...children);

export const li = (props: TagProps, ...children: ChildrenType[]): BaseComponent<HTMLLIElement> =>
  new BaseComponent({ ...props, tag: 'li' }, ...children);
