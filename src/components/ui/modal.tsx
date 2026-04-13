"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-charcoal/40 bg-beige border border-sand rounded-sm p-0 max-w-lg w-full mx-4 shadow-lg"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-xl font-heading text-charcoal">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="p-1 text-warm-brown hover:text-charcoal transition-colors ml-auto"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
