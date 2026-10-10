'use client';

import { useEffect, useState } from 'react';
import { getAccountSummary, getMe, type AccountSummary, type AuthUser } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AccountProfilePage() {
  const { token, ready } = useRequireAuth('CUSTOMER');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([getMe(token), getAccountSummary(token)])
      .then(([u, s]) => {
        setUser(u);
        setSummary(s);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  const customer = user?.customer || summary?.customer;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">الحساب</p>
        <h1 className="text-3xl font-semibold">الملف الشخصي</h1>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[#78716c]">الاسم</dt>
            <dd className="font-medium">{user?.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-[#78716c]">البريد</dt>
            <dd className="font-medium">{user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-[#78716c]">الجوال</dt>
            <dd className="font-medium">{user?.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-[#78716c]">المدينة</dt>
            <dd className="font-medium">{customer?.city || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-[#78716c]">الدولة</dt>
            <dd className="font-medium">{customer?.country || 'SA'}</dd>
          </div>
          <div>
            <dt className="text-sm text-[#78716c]">تاريخ التسجيل</dt>
            <dd className="font-medium">
              {summary?.createdAt
                ? new Date(summary.createdAt).toLocaleDateString('ar-SA')
                : '—'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
