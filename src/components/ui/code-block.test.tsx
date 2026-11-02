import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CodeBlock, CodeBlockHeader, CodeBlockCopyButton, CodeBlockContent } from './code-block';

describe('CodeBlock', () => {
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

  it('numbers the lines when `lineNumbers` is set', () => {
    const { container } = render(
      <CodeBlock>
        <CodeBlockContent lineNumbers>{`const a = 1;\nconst b = 2;`}</CodeBlockContent>
      </CodeBlock>,
    );

    expect(container.querySelector('[data-slot="code-block-content"]')).toHaveAttribute(
      'data-numbered',
      'true',
    );
  });
});
