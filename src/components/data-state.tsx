"use client";

export function DataLoading({ label = "Loading program data…" }: { label?: string }) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 xl:px-12" role="status">
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
        <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
}

export function DataLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 xl:px-12">
      <div className="rounded-xl border border-red-200 bg-white px-6 py-14 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]" role="alert">
        <div className="mx-auto grid size-11 place-items-center rounded-full bg-red-50 text-red-700">
          <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v5m0 4h.01M10.3 4.6 3.2 17a2 2 0 0 0 1.7 3h14.2a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" /></svg>
        </div>
        <h1 className="mt-4 text-lg font-semibold text-slate-950">Program data could not be loaded</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{message}</p>
        <button className="mt-5 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" onClick={onRetry} type="button">Try again</button>
      </div>
    </div>
  );
}
