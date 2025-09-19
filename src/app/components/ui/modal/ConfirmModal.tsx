"use client";

import { Modal, Button } from "flowbite-react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { JSX, useEffect } from "react";

type ConfirmType = "success" | "error" | "info" | "warning";

interface ConfirmModalProps {
  show: boolean;
  type?: ConfirmType;
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

const iconMap: Record<ConfirmType, JSX.Element> = {
  success: <FaCheckCircle className="text-green-500 text-3xl" />,
  error: <FaExclamationCircle className="text-red-500 text-3xl" />,
  info: <FaInfoCircle className="text-blue-500 text-3xl" />,
  warning: <FaExclamationTriangle className="text-yellow-500 text-3xl" />,
};

const titleMap: Record<ConfirmType, string> = {
  success: "Thành công",
  error: "Có lỗi xảy ra",
  info: "Thông tin",
  warning: "Cảnh báo",
};

export default function ConfirmModal({
  show,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  useEffect(() => {
    // reset scroll khi mở modal
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [show]);

  return (
    <Modal show={show} onClose={onClose} size="md" popup>
      <div className="p-6 text-center">
        <div className="flex justify-center mb-4">{iconMap[type]}</div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {title || titleMap[type]}
        </h3>
        <p className="mb-6 text-sm text-gray-500">{message}</p>
        <div className="flex justify-center gap-4">
          <Button
            color={type === "error" ? "red" : "green"}
            onClick={onConfirm}
          >
            Xác nhận
          </Button>
          <Button onClick={onClose}>Hủy</Button>
        </div>
      </div>
    </Modal>
  );
}
