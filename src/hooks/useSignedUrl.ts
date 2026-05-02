import { useCallback, useEffect, useRef, useState } from 'react';
import { getSignedUrl } from '../services/upload.service';

export function useSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(() =>
    path?.startsWith('http') ? path : null,
  );
  const [loading, setLoading] = useState(false);
  const cancelledRef = useRef(false);

  const fetchUrl = useCallback(async (storagePath: string) => {
    setLoading(true);
    try {
      const signedUrl = await getSignedUrl(storagePath);
      if (!cancelledRef.current) {
        setUrl(signedUrl);
      }
    } catch {
      if (!cancelledRef.current) {
        setUrl(null);
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    if (!path || path.startsWith('http')) {
      setUrl(path?.startsWith('http') ? path : null);
      return;
    }

    fetchUrl(path);

    return () => {
      cancelledRef.current = true;
    };
  }, [path, fetchUrl]);

  return { url, loading };
}
