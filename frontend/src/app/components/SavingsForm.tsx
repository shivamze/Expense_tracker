import { useState, useEffect } from "react";
import { SavingsCreate, SavingsTypeEnum } from "@/src/types/index";
import Modal from "./Modal";
import { useCreateSaving } from "@/src/hooks/useCreateSaving";

interface SavingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (saving: SavingsCreate) => void;
  initial?: SavingsCreate | null;
}

const today = new Date().toISOString().slice(0, 10);

type SavingsFormState = Omit<SavingsCreate, "id" | "savings_type"> & {
  savings_type: SavingsTypeEnum | "";
};

const empty = (): SavingsFormState => ({   // <- return type must be SavingsFormState
  savings_type: "",
  amount: 0,
  source: "",
  transaction_date: today,
});

export default function SavingForm({
  isOpen,
  onClose,
  onSubmit,
  initial,
}: SavingFormProps) {
  const [form, setForm] = useState<SavingsFormState>(() =>
    initial ? { ...initial } : empty(),
  );
  const [amountStr, setAmountStr] = useState(
    initial ? String(initial.amount) : "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // const { mutate, isPending } = useCreateSaving();

  const validate = () => {
    const errs: Record<string, string> = {};
    const amt = parseFloat(amountStr);
    if (!amountStr || isNaN(amt) || amt <= 0)
      errs.amount = "Enter a valid amount greater than 0";
    if (!form.source.trim()) errs.source = "Source is required";
    if (!form.savings_type) errs.savings_type = "Select a saving type";
    if (!form.transaction_date) errs.transaction_date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const savingsType = form.savings_type;

    if (!savingsType) {
      setErrors((prev) => ({ ...prev, savings_type: "Select a type" }));
      return;
    }

    const data = {
      savings_type: savingsType,
      amount: parseFloat(amountStr),
      source: form.source,
      transaction_date: form.transaction_date,
    };

    onSubmit(data);
    handleClose();
  };

  useEffect(() => {
    if (initial) {
      setForm({
        savings_type: initial.savings_type,
        amount: initial.amount,
        source: initial.source,
        transaction_date: initial.transaction_date,
      });

      setAmountStr(String(initial.amount));
    } else {
      setForm(empty());
      setAmountStr("");
    }
  }, [initial]);

  const handleClose = () => {
    onClose();
    setErrors({});
    if (!initial) {
      setForm(empty());
      setAmountStr("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initial ? "Edit Saving" : "Add Saving"}
    >
      <div className="px-6 py-5 flex flex-col gap-4">
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
              placeholder="00.00"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);
                setErrors((prev) => ({ ...prev, amount: "" }));
              }}
              className={`w-full pl-7 pr-3 py-2.5 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${errors.amount ? "border-rose-400 bg-rose-50" : "border-zinc-300"}`}
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
            placeholder="e.g. Emergency fund deposit"
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${errors.source ? "border-rose-400 bg-rose-50" : "border-zinc-300"}`}
          />
          {errors.source && (
            <p className="text-xs text-rose-600 mt-1">{errors.source}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.savings_type}
            onChange={(e) => set("savings_type", e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${errors.savings_type ? "border-rose-400 bg-rose-50" : "border-zinc-300"} bg-white`}
          >
            <option value="">Select type</option>
            {Object.values(SavingsTypeEnum).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.savings_type && (
            <p className="text-xs text-rose-600 mt-1">{errors.savings_type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={form.transaction_date}
            max={today}
            onChange={(e) => set("transaction_date", e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${errors.transaction_date ? "border-rose-400 bg-rose-50" : "border-zinc-300"}`}
          />
          {errors.transaction_date && (
            <p className="text-xs text-rose-600 mt-1">
              {errors.transaction_date}
            </p>
          )}
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Notes <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Any additional notes…"
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            className="w-full px-3 py-2.5 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
          />
        </div> */}
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
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? "Saving…" : initial ? "Save Changes" : "Add Saving"}
        </button>
      </div>
    </Modal>
  );
}
