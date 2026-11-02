import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from './avatar';

describe('Avatar', () => {
  it('shows the fallback initials, which are what a screen reader reads', () => {
    render(
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('keeps the fallback until the image has actually loaded', () => {
    // jsdom never fires `load`, which is the same state a slow image is in: the
    // initials are what the reader sees, not an empty circle.
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.png" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.queryByAltText('Ada Lovelace')).not.toBeInTheDocument();
  });

  it('publishes the size so the fallback can scale its type', () => {
    render(
      <Avatar size="lg">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('AL').closest('[data-slot="avatar"]')).toHaveAttribute(
      'data-size',
      'lg',
    );
  });

  it('keeps a group countable: avatars plus one overflow chip', () => {
    render(
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>MK</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>,
    );

    expect(screen.getAllByText(/^[A-Z]{2}$/)).toHaveLength(2);
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  it('anchors a status badge to the avatar it belongs to', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge />
      </Avatar>,
    );

    expect(container.querySelector('[data-slot="avatar-badge"]')).not.toBeNull();
  });
});
