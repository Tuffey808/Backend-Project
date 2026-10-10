'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAdminOrder, type AdminOrder } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AdminOrderDetailPage() {
  const { token, ready } = useRequireAuth('ADMIN');
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !params.id) return;
    getAdminOrder(token, params.id)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [token, params.id]);

  if (!ready) return null;

  const products = Array.isArray(order?.products) ? order!.products : [];
  const subOrders = Array.isArray(order?.subOrders) ? order!.subOrders : [];
  const tracking = Array.isArray(order?.tracking) ? order!.tracking : [];

  return (
    <div>
      <header className="mb-8">
        <Link href="/admin/orders" className="text-sm text-[#8a6a1f]">
          ← الطلبات
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">
          طلب #{String(order?._id || params.id)}
        </h1>
        {order?.orderNumber != null && (
          <p className="mt-1 text-[#57534e]">{String(order.orderNumber)}</p>
        )}
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}
      {!order && !error && <p>جاري التحميل…</p>}

      {order && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-[#78716c]">الحالة</p>
              <p className="mt-1 font-medium">{String(order.status)}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-[#78716c]">الإجمالي</p>
              <p className="mt-1 font-medium tabular-nums">{String(order.price)} SAR</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-[#78716c]">الدفع</p>
              <p className="mt-1 font-medium">
                {order.paymentStatus ? 'مدفوع / COD' : 'غير مدفوع'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">العميل</h2>
            <p>{String((order.userInfo as { name?: string })?.name || '')}</p>
            <p className="text-sm text-[#78716c]">
              {String((order.userInfo as { email?: string })?.email || '')}
            </p>
          </div>

          {subOrders.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">طلبات البائعين</h2>
              <ul className="space-y-2">
                {subOrders.map((sub) => {
                  const s = sub as Record<string, unknown>;
                  const vendor = s.vendor as { name?: string } | false;
                  return (
                    <li
                      key={String(s.id || s._id)}
                      className="flex flex-wrap justify-between gap-2 rounded-xl border border-[#e7e5e4] px-3 py-2 text-sm"
                    >
                      <span>
                        #{String(s._id)} · {String(s.orderNumber)} ·{' '}
                        {vendor ? vendor.name : 'المنصة'}
                      </span>
                      <span>
                        {String(s.fulfillmentStatus)} · {String(s.price)} SAR
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">البنود</h2>
            <ul className="divide-y divide-[#f5f5f4]">
              {products.map((line) => {
                const p = line as Record<string, unknown>;
                return (
                  <li key={String(p._id)} className="flex justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{String(p.title)}</p>
                      <p className="text-[#78716c]">
                        × {String(p.quantity)}
                        {p.size ? ` · ${String(p.size)}` : ''}
                      </p>
                    </div>
                    <p className="tabular-nums">{String(p.price)} SAR</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {tracking.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">التتبع</h2>
              <ul className="space-y-2 text-sm">
                {tracking.map((t) => {
                  const ev = t as Record<string, unknown>;
                  return (
                    <li key={String(ev.id)} className="border-s-2 border-[#8a6a1f] ps-3">
                      <p className="font-medium">{String(ev.status)}</p>
                      <p className="text-[#78716c]">{String(ev.description || '')}</p>
                      <p className="text-xs text-[#a8a29e]">{String(ev.createdAt)}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
