export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#78716c]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-[#a8a29e]">{hint}</p>}
    </div>
  );
}
