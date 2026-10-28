import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

function renderTabs() {
  return render(
    <Tabs defaultValue="overview">
      <TabsList aria-label="Account">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel</TabsContent>
      <TabsContent value="activity">Activity panel</TabsContent>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('renders a tablist with the first tab selected', () => {
    renderTabs();

    expect(screen.getByRole('tablist', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Overview panel')).toBeInTheDocument();
  });

  it('switches panels on click', async () => {
    renderTabs();

    await userEvent.click(screen.getByRole('tab', { name: 'Activity' }));

    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Activity panel')).toBeInTheDocument();
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument();
  });

  it('moves between tabs with arrow keys', async () => {
    renderTabs();

    screen.getByRole('tab', { name: 'Overview' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
  });

  it('uses the house radius on the list and triggers', () => {
    renderTabs();

    expect(screen.getByRole('tablist').className).toContain('rounded-sm');
    expect(screen.getByRole('tab', { name: 'Overview' }).className).toContain('rounded-sm');
  });
});
