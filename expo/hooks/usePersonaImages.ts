import { useState, useEffect, useCallback, useRef } from 'react';
import {
  loadCachedImages,
  getAllPersonaUris,
  queuePersonaGeneration,
  resolveUri,
  getGenerationStatus,
} from '@/services/personaImageService';

export function usePersonaImages() {
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(false);
  const initRef = useRef(false);

  const forceUpdate = useCallback(() => {
    setRevision(r => r + 1);
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      await loadCachedImages();
      setReady(true);
      setRevision(r => r + 1);

      // Queue generation of all missing images
      const allUris = getAllPersonaUris();
      queuePersonaGeneration(allUris, forceUpdate);
    })();
  }, [forceUpdate]);

  const resolve = useCallback((uri: string | null | undefined): string | null => {
    return resolveUri(uri);
  }, [revision]); // eslint-disable-line react-hooks/exhaustive-deps

  const status = getGenerationStatus();

  return { resolve, ready, status, revision };
}
