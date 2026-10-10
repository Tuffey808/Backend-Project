const tones: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  PENDING: 'bg-amber-100 text-amber-900',
  REJECTED: 'bg-red-100 text-red-800',
  DRAFT: 'bg-stone-100 text-stone-700',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  INACTIVE: 'bg-stone-100 text-stone-600',
};

export function Badge({ label }: { label: string }) {
  const tone = tones[label.toUpperCase()] || 'bg-stone-100 text-stone-700';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}
