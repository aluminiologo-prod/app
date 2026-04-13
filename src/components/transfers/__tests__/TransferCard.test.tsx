/**
 * src/components/transfers/__tests__/TransferCard.test.tsx
 *
 * Tests for the TransferCard component.
 *
 * The component uses:
 *   - useTranslation('transfers') → mocked to return the key as-is
 *   - expo-haptics → mocked in jest.setup.ts
 *   - StatusChip (sub-component, renders inline)
 *
 * Translation keys used for action buttons:
 *   - inTransit.dispatch   → "Set In Transit" button label
 *   - inTransit.receive    → "Receive" button label
 *   - inTransit.viewDetails → "Details" button label
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { TransferCard } from '../TransferCard';
import type { Transfer, TransferStatus } from '../../../types/transfer';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeStore(id: string, name: string) {
  return {
    id,
    name,
    code: id.toUpperCase(),
    type: 'STORE' as const,
    address: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
}

function makeTransfer(
  status: TransferStatus,
  overrides: Partial<Transfer> = {},
): Transfer {
  return {
    id: 'tr-1',
    code: 'TR-001',
    from_store_id: 'store-a',
    to_store_id: 'store-b',
    transit_store_id: 'store-t',
    status,
    dispatched_by: null,
    received_by: null,
    dispatched_at: null,
    estimated_arrival_at: null,
    received_at: null,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    from_store: makeStore('store-a', 'Almacén Central'),
    to_store: makeStore('store-b', 'Sucursal Norte'),
    _count: { lines: 3 },
    _total_quantity_sent: 12,
    ...overrides,
  };
}

const defaultProps = {
  canUpdate: true,
  onViewDetails: jest.fn(),
  onDispatch: jest.fn(),
  onReceive: jest.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TransferCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- basic rendering ----

  describe('rendering', () => {
    it('renders the transfer code', () => {
      render(
        <TransferCard transfer={makeTransfer('DRAFT')} {...defaultProps} />,
      );
      expect(screen.getByText('TR-001')).toBeTruthy();
    });

    it('renders the origin store name', () => {
      render(
        <TransferCard transfer={makeTransfer('DRAFT')} {...defaultProps} />,
      );
      expect(screen.getByText('Almacén Central')).toBeTruthy();
    });

    it('renders the destination store name', () => {
      render(
        <TransferCard transfer={makeTransfer('DRAFT')} {...defaultProps} />,
      );
      expect(screen.getByText('Sucursal Norte')).toBeTruthy();
    });

    it('always renders the "Details" view button', () => {
      render(
        <TransferCard transfer={makeTransfer('RECEIVED')} {...defaultProps} />,
      );
      // Translation mock returns the key itself
      expect(screen.getByText('inTransit.viewDetails')).toBeTruthy();
    });
  });

  // ---- action buttons by status ----

  describe('action buttons — DRAFT', () => {
    it('shows the dispatch button for DRAFT status', () => {
      render(
        <TransferCard transfer={makeTransfer('DRAFT')} {...defaultProps} />,
      );
      expect(screen.getByText('inTransit.dispatch')).toBeTruthy();
    });

    it('does NOT show the receive button for DRAFT status', () => {
      render(
        <TransferCard transfer={makeTransfer('DRAFT')} {...defaultProps} />,
      );
      expect(screen.queryByText('inTransit.receive')).toBeNull();
    });
  });

  describe('action buttons — IN_TRANSIT', () => {
    it('shows the receive button for IN_TRANSIT status', () => {
      render(
        <TransferCard
          transfer={makeTransfer('IN_TRANSIT')}
          {...defaultProps}
        />,
      );
      expect(screen.getByText('inTransit.receive')).toBeTruthy();
    });

    it('does NOT show the dispatch button for IN_TRANSIT status', () => {
      render(
        <TransferCard
          transfer={makeTransfer('IN_TRANSIT')}
          {...defaultProps}
        />,
      );
      expect(screen.queryByText('inTransit.dispatch')).toBeNull();
    });
  });

  describe('action buttons — terminal statuses', () => {
    it.each<TransferStatus>(['RECEIVED', 'DISPATCHED', 'CANCELLED'])(
      'does NOT show dispatch or receive button for %s status',
      (status) => {
        render(
          <TransferCard transfer={makeTransfer(status)} {...defaultProps} />,
        );
        expect(screen.queryByText('inTransit.dispatch')).toBeNull();
        expect(screen.queryByText('inTransit.receive')).toBeNull();
      },
    );
  });

  describe('action buttons — canUpdate = false', () => {
    it('hides dispatch button when canUpdate is false', () => {
      render(
        <TransferCard
          transfer={makeTransfer('DRAFT')}
          {...defaultProps}
          canUpdate={false}
        />,
      );
      expect(screen.queryByText('inTransit.dispatch')).toBeNull();
    });

    it('hides receive button when canUpdate is false', () => {
      render(
        <TransferCard
          transfer={makeTransfer('IN_TRANSIT')}
          {...defaultProps}
          canUpdate={false}
        />,
      );
      expect(screen.queryByText('inTransit.receive')).toBeNull();
    });
  });

  // ---- callbacks ----

  describe('callbacks', () => {
    it('calls onViewDetails when the card Pressable is tapped', () => {
      const onViewDetails = jest.fn();
      render(
        <TransferCard
          transfer={makeTransfer('DRAFT')}
          {...defaultProps}
          onViewDetails={onViewDetails}
        />,
      );

      // The transfer code is rendered inside the root Pressable — pressing the
      // text node bubbles up and fires the card's onPress handler.
      fireEvent.press(screen.getByText('TR-001'));

      expect(onViewDetails).toHaveBeenCalledTimes(1);
      expect(onViewDetails).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TR-001' }),
      );
    });

    it('calls onDispatch with the transfer when the dispatch button is pressed', () => {
      const onDispatch = jest.fn();
      render(
        <TransferCard
          transfer={makeTransfer('DRAFT')}
          {...defaultProps}
          onDispatch={onDispatch}
        />,
      );

      fireEvent.press(screen.getByText('inTransit.dispatch'));

      expect(onDispatch).toHaveBeenCalledTimes(1);
      expect(onDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TR-001', status: 'DRAFT' }),
      );
    });

    it('calls onReceive with the transfer when the receive button is pressed', () => {
      const onReceive = jest.fn();
      render(
        <TransferCard
          transfer={makeTransfer('IN_TRANSIT')}
          {...defaultProps}
          onReceive={onReceive}
        />,
      );

      fireEvent.press(screen.getByText('inTransit.receive'));

      expect(onReceive).toHaveBeenCalledTimes(1);
      expect(onReceive).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'TR-001', status: 'IN_TRANSIT' }),
      );
    });
  });

  // ---- haptics ----

  describe('haptic feedback', () => {
    it('triggers Light impact haptic when the card is pressed', () => {
      render(
        <TransferCard transfer={makeTransfer('DRAFT')} {...defaultProps} />,
      );

      // Press the transfer code text — it sits inside the root card Pressable
      fireEvent.press(screen.getByText('TR-001'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });

    it('triggers Medium impact haptic when the dispatch button is pressed', () => {
      render(
        <TransferCard transfer={makeTransfer('DRAFT')} {...defaultProps} />,
      );

      fireEvent.press(screen.getByText('inTransit.dispatch'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });

    it('triggers Medium impact haptic when the receive button is pressed', () => {
      render(
        <TransferCard
          transfer={makeTransfer('IN_TRANSIT')}
          {...defaultProps}
        />,
      );

      fireEvent.press(screen.getByText('inTransit.receive'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });
  });
});
