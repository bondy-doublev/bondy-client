"use client";

import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

type ConfirmType = "info" | "success" | "warning" | "danger";

interface UniversalConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: ConfirmType;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function UniversalConfirmDialog({
  open,
  onClose,
  onConfirm,
  type = "info",
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: UniversalConfirmDialogProps) {
  // chọn icon theo loại
  const renderIcon = () => {
    const iconClass = "w-6 h-6 mr-2";

    switch (type) {
      case "success":
        return <CheckCircle2 className={`${iconClass} text-green-600`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case "danger":
        return <Trash2 className={`${iconClass} text-red-600`} />;
      default:
        return <Info className={`${iconClass} text-blue-600`} />;
    }
  };

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      className="outline-none"
      style={{
        content: {
          inset: "auto",
          border: "none",
          background: "transparent",
          padding: 0,
        },
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-5 w-80 animate-in fade-in zoom-in">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {renderIcon()}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>

          <Button
            variant={type === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
