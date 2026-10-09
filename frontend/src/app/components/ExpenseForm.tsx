"use client";

import { useEffect, useState } from "react";
import { CategoryEnum, ExpenseCreate } from "@/src/types";
import Modal from "./Modal";
import api from "@/src/lib/api";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: ExpenseCreate) => void;
  initial?: ExpenseCreate | null;
}

interface ExpenseFormState {
  date: string;
  description: string;
  category: CategoryEnum | "";
}

const today = new Date().toISOString().slice(0, 10);

const empty = (): ExpenseFormState => ({
  date: today,
  description: "",
  category: "",
});

export default function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  initial,
}: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseFormState>(empty());
  const [amountStr, setAmountStr] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ocrLoading, setOcrLoading] = useState(false);

  /*
   * Sync form state when an existing expense is provided.
   *
   * For now, this only prepares the form.
   * Create/update operations will be handled by the parent.
   */
  useEffect(() => {
    if (!isOpen) return;

    if (initial) {
      setForm({
        date: initial.expense_date?? today,
        description: initial.title,
        category: initial.category,
      });

      setAmountStr(String(initial.amount));
    } else {
      setForm(empty());
      setAmountStr("");
    }

    setErrors({});
  }, [initial, isOpen]);

  const set = (field: keyof ExpenseFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleOCR = async (file: File) => {
    setOcrLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending file:", file);
      console.log("FormData file:", formData.get("file"));

      const response = await api.post("/extract", formData);

      console.log("OCR response:", response);
      console.log("OCR data:", response.data);

      const data = response.data;

      setForm((prev) => ({
        ...prev,
        description: data.title ?? prev.description,
        category: data.category ?? prev.category,
        date: data.expense_date ?? prev.date,
      }));

      if (data.amount !== undefined && data.amount !== null) {
        setAmountStr(String(data.amount));
      }
    } catch (error: any) {
      console.error("OCR failed:", error);
      console.error("OCR error response:", error.response);
      console.error("OCR error data:", error.response?.data);
    } finally {
      setOcrLoading(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    const amount = parseFloat(amountStr);

    if (!amountStr || Number.isNaN(amount) || amount <= 0) {
      errs.amount = "Enter a valid amount greater than 0";
    }

    if (!form.description.trim()) {
      errs.description = "Description is required";
    }

    if (!form.category) {
      errs.category = "Select a category";
    }

    if (!form.date) {
      errs.date = "Date is required";
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    /*
     * ExpenseForm owns the responsibility of converting
     * UI fields into the API payload.
     *
     * It does NOT perform the API operation.
     */
    const expense: ExpenseCreate = {
      category: form.category as CategoryEnum,
      amount: parseFloat(amountStr),
      title: form.description,
      tags: [],
      expense_date: form.date,
    };

    /*
     * Give the prepared data to the parent.
     *
     * The parent will decide whether this is:
     * - create
     * - update
     * - or another operation in the future.
     */
    onSubmit(expense);

    handleClose();
  };

  const handleClose = () => {
    onClose();

    setErrors({});
    setForm(empty());
    setAmountStr("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initial ? "Edit Expense" : "Add Expense"}
    >
      <div className="px-6 py-5 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Receipt
            <span className="text-zinc-400 font-normal ml-1">(optional)</span>
          </label>

          <label
            className={`relative flex flex-col items-center justify-center w-full min-h-[140px] px-6 py-5 border border-dashed rounded-lg transition-all ${
              ocrLoading
                ? "border-zinc-200 bg-zinc-50 cursor-not-allowed"
                : "border-zinc-300 bg-zinc-50/50 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              disabled={ocrLoading}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  handleOCR(file);
                }

                /*
                 * Allows selecting the same file again.
                 */
                e.target.value = "";
              }}
            />

            {ocrLoading ? (
              <>
                <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-emerald-100">
                  <svg
                    className="w-5 h-5 text-emerald-600 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M21 12a9 9 0 0 0-9-9v3a6 6 0 0 1 6 6h3Z"
                    />
                  </svg>
                </div>

                <p className="text-sm font-medium text-zinc-700">
                  Extracting receipt data...
                </p>

                <p className="text-xs text-zinc-400 mt-1">
                  Please wait while we process your receipt
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-emerald-100">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 3v5h5M8 13h6M8 17h4"
                    />
                  </svg>
                </div>

                <p className="text-sm font-medium text-zinc-700">
                  Upload a receipt
                </p>

                <p className="text-xs text-zinc-500 mt-1">
                  Click to browse an image from your device
                </p>

                <p className="text-[11px] text-zinc-400 mt-2">
                  PNG, JPG or JPEG • Max 5MB
                </p>
              </>
            )}
          </label>

          {!ocrLoading && (
            <p className="text-[11px] text-zinc-400 mt-2">
              OCR will automatically fill the receipt details. Please review
              them before saving.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Amount <span className="text-rose-500">*</span>
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-mono">
              ₹
            </span>

            <input
              type="number"
              min="0"
              step="1"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  amount: "",
                }));
              }}
              className={`w-full pl-7 pr-3 py-2.5 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                errors.amount ? "border-rose-400 bg-rose-50" : "border-zinc-300"
              }`}
            />
          </div>

          {errors.amount && (
            <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Description <span className="text-rose-500">*</span>
          </label>

          <input
            type="text"
            placeholder="e.g. Grocery run, Netflix"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.description
                ? "border-rose-400 bg-rose-50"
                : "border-zinc-300"
            }`}
          />

          {errors.description && (
            <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>

          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.category ? "border-rose-400 bg-rose-50" : "border-zinc-300"
            } bg-white`}
          >
            <option value="">Select category</option>

            {Object.values(CategoryEnum).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {errors.category && (
            <p className="text-xs text-rose-600 mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Date <span className="text-rose-500">*</span>
          </label>

          <input
            type="date"
            value={form.date}
            max={today}
            onChange={(e) => set("date", e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.date ? "border-rose-400 bg-rose-50" : "border-zinc-300"
            }`}
          />

          {errors.date && (
            <p className="text-xs text-rose-600 mt-1">{errors.date}</p>
          )}
        </div>

        {/* Notes intentionally kept out for now.
            Backend currently uses tags instead. */}
      </div>

      <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-2 shrink-0">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={ocrLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {initial ? "Save Changes" : "Add Expense"}
        </button>
      </div>
    </Modal>
  );
}
