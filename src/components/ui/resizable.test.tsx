import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';

describe('Resizable', () => {
  it('renders both panels and the splitter', async () => {
    render(
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={50}>Editor</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>Preview</ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('draws the grip only when asked', () => {
    const gripCount = () => screen.getByRole('separator')?.querySelectorAll('div').length;

    const { rerender } = render(
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={50}>Editor</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>Preview</ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(gripCount()).toBe(0);

    rerender(
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={50}>Editor</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>Preview</ResizablePanel>
      </ResizablePanelGroup>,
    );

    expect(gripCount()).toBe(1);
  });
});
