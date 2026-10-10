'use client';

import { useEffect, useState } from 'react';
import {
  getVendorOrders,
  updateVendorFulfillment,
  type AdminOrder,
} from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const STATUSES = [
  'PENDING',
  'ACCEPTED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export default function VendorOrdersPage() {
  const { token, ready } = useRequireAuth('VENDOR');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');

  async function refresh(tok: string) {
    setOrders(await getVendorOrders(tok));
  }

  useEffect(() => {
    if (!token) return;
    refresh(token).catch((e) => setError(e.message));
  }, [token]);

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">الطلبات</p>
        <h1 className="text-3xl font-semibold">طلبات متجري</h1>
        <p className="mt-1 text-[#57534e]">{orders.length} طلب</p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <ul className="space-y-4">
        {orders.length === 0 && (
          <li className="rounded-2xl bg-white px-5 py-10 text-center text-[#78716c] shadow-sm">
            لا توجد طلبات بعد
          </li>
        )}
        {orders.map((order) => {
          const products = Array.isArray(order.products) ? order.products : [];
          return (
            <li key={String(order.id || order._id)} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    #{String(order._id)} · {String(order.orderNumber)}
                  </p>
                  <p className="text-sm text-[#78716c]">
                    {String(order.fulfillmentStatus)} · {String(order.price)} SAR
                  </p>
                  <p className="mt-1 text-xs text-[#a8a29e]">
                    عمولة {String(order.platform_commission || 0)} · أرباحك{' '}
                    {String(order.vendor_earnings || 0)}
                  </p>
                </div>
                {token && (
                  <select
                    className="rounded-xl border px-3 py-2 text-sm"
                    defaultValue={String(order.fulfillmentStatus || 'PENDING')}
                    onChange={async (e) => {
                      await updateVendorFulfillment(
                        token,
                        Number(order._id),
                        e.target.value,
                      );
                      await refresh(token);
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <ul className="mt-4 space-y-1 border-t border-[#f5f5f4] pt-3 text-sm">
                {products.map((line) => {
                  const p = line as Record<string, unknown>;
                  return (
                    <li key={String(p._id)} className="flex justify-between">
                      <span>
                        {String(p.title)} × {String(p.quantity)}
                      </span>
                      <span className="tabular-nums">{String(p.price)} SAR</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
