"use client";

import { useEffect, useRef } from "react";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const getFocusableElements = (element: HTMLElement) =>
  Array.from(
    element.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );

const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "キャンセル",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement;
    const dialog = dialogRef.current;
    const firstFocusableElement = dialog
      ? getFocusableElements(dialog)[0]
      : null;
    (firstFocusableElement ?? dialog)?.focus();

    return () => {
      if (
        previouslyFocusedElement instanceof HTMLElement &&
        document.body.contains(previouslyFocusedElement)
      ) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onCancel();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = getFocusableElements(dialog);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-4 py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        tabIndex={-1}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
      >
        <h2
          id="confirm-modal-title"
          className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
        >
          {title}
        </h2>
        <p
          id="confirm-modal-description"
          className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "処理中..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
