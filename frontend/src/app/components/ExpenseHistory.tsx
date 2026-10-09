"use client";
import { useState, useRef, useEffect } from "react";
import {
  CategoryEnum as EXPENSE_CATEGORIES,
  ExpenseRead,
  ExpenseCreate,
  ExpenseUpdate,
} from "@/src/types/index";
import { useExpenses } from "@/src/hooks/useExpenses";
import { useUpdateExpense } from "@/src/hooks/useUpdateExpense";
import { useDeleteExpense } from "@/src/hooks/useDeleteExpense";
import { useCreateExpense } from "@/src/hooks/useCreateExpense";

import ExpenseForm from "../components/ExpenseForm";
import DeleteConfirm from "./DeleteConfirm";

const fmt = (n: number) =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
const fmtDate = (s: string) =>
  new Date(s + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const PAGE_SIZE = 10;

function ActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 md:top-8 w-36 md:w-32 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-20">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 md:py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 md:py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <tr className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-4 md:table-row md:p-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <td
          key={i}
          className={`block p-0 md:table-cell md:px-4 md:py-3 ${i === 3 ? "hidden md:table-cell" : ""}`}
        >
          <div
            className="h-3 bg-zinc-100 rounded animate-pulse"
            style={{ width: `${60 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function ExpenseHistory() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<ExpenseRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRead | null>(null);
  const hasFilters = search || category || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const {
    data,
    isLoading: loading,
    isError,
    error,
  } = useExpenses({
    filters: {
      search: search || undefined,
      category,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
      sort,
    },
    page,
    pageSize: PAGE_SIZE,
  });

  const expenses = data?.items ?? [];

  const totalPages = data?.total_pages ?? 1;

  const { mutate: updateExpense, isPending: isUpdatingExpense } =
    useUpdateExpense();

  const { mutate: deleteExpense, isPending: isDeletingExpense } =
    useDeleteExpense();

  const onEdit = (expense: ExpenseCreate) => {
    if (!editTarget) return;

    const updateData: ExpenseUpdate = {
      category: expense.category,
      amount: expense.amount,
      title: expense.title,
      expense_date: expense.expense_date,
    };

    updateExpense(
      {
        id: editTarget?.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          setEditTarget(null);
        },
      },
    );
  };

  const onDelete = () => {
    if (!deleteTarget) return;

    deleteExpense(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  const { mutate: createExpense, isPending: isCreatingExpense } =
    useCreateExpense();

  const handleCreateExpense = (expense: ExpenseCreate) => {
    createExpense(expense, {
      onSuccess: () => {
        setShowAdd(false);
      },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-28 md:pb-8 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Expense History
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Review and manage your recorded expenses.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors w-full sm:w-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Expense
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:flex lg:flex-wrap lg:items-end">
          <div className="col-span-2 md:col-span-4 min-w-0 lg:flex-1 lg:min-w-48">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search expenses…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full min-w-0 pl-8 pr-3 py-2 border border-zinc-300 rounded-md text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 min-w-0 lg:min-w-40">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full min-w-0 px-3 py-2 border border-zinc-300 rounded-md text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All categories</option>
              {Object.values(EXPENSE_CATEGORIES).map((c: string) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0 lg:min-w-32">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="block w-full min-w-0 px-3 py-2 border border-zinc-300 rounded-md text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="min-w-0 lg:min-w-32">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="block w-full min-w-0 px-3 py-2 border border-zinc-300 rounded-md text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="col-span-2 md:col-span-1 min-w-0 lg:min-w-36">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Sort
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
              className="w-full min-w-0 px-3 py-2 border border-zinc-300 rounded-md text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="col-span-2 md:col-span-4 lg:col-span-1 text-center lg:text-left text-sm text-zinc-500 hover:text-zinc-700 underline transition-colors lg:pb-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl">
        <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          {/* <span className="text-xs text-zinc-500">
            {filtered.length} {filtered.length === 1 ? "expense" : "expenses"}
            {hasFilters ? " matching filters" : ""}
          </span> */}
          {/* <span className="text-xs font-mono font-medium text-rose-600">
            {fmt(totalAmount)} total
          </span> */}
        </div>

        <div className="md:overflow-x-auto">
          <table className="block md:table w-full">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-zinc-100">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Description
                </th>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden md:table-cell">
                  Category
                </th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-5 py-2.5 w-12"></th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
              ) : expenses.length === 0 ? (
                <tr className="block md:table-row">
                  <td colSpan={5} className="block md:table-cell">
                    <div className="py-12 px-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-5 h-5 text-zinc-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-zinc-700 mb-1">
                        {hasFilters
                          ? "No expenses match your filters"
                          : "No expenses recorded yet"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {hasFilters
                          ? "Try adjusting or clearing the filters."
                          : 'Click "Add Expense" to record your first expense.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((expense, i) => (
                  <tr
                    key={expense.id}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 md:table-row md:p-0 hover:bg-zinc-50 transition-colors ${i !== expenses.length - 1 ? "border-b border-zinc-100 md:border-zinc-50" : ""}`}
                  >
                    <td className="col-start-1 row-start-1 p-0 md:px-5 md:py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {fmtDate(expense.expense_date)}
                    </td>
                    <td className="col-start-1 row-start-2 min-w-0 p-0 md:px-5 md:py-3">
                      <p className="text-sm font-medium md:font-normal text-zinc-800 break-words">
                        {expense.title}
                      </p>
                    </td>
                    <td className="col-span-2 col-start-1 row-start-3 mt-1 md:mt-0 p-0 md:px-5 md:py-3">
                      <span className="inline-block text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                        {expense.category}
                      </span>
                    </td>
                    <td className="col-start-2 row-start-2 p-0 md:px-5 md:py-3 text-right whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-rose-600">
                        −{fmt(expense.amount)}
                      </span>
                    </td>
                    <td className="col-start-2 row-start-1 justify-self-end p-0 md:px-4 md:py-3 text-right">
                      <ActionMenu
                        onEdit={() => setEditTarget(expense)}
                        onDelete={() => setDeleteTarget(expense)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-5 py-3.5 border-t border-zinc-100 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2 sm:gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 sm:px-3 sm:py-1.5 text-xs border border-zinc-200 rounded text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 sm:px-3 sm:py-1.5 text-xs border border-zinc-200 rounded text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ExpenseForm
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(e) => {
          handleCreateExpense(e);
          setShowAdd(false);
        }}
      />
      <ExpenseForm
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={(e) => onEdit(e)}
        initial={editTarget}
      />
      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        itemType="Expense"
        itemName={deleteTarget?.title}
      />
    </div>
  );
}