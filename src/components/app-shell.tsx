"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { label: "Dashboard", mobileLabel: "Dashboard", icon: "home", href: "/" },
  { label: "Log session", mobileLabel: "Log", icon: "plus", href: "/sessions/new" },
  { label: "Students", mobileLabel: "Students", icon: "people", href: "/students" },
  { label: "Monthly reports", mobileLabel: "Reports", icon: "report", href: "/reports" },
] as const;

function NavIcon({ name }: { name: (typeof navigation)[number]["icon"] }) {
  const paths = {
    home: <path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.2v-6.2H8.7V21H3.5a.5.5 0 0 1-.5-.5v-9.7Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    people: <path d="M16 20v-1.7c0-2.4-2.2-4.3-5-4.3s-5 1.9-5 4.3V20M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6.5 2.2c1.6.7 2.5 1.9 2.5 3.5V18M16 4.2a3.5 3.5 0 0 1 0 6.6" />,
    report: <path d="M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 13v-3m4 3V8m4 8v-5" />,
  };

  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-700 text-sm font-bold tracking-tight text-white shadow-sm">LV</div>
      <div className="leading-tight">
        <p className="font-semibold tracking-[-0.01em] text-slate-950">LVAEP</p>
        <p className="mt-0.5 text-xs text-slate-500">Tutor reporting</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        className="fixed left-4 top-4 z-50 -translate-y-20 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        href="#main-content"
      >
        Skip to main content
      </a>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <Wordmark />
        <nav aria-label="Main navigation" className="mt-10 space-y-1.5">
          {navigation.map((item) => {
            const isCurrent = pathname === item.href;
            return (
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${isCurrent ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                href={item.href}
                key={item.label}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-slate-200 pt-5">
          <p className="text-xs font-medium text-slate-500">Fictional demo workspace</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:hidden">
        <Wordmark />
      </header>

      <main className="pb-24 lg:ml-64 lg:pb-0" id="main-content">{children}</main>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
        {navigation.map((item) => {
          const isCurrent = pathname === item.href;
          return (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-700 ${isCurrent ? "text-teal-700" : "text-slate-500"}`}
              href={item.href}
              key={item.label}
            >
              <NavIcon name={item.icon} />
              {item.mobileLabel}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
