import Toast from 'react-native-toast-message';

export function toastSuccess(message: string) {
  Toast.show({ type: 'success', text1: message, visibilityTime: 3000 });
}

export function toastError(message: string) {
  Toast.show({ type: 'error', text1: message, visibilityTime: 4000 });
}

export function toastApiError(err: unknown, fallback = 'Something went wrong') {
  const message =
    err instanceof Error ? err.message : fallback;
  Toast.show({ type: 'error', text1: message, visibilityTime: 4000 });
}
