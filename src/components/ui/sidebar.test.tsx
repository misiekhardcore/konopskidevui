import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar';
import { TooltipProvider } from './tooltip';

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
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <main>Content</main>
      </SidebarInset>
    </SidebarProvider>,
  );
}

const rail = (container: HTMLElement) => container.querySelector('[data-slot="sidebar"]');
const trigger = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]') as HTMLElement;

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
    const sidebar = rail(container);

    expect(sidebar).toHaveAttribute('data-state', 'expanded');

    await userEvent.click(trigger(container));

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed');
  });

  it('toggles with the ⌘B shortcut', async () => {
    const { container } = renderSidebar();

    await userEvent.keyboard('{Meta>}b{/Meta}');

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed');
  });

  it('toggles with the control key too, which is what Windows and Linux use', async () => {
    const { container } = renderSidebar();

    await userEvent.keyboard('{Control>}b{/Control}');

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed');
  });

  it('uses the sidebar tokens for the rail surface', () => {
    const { container } = renderSidebar();
    const inner = container.querySelector('[data-slot="sidebar-inner"]');

    expect(inner?.className).toContain('bg-sidebar');
  });

  it('leaves the open state to the caller when it is controlled', async () => {
    const onOpenChange = vi.fn();

    const { container } = render(
      <SidebarProvider open={false} onOpenChange={onOpenChange}>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Overview</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger />
        </SidebarInset>
      </SidebarProvider>,
    );

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed');

    await userEvent.click(trigger(container));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    // The provider does not own the state here, so the rail does not move on its own.
    expect(rail(container)).toHaveAttribute('data-state', 'collapsed');
  });

  it('starts collapsed when asked, and records the way it collapses', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Overview</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed');
    expect(rail(container)).toHaveAttribute('data-collapsible', 'icon');
  });

  it('can stay put entirely, when the collapsible prop says so', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Overview</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebar = rail(container);
    expect(sidebar).not.toHaveAttribute('data-state');
    expect(sidebar?.className).toContain('w-(--sidebar-width)');
  });

  it('publishes the edge and the surface it was given', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar side="right" variant="floating">
          <SidebarContent>Items</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(rail(container)).toHaveAttribute('data-side', 'right');
    expect(rail(container)).toHaveAttribute('data-variant', 'floating');
    expect(container.querySelector('[data-slot="sidebar-container"]')).toHaveAttribute(
      'data-side',
      'right',
    );
  });

  it('becomes a sheet on a narrow viewport, and opens from the trigger', async () => {
    const innerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true });

    try {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Items</SidebarContent>
          </Sidebar>
          <SidebarInset>
            <SidebarTrigger />
          </SidebarInset>
        </SidebarProvider>,
      );

      expect(screen.queryByRole('dialog')).toBeNull();

      await userEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));

      const sheet = await screen.findByRole('dialog');
      expect(sheet).toHaveAttribute('data-mobile', 'true');
      expect(sheet).toHaveAttribute('data-side', 'left');
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        value: innerWidth,
        configurable: true,
        writable: true,
      });
    }
  });

  it('toggles from the rail the pointer grabs', async () => {
    const { container } = renderSidebar();

    await userEvent.click(container.querySelector('[data-slot="sidebar-rail"]') as HTMLElement);

    expect(rail(container)).toHaveAttribute('data-state', 'collapsed');
  });

  it('shows a collapsed menu row’s tooltip, as a string or a full content config', async () => {
    render(
      <TooltipProvider>
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Overview">Overview</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{ children: 'Articles' }}>Articles</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </TooltipProvider>,
    );

    await userEvent.hover(screen.getByRole('button', { name: 'Overview' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Overview');
  });

  it('renders each part as the element the composition needs', () => {
    const parts = [
      'sidebar-header',
      'sidebar-footer',
      'sidebar-separator',
      'sidebar-input',
      'sidebar-group',
      'sidebar-group-content',
      'sidebar-menu',
      'sidebar-menu-item',
    ];

    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
          <SidebarFooter>Footer</SidebarFooter>
          <SidebarSeparator />
          <SidebarInput aria-label="Filter" />
          <SidebarGroup>
            <SidebarGroupContent>Group</SidebarGroupContent>
          </SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>Item</SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    for (const part of parts) {
      expect(container.querySelector(`[data-slot="${part}"]`), part).not.toBeNull();
    }
  });

  it('renders the sub-menu rows and the badge next to a row', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Articles</SidebarMenuButton>
                <SidebarMenuBadge>3</SidebarMenuBadge>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/drafts">Drafts</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByRole('link', { name: 'Drafts' })).toHaveAttribute('data-size', 'md');
    expect(container.querySelector('[data-slot="sidebar-menu-badge"]')).toHaveTextContent('3');
  });

  it('shows an action only on hover when asked to stay quiet', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Overview</SidebarMenuButton>
                <SidebarMenuAction showOnHover aria-label="More">
                  ⋯
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(container.querySelector('[data-slot="sidebar-menu-action"]')?.className).toContain(
      'group-hover/menu-item:opacity-100',
    );
  });

  it('reserves the icon column in the loading skeleton', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(container.querySelector('[data-sidebar="menu-skeleton-icon"]')).not.toBeNull();
  });

  it('renders the child element instead of its own tag when asChild is set', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <a href="/journal">Journal</a>
              </SidebarGroupLabel>
              <SidebarGroupAction asChild>
                <a href="/new">New</a>
              </SidebarGroupAction>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/overview">Overview</a>
                  </SidebarMenuButton>
                  <SidebarMenuAction asChild>
                    <a href="/more">More</a>
                  </SidebarMenuAction>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild size="sm" isActive>
                        <a href="/drafts">Drafts</a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    for (const slot of [
      'sidebar-group-label',
      'sidebar-group-action',
      'sidebar-menu-button',
      'sidebar-menu-action',
      'sidebar-menu-sub-button',
    ]) {
      expect(container.querySelector(`a[data-slot="${slot}"]`), slot).not.toBeNull();
    }

    expect(screen.getByRole('link', { name: 'Drafts' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('link', { name: 'Drafts' })).toHaveAttribute('data-active', 'true');
  });

  it('refuses to render a part outside the provider', () => {
    const consoleError = console.error;
    console.error = () => {};

    try {
      expect(() => render(<SidebarMenuButton>Orphan</SidebarMenuButton>)).toThrow(
        /useSidebar must be used within a SidebarProvider/,
      );
    } finally {
      console.error = consoleError;
    }
  });

  it('exposes the context the parts read', () => {
    function Probe() {
      const { state, isMobile } = useSidebar();
      return <output>{`${state}${isMobile ? '-mobile' : ''}`}</output>;
    }

    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <Probe />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('expanded');
  });
});
