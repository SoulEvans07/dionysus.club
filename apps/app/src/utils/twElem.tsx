import React, { type JSX } from 'react';
import { cn } from './classnames';

type HTMLTag = keyof JSX.IntrinsicElements;

const supportedTags = ['a', 'div', 'span', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] satisfies HTMLTag[];
type SupportedTag = (typeof supportedTags)[number];

function twElem<T extends SupportedTag>(tag: T, className: string): React.FC<JSX.IntrinsicElements[T]> {
  const Element: React.FC<JSX.IntrinsicElements[T]> = props => {
    return React.createElement(tag, { ...props, className: cn(className, props.className) });
  };
  Element.displayName = tag;

  return Element;
}

function twComp<P extends { className?: string }>(comp: React.FC<P>, className: string): React.FC<P> {
  const Element: React.FC<P> = props => {
    return React.createElement(comp, { ...props, className: cn(className, props.className) });
  };
  Element.displayName = comp.displayName;

  return Element;
}

type TwElemCollection = {
  [tag in SupportedTag]: (className: string) => ReturnType<typeof twElem<tag>>;
} & { comp: typeof twComp };

export const tw = supportedTags.reduce(
  (acc, curr) => ({ ...acc, [curr]: (className: string) => twElem(curr, className) }),
  { comp: twComp } as TwElemCollection
);
