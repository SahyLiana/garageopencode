const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30',
  CANCEL_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
  SCHEDULED: 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 border-violet-200 dark:border-violet-500/30',
  CONFIRMED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-white/40'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}