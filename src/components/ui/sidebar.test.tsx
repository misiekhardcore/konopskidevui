import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './sidebar';

function renderSidebar() {
  return render(
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>Overview</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>Articles</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <main>Content</main>
      </SidebarInset>
    </SidebarProvider>,
  );
}

describe('Sidebar', () => {
  it('renders the navigation items and the inset content', () => {
    renderSidebar();

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('marks the active item', () => {
    renderSidebar();

    expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('data-active', 'true');
  });

  it('collapses and expands from the trigger', async () => {
    const { container } = renderSidebar();
    const sidebar = container.querySelector('[data-slot="sidebar"]');

    expect(sidebar).toHaveAttribute('data-state', 'expanded');

    await userEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));

    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      'data-state',
      'collapsed',
    );
  });

  it('toggles with the ⌘B shortcut', async () => {
    const { container } = renderSidebar();

    await userEvent.keyboard('{Meta>}b{/Meta}');

    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      'data-state',
      'collapsed',
    );
  });

  it('uses the sidebar tokens for the rail surface', () => {
    const { container } = renderSidebar();
    const inner = container.querySelector('[data-slot="sidebar-inner"]');

    expect(inner?.className).toContain('bg-sidebar');
  });
});
