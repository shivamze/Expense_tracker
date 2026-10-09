"use client";
import { useState, useMemo } from "react";
import { ExpenseCreate, SavingsCreate } from "@/src/types";
import PieChartComponent from "./pichart";
import { useExpenseSummary } from "../../hooks/useExpenseSummary";
import { useSavingsSummary} from "../../hooks/useSavingsSummary"
import { useCreateExpense } from "../../hooks/useCreateExpense";
import { useCreateSaving } from "../../hooks/useCreateSaving";
import { useAuth } from "@/src/context/AuthContext";


import ExpenseForm from "../components/ExpenseForm";
import SavingsForm from "./SavingsForm";
import Link from "next/link";

const fmt = (n?: number | null) =>
  (n ?? 0).toLocaleString("en-IN", {
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

type Period = "today" | "week" | "month";



export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSavingForm, setShowSavingForm] = useState(false);
  const {user} = useAuth()

  const prevMonth = () =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const {mutate: createExpense, isPending: isCreatingExpense} = useCreateExpense();

  const handleCreateExpense = (expense: ExpenseCreate) => {
    createExpense(expense, {
      onSuccess: () => {
        setShowExpenseForm(false);
      },
    });
  };

  const {mutate: createSaving, isPending: isCreatingSaving} = useCreateSaving();

  const handleCreateSaving = (saving: SavingsCreate) => {
    createSaving(saving, {
      onSuccess: () => {
        setShowSavingForm(false);
      },
    });
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();

    if (period === "today") {
      const date = today.toISOString().split("T")[0];

      return {
        startDate: date,
        endDate: date,
      };
    }

    if (period === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }

    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [period, month]);

  const {
    data: dashboardData,
    isLoading: expenseLoading,
    isError: expenseError,
  } = useExpenseSummary({
    startDate,
    endDate,
  });

  const {
    data: dashboardSavingsData,
    isLoading: savingsLoading,
    isError: savingsError,
  } = useSavingsSummary({
    startDate,
    endDate,
  });

  const balance =
    (dashboardSavingsData?.income?.total_income ?? 0) -
    (dashboardData?.total_expense ?? 0) -
    (dashboardSavingsData?.savings?.total_savings ?? 0);

  
  

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14  items-center gap-8 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 my-5">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {greeting()}, {user?.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Here's your financial overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Period tabs */}
          <div className="flex border border-zinc-200 rounded-md overflow-hidden bg-white text-xs font-medium">
            {(["today", "week", "month"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 transition-colors ${period === p ? "bg-indigo-600 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                {p === "today" ? "Today" : p === "week" ? "This week" : "Month"}
              </button>
            ))}
          </div>
          {/* Month selector (only when period === month) */}
          {period === "month" && (
            <div className="flex items-center gap-1 border border-zinc-200 rounded-md bg-white px-2 py-1">
              <button
                onClick={prevMonth}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <span className="text-xs font-medium text-zinc-700 min-w-28 text-center">
                {month.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={nextMonth}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Income"
          amount={dashboardSavingsData?.income.total_income ?? 0}
          note={`${month.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}`}
          color="text-zinc-900"
        />
        <SummaryCard
          label="Expenses"
          amount={dashboardData?.total_expense ?? 0}
          note={`${dashboardData?.total_transactions ?? 0} transactions`}
          color="text-rose-600"
        />
        <SummaryCard
          label="Savings"
          amount={dashboardSavingsData?.savings.total_savings ?? 0}
          note={`${dashboardSavingsData?.savings.total_deposits ?? 0} deposits`}
          color="text-emerald-600"
        />
        <SummaryCard
          label="Remaining"
          amount={balance}
          note={balance < 0 ? "over budget" : "within budget"}
          color={balance < 0 ? "text-rose-600" : "text-emerald-600"}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 my-5">
        <button
          onClick={() => setShowExpenseForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 text-zinc-700 text-sm font-medium rounded-md hover:bg-zinc-50 hover:border-zinc-400 transition-colors"
        >
          <svg
            className="w-4 h-4 text-rose-500"
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
        <button
          onClick={() => setShowSavingForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 text-zinc-700 text-sm font-medium rounded-md hover:bg-zinc-50 hover:border-zinc-400 transition-colors"
        >
          <svg
            className="w-4 h-4 text-emerald-500"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              Recent Activity
            </h2>
            <span className="text-xs text-zinc-400">
              {dashboardData?.recent_transactions.length} transactions
            </span>
          </div>

          {dashboardData?.recent_transactions.length === 0 ? (
            <div className="px-5 py-12 text-center">
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
                No transactions yet
              </p>
              <p className="text-xs text-zinc-400">
                Start tracking your expenses or savings to see your financial
                activity here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                      Description
                    </th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.recent_transactions.map((item: any, i: any) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-zinc-50 transition-colors ${i !== dashboardData?.recent_transactions.length - 1 ? "border-b border-zinc-50" : ""}`}
                    >
                      <td className="px-5 py-3 text-xs text-zinc-500 whitespace-nowrap">
                        {fmtDate(item.expense_date)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`shrink-0 w-1.5 h-1.5 rounded-full ${item.kind === "expense" ? "bg-emerald-400" : "bg-rose-400"}`}
                          />
                          <span className="text-sm text-zinc-800 truncate max-w-36">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`text-sm font-mono font-medium ${item.kind === "expense" ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {item.kind === "expense" ? "+" : "-"}
                          {fmt(item.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5 py-3 border-t border-zinc-100 flex gap-4">
            <Link
              href={"/expense"}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              View all expenses →
            </Link>
            <Link
              href={"savings"}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              View all savings →
            </Link>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">
              Spending by Category
            </h2>
          </div>

          <PieChartComponent data={dashboardData?.category_breakdown ?? []} />
          <div className="pt-2 border-t border-zinc-100 my-2">
            <div className="flex justify-center text-xs text-zinc-500">
              <span>Total expenses: </span>
              <span className="font-mono font-medium text-rose-600">
                {fmt(dashboardData?.total_expense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={(e: ExpenseCreate) => {
          handleCreateExpense(e)
          setShowExpenseForm(false)
        }}
      />
      <SavingsForm
        isOpen={showSavingForm}
        onClose={() => setShowSavingForm(false)}
        onSubmit={(e: SavingsCreate) =>{
          handleCreateSaving(e)
         setShowSavingForm(false)}
        } 
      />
    </div>
  );
}

function SummaryCard({
  label,
  amount,
  note,
  color,
}: {
  label: string;
  amount: number;
  note: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl px-5 py-4">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p
        className={`text-xl font-mono font-semibold ${color} leading-none mb-1`}
      >
        {fmt(Math.abs(amount))}
      </p>
      <p className="text-xs text-zinc-400">{note}</p>
    </div>
  );
}
