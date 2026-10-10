'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { addOrderTracking, getAdminOrders, type AdminOrder } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function OrdersPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const { t } = useLocale();
  const o = t.admin.orders;
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');

  async function refresh(tok: string) {
    setOrders(await getAdminOrders(tok));
  }

  useEffect(() => {
    if (!token) return;
    refresh(token).catch((e) => setError(e.message));
  }, [token]);

  async function onTracking(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = new FormData(e.currentTarget);
    await addOrderTracking(token, Number(form.get('orderId')), {
      status: String(form.get('status')),
      description: String(form.get('description') || '') || undefined,
    });
    e.currentTarget.reset();
    await refresh(token);
  }

  if (!ready) return null;

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-[#8a6a1f]">{o.label}</p>
        <h1 className="text-3xl font-semibold">{o.title}</h1>
        <p className="mt-1 text-[#57534e]">
          {orders.length} {o.count}
        </p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <form
        onSubmit={onTracking}
        className="mb-8 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-4"
      >
        <input
          name="orderId"
          type="number"
          required
          placeholder={o.orderIdPh}
          className="rounded-xl border px-3 py-2"
        />
        <select name="status" defaultValue="processing" className="rounded-xl border px-3 py-2">
          <option value="placed">placed</option>
          <option value="paid">paid</option>
          <option value="processing">processing</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
          <option value="cancelled">cancelled</option>
        </select>
        <input name="description" placeholder={o.notePh} className="rounded-xl border px-3 py-2" />
        <button type="submit" className="rounded-xl bg-[#8a6a1f] px-4 py-2 text-white">
          {o.update}
        </button>
      </form>

      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={String(order._id)} className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium">
              #{String(order._id)} · {String(order.orderNumber)} · {String(order.status)}
            </div>
            <Link
              href={`/admin/orders/${String(order._id)}`}
              className="text-sm text-[#8a6a1f] underline"
            >
              تفاصيل
            </Link>
            </div>
            <div className="text-sm text-[#57534e]">
              {String(order.price)} SAR · {o.payment}: {String(order.paymentStatus)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
