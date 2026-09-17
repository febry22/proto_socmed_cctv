"use client";

import { FormEvent, useState } from "react";

interface SearchBarProps {
  initialKeyword?: string;
  initialStartDate: string;
  initialEndDate: string;
  loading: boolean;
  onSearch: (keyword: string, startDate: string, endDate: string) => void;
}

export default function SearchBar({
  initialKeyword = "",
  initialStartDate,
  initialEndDate,
  loading,
  onSearch,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed, startDate, endDate);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 shadow-sm transition focus-within:border-indigo-400 focus-within:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
        <svg
          className="h-5 w-5 shrink-0 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9Z" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Cari topik, mis. Karhutla, Banjir Jakarta..."
          className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
        />
      </div>

      <div className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        <input
          type="date"
          value={startDate}
          max={endDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-transparent outline-none"
        />
        <span className="text-neutral-400">–</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-transparent outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !keyword.trim()}
        className="shrink-0 rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Mencari..." : "Cari"}
      </button>
    </form>
  );
}
