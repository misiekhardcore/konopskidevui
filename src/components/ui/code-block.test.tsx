import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockCopyButton,
  CodeBlockContent,
} from './code-block';

describe('CodeBlock', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>example.ts</CodeBlockTitle>
        </CodeBlockHeader>
        <CodeBlockContent>{`const answer = 42;`}</CodeBlockContent>
      </CodeBlock>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>example.ts</CodeBlockTitle>
        </CodeBlockHeader>
        <CodeBlockContent>{`const answer = 42;`}</CodeBlockContent>
      </CodeBlock>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders the code it is given', async () => {
    render(
      <CodeBlock>
        <CodeBlockContent>{`const answer = 42;`}</CodeBlockContent>
      </CodeBlock>,
    );

    expect(await screen.findByText(/answer/)).toBeInTheDocument();
  });

  it('copies its value to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockCopyButton value="const answer = 42;" />
        </CodeBlockHeader>
        <CodeBlockContent>{`const answer = 42;`}</CodeBlockContent>
      </CodeBlock>,
    );

    await userEvent.click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith('const answer = 42;');
  });
});
