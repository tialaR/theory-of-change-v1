'use client';

import { useEffect } from 'react';

const PUBLIC_BODY_CLASS = 'public-page-scroll';

export function PublicBodyClassController() {
  useEffect(() => {
    document.body.classList.add(PUBLIC_BODY_CLASS);

    return () => {
      document.body.classList.remove(PUBLIC_BODY_CLASS);
    };
  }, []);

  return null;
}
