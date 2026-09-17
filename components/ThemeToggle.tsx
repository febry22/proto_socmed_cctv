"use client";

function toggle() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem("theme", next ? "dark" : "light");
  } catch {}
}

const SUN_PATH =
  "M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M6.06 17.94l-1.42 1.42m0-13.72 1.42 1.42M17.94 17.94l1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z";
const MOON_PATH = "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z";

export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Ganti mode gelap/terang"
      className="relative flex h-8 w-14 shrink-0 items-center rounded-full border border-neutral-200 bg-white p-1 shadow-sm transition dark:border-neutral-700 dark:bg-neutral-800"
    >
      <span className="flex h-6 w-6 items-center justify-center text-neutral-300 dark:text-neutral-600">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={SUN_PATH} />
        </svg>
      </span>
      <span className="flex h-6 w-6 items-center justify-center text-neutral-300 dark:text-neutral-600">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={MOON_PATH} />
        </svg>
      </span>
      <span className="absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-transform duration-200 dark:translate-x-6">
        <svg className="h-3.5 w-3.5 dark:hidden" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={SUN_PATH} />
        </svg>
        <svg className="hidden h-3.5 w-3.5 dark:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={MOON_PATH} />
        </svg>
      </span>
    </button>
  );
}
