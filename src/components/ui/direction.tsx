'use client';

import { Direction } from 'radix-ui';
import * as React from 'react';

type DirectionValue = 'ltr' | 'rtl';

type DirectionProviderProps = Omit<
  React.ComponentProps<typeof Direction.DirectionProvider>,
  'dir'
> & {
  dir?: DirectionValue;
  /** @deprecated use `dir` */
  direction?: DirectionValue;
};

function DirectionProvider({ dir, direction, children }: DirectionProviderProps) {
  return (
    <Direction.DirectionProvider dir={dir ?? direction ?? 'ltr'}>
      {children}
    </Direction.DirectionProvider>
  );
}

const useDirection = Direction.useDirection;

export { DirectionProvider, useDirection, type DirectionProviderProps, type DirectionValue };
