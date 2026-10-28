import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

function renderTable() {
  return render(
    <Table>
      <TableCaption>Articles</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Topic</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Tokens</TableCell>
          <TableCell>Design</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

describe('Table', () => {
  it('exposes a real table with column headers', () => {
    renderTable();

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(within(table).getAllByRole('columnheader')).toHaveLength(2);
    expect(within(table).getByRole('cell', { name: 'Tokens' })).toBeInTheDocument();
  });

  it('associates the caption with the table', () => {
    renderTable();

    expect(screen.getByRole('table')).toHaveAccessibleName('Articles');
  });

  it('uses the UI sans face and bold muted heads', () => {
    renderTable();

    expect(screen.getByRole('table').className).toContain('font-sans');
    const head = screen.getAllByRole('columnheader')[0];
    expect(head.className).toContain('font-bold');
    expect(head.className).toContain('text-muted-foreground');
  });

  it('borders rows with the border token, not a shadow', () => {
    renderTable();

    const row = screen.getAllByRole('row')[1];
    expect(row.className).toContain('border-b');
    expect(row.className).not.toContain('shadow');
  });

  it('scrolls horizontally inside its own container', () => {
    renderTable();

    const container = document.querySelector('[data-slot="table-container"]');
    expect(container?.className).toContain('overflow-auto');
  });
});
