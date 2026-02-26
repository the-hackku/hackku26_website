'use client';

import { useEffect, useState } from 'react';

export function useHash() {
  const [hash, setHash] = useState('');

  useEffect(() => {
    setHash(window.location.hash.slice(1)); // strips the "#"

    const handleHashChange = () => setHash(window.location.hash.slice(1));
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return hash;
}
