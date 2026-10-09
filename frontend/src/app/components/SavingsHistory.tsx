"use client";
import { useState, useRef, useEffect } from "react";
import SavingForm from "./SavingsForm";
import DeleteConfirm from "../components/DeleteConfirm";
import { useCreateSaving } from "@/src/hooks/useCreateSaving";
import { useSavings } from "@/src/hooks/useSavings";
import { SavingsRead, SavingsCreate, SavingsUpdate, SavingsTypeEnum } from "@/src/types";
import { useUpdateSaving } from "@/src/hooks/useUpdateSaving";
import { useDeleteSaving } from "@/src/hooks/useDeleteSaving";

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

export default function SavingsHistory() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<SavingsRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavingsRead | null>(null);

  const hasFilters = search || type || dateFrom || dateTo;

  const { data, isLoading } = useSavings({
    page,
    pageSize: PAGE_SIZE,
    search,
    startDate: dateFrom || undefined,
    endDate: dateTo || undefined,
    savingsType: type ? (type as SavingsTypeEnum) : undefined,
    sort: sortDir === "desc" ? "newest" : "oldest",
  });

  const paginated = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  // const total = data?.total ?? 0;

  console.log("paginated", data);

  const { mutate: createSaving, isPending: isCreatingSaving } =
    useCreateSaving();

  const onAdd = (saving: SavingsCreate) => {
    createSaving(saving, {
      onSuccess: () => {
        setShowAdd(false);
      },
    });
  };

  const { mutate: updateSaving, isPending: isUpdatingSaving } = useUpdateSaving();

  const {mutate: deleteSaving, isPending: isDeleting} = useDeleteSaving()

  const onEdit = (saving: SavingsCreate) => {
    if (!editTarget) return;
    
          const updateData: SavingsUpdate = {
            savings_type: saving.savings_type,
            amount: saving.amount,
            source: saving.source,
            transaction_date: saving.transaction_date,
          };
    updateSaving(
      { id: editTarget.id, data: updateData },
      {
        onSuccess: () => {
          setEditTarget(null);
        },
      }
    );
  };

  const onDelete = (saving: SavingsRead) => {
      if (!deleteTarget) return;

      deleteSaving(saving.id, {
        onSuccess: () => {
          setDeleteTarget(null);
        },
      });
  }

  const clearFilters = () => {
    setSearch("");
    setType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-28 md:pb-8 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Savings History
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Review and manage your recorded savings deposits.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors w-full sm:w-auto"
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
          Add Saving
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
                placeholder="Search savings…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 min-w-0 lg:min-w-40">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All types</option>
              {Object.values(SavingsTypeEnum).map((t) => (
                <option key={t} value={t}>
                  {t}
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
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="col-span-2 md:col-span-1 min-w-0 lg:min-w-36">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Sort
            </label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "desc" | "asc")}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
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
            {filtered.length} {filtered.length === 1 ? "saving" : "savings"}
            {hasFilters ? " matching filters" : ""}
          </span>
          <span className="text-xs font-mono font-medium text-emerald-600">
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
                  Type
                </th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-5 py-2.5 w-12"></th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group w-full">
              {paginated.length === 0 ? (
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
                            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75M3.75 18.75a60.07 60.07 0 0115.797 2.101"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-zinc-700 mb-1">
                        {hasFilters
                          ? "No savings match your filters"
                          : "No savings recorded yet"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {hasFilters
                          ? "Try adjusting or clearing the filters."
                          : 'Click "Add Saving" to record your first deposit.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((saving: SavingsRead, i: number) => (
                  <tr
                    key={saving.id}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 md:table-row md:p-0 hover:bg-zinc-50 transition-colors ${i !== paginated.length - 1 ? "border-b border-zinc-100 md:border-zinc-50" : ""}`}
                  >
                    <td className="col-start-1 row-start-1 p-0 md:px-5 md:py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {saving.transaction_date ? fmtDate(saving.transaction_date) : "—"}
                    </td>
                    <td className="col-start-1 row-start-2 min-w-0 p-0 md:px-5 md:py-3">
                      <p className="text-sm text-zinc-800">{saving.source}</p>
                    </td>
                    <td className="col-span-2 col-start-1 row-start-3 mt-1 md:mt-0 p-0 md:px-5 md:py-3">
                      <span className="inline-block text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                        {saving.savings_type}
                      </span>
                    </td>
                    <td className="col-start-2 row-start-2 p-0 md:px-5 md:py-3 text-right whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-emerald-600">
                        +{fmt(saving.amount)}
                      </span>
                    </td>
                    <td className="col-start-2 row-start-1 justify-self-end -mr-2.5 -my-2 p-0 md:m-0 md:px-4 md:py-3 text-right">
                      <ActionMenu
                        onEdit={() => setEditTarget(saving)}
                        onDelete={() => setDeleteTarget(saving)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 sm:px-5 py-3.5 border-t border-zinc-100 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2 sm:gap-1">
              <button
                disabled={page === 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 sm:px-3 sm:py-1.5 text-xs border border-zinc-200 rounded text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages || isLoading}
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
      <SavingForm
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(s) => {
          onAdd(s);
          setShowAdd(false);
        }}
      />
      <SavingForm
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={onEdit}
        initial={editTarget}
      />
      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          onDelete(deleteTarget);
        }}
        itemType="Saving"
        itemName={deleteTarget?.source}
      />
    </div>
  );
}
