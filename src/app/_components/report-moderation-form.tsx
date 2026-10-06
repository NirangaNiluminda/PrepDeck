import { resolveReportAction } from '../actions/community';

const BUTTON = 'rounded-md px-2.5 py-1 text-sm font-medium';
const PRIMARY = `${BUTTON} bg-indigo-600 text-white hover:bg-indigo-500`;
const SECONDARY = `${BUTTON} text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800`;

export function ReportModerationForm({ reportId }: { reportId: string }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <form action={resolveReportAction.bind(null, 'dismissed')}>
        <input type="hidden" name="reportId" value={reportId} />
        <button type="submit" className={SECONDARY}>
          Dismiss
        </button>
      </form>
      <form action={resolveReportAction.bind(null, 'resolved')}>
        <input type="hidden" name="reportId" value={reportId} />
        <button type="submit" className={PRIMARY}>
          Mark resolved
        </button>
      </form>
    </div>
  );
}
