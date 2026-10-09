import Modal from "./Modal";

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: string;
  itemName?: string;
  isLoading?: boolean;
}

export default function DeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName,
  isLoading,
}: DeleteConfirmProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${itemType}`}
      size="sm"
    >
      <div className="px-6 py-5">
        <div className="flex gap-3 mb-5">
          <div className="shrink-0 w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-rose-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 mb-1">
              Are you sure you want to delete this {itemType.toLowerCase()}?
            </p>
            {itemName && <p className="text-sm text-zinc-500">{itemName}</p>}
            <p className="text-xs text-zinc-400 mt-2">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-60 transition-colors"
          >
            {isLoading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
