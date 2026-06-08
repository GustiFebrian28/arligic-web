'use client';

import { useEffect, useState } from 'react';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teknisi' | 'supervisor';
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setUser(data?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
