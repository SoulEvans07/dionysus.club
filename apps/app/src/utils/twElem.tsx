import React, { type JSX } from 'react';
import { cn } from './classnames';

type HTMLTag = keyof JSX.IntrinsicElements;

const supportedTags = [
  'a',
  'button',
  'div',
  'span',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'nav',
] satisfies HTMLTag[];
type SupportedTag = (typeof supportedTags)[number];

function twElem<T extends SupportedTag>(
  tag: T,
  className: string,
  style?: React.CSSProperties
): React.FC<JSX.IntrinsicElements[T]> {
  const Element: React.FC<JSX.IntrinsicElements[T]> = (props) => {
    return React.createElement(tag, {
      ...props,
      className: cn(className, props.className),
      style: { ...props.style, ...style },
    });
  };
  Element.displayName = tag;

  return Element;
}

function twComp<P extends { className?: string; style?: React.CSSProperties }>(
  comp: React.FC<P>,
  className: string,
  style?: React.CSSProperties
): React.FC<P> {
  const Element: React.FC<P> = (props) => {
    return React.createElement(comp, {
      ...props,
      className: cn(className, props.className),
      style: { ...props.style, ...style },
    });
  };
  Element.displayName = comp.displayName;

  return Element;
}

type TwElemCollection = {
  [tag in SupportedTag]: (className: string, style?: React.CSSProperties) => ReturnType<typeof twElem<tag>>;
} & { comp: typeof twComp };

export const tw = supportedTags.reduce(
  (acc, curr) => ({
    ...acc,
    [curr]: (className: string, style?: React.CSSProperties) => twElem(curr, className, style),
  }),
  { comp: twComp } as TwElemCollection
);
