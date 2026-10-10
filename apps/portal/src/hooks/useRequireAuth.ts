'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/api';
import { getToken, getUser } from '@/lib/session';

type Role = AuthUser['role'];

export function useRequireAuth(role?: Role) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    const u = getUser();

    if (!t || !u) {
      router.replace('/login');
      setReady(true);
      return;
    }

    if (role && u.role !== role) {
      router.replace(
        u.role === 'ADMIN' ? '/admin' : u.role === 'VENDOR' ? '/vendor' : '/account',
      );
      setReady(true);
      return;
    }

    setToken(t);
    setUser(u);
    setReady(true);
  }, [router, role]);

  return { token, user, ready };
}
