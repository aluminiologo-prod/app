/**
 * src/lib/__tests__/toast.test.ts
 *
 * Verifies that the toast utility functions forward the correct payload to
 * react-native-toast-message. The Toast mock is defined in jest.setup.ts.
 */

import Toast from 'react-native-toast-message';
import { toastSuccess, toastError, toastApiError } from '../toast';

describe('Toast utilities (src/lib/toast.ts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- toastSuccess ----

  describe('toastSuccess', () => {
    it('calls Toast.show with type "success" and the provided message', () => {
      toastSuccess('Transfer saved');

      expect(Toast.show).toHaveBeenCalledTimes(1);
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          text1: 'Transfer saved',
        }),
      );
    });

    it('sets visibilityTime to 3000ms', () => {
      toastSuccess('Done');

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ visibilityTime: 3000 }),
      );
    });
  });

  // ---- toastError ----

  describe('toastError', () => {
    it('calls Toast.show with type "error" and the provided message', () => {
      toastError('Something went wrong');

      expect(Toast.show).toHaveBeenCalledTimes(1);
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Something went wrong',
        }),
      );
    });

    it('sets visibilityTime to 4000ms', () => {
      toastError('Oops');

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ visibilityTime: 4000 }),
      );
    });
  });

  // ---- toastApiError ----

  describe('toastApiError', () => {
    it('extracts the message from an Error instance', () => {
      toastApiError(new Error('API returned 422'));

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'API returned 422',
        }),
      );
    });

    it('uses the fallback message when the error is not an Error instance', () => {
      toastApiError({ code: 500 });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Something went wrong',
        }),
      );
    });

    it('uses a custom fallback message when provided', () => {
      toastApiError('not-an-error', 'Custom fallback');

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Custom fallback',
        }),
      );
    });

    it('uses the fallback when error is null', () => {
      toastApiError(null);

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          text1: 'Something went wrong',
        }),
      );
    });

    it('sets visibilityTime to 4000ms', () => {
      toastApiError(new Error('err'));

      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ visibilityTime: 4000 }),
      );
    });
  });
});
