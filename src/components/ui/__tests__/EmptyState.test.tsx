/**
 * src/components/ui/__tests__/EmptyState.test.tsx
 *
 * Tests for the EmptyState component.
 *
 * The component accepts optional title and subtitle props.
 * The current implementation does NOT have an onAction/action button —
 * it renders an icon, a title text, and an optional subtitle text.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  // ---- default render ----

  describe('default render', () => {
    it('renders the default title "No results" when no title prop is provided', () => {
      render(<EmptyState />);
      expect(screen.getByText('No results')).toBeTruthy();
    });

    it('does not render a subtitle element when subtitle prop is omitted', () => {
      render(<EmptyState />);
      // The subtitle conditional means there should be only one Text node
      // (the title). We verify no extra text is shown.
      expect(screen.queryByText(/./)).toBeTruthy(); // title exists
      const texts = screen.UNSAFE_getAllByType(
        require('react-native').Text,
      );
      // Only the title text node rendered
      expect(texts).toHaveLength(1);
    });
  });

  // ---- title prop ----

  describe('title prop', () => {
    it('renders a custom title', () => {
      render(<EmptyState title="No transfers found" />);
      expect(screen.getByText('No transfers found')).toBeTruthy();
    });
  });

  // ---- subtitle prop ----

  describe('subtitle prop', () => {
    it('renders the subtitle when provided', () => {
      render(
        <EmptyState title="No results" subtitle="Try adjusting your filters" />,
      );
      expect(screen.getByText('Try adjusting your filters')).toBeTruthy();
    });

    it('does not render a second Text node when subtitle is omitted', () => {
      render(<EmptyState title="Nothing here" />);
      const texts = screen.UNSAFE_getAllByType(require('react-native').Text);
      expect(texts).toHaveLength(1);
    });

    it('renders both title and subtitle together', () => {
      render(
        <EmptyState
          title="No transfers found"
          subtitle="Clear filters to see all transfers"
        />,
      );

      expect(screen.getByText('No transfers found')).toBeTruthy();
      expect(
        screen.getByText('Clear filters to see all transfers'),
      ).toBeTruthy();
    });
  });
});
