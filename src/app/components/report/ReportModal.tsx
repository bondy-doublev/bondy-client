"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Flag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type ReportTarget = "content" | "user";

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  target: ReportTarget; // 👈 "content" | "user"
  // parent sẽ tạo CreateReportRequest & call backend
  onSubmit: (reason: string) => Promise<void>;
};

export default function ReportModal({
  open,
  onClose,
  target,
  onSubmit,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const t = useTranslations("report");

  const isUserReport = target === "user";

  // clear khi mở modal mới
  useEffect(() => {
    if (open) {
      setReason("");
      setSubmitting(false);
    }
  }, [open]);

  const canSubmit = reason.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      await onSubmit(reason.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  // Quick reasons khác nhau cho user vs content
  const quickReasons = isUserReport
    ? [
        t("fakeAccount") || "Fake account / impersonation",
        t("harassment") || "Harassment / bullying",
        t("spamUser") || "Spam / unwanted contact",
        t("inappropriateProfile") || "Inappropriate profile",
      ]
    : [
        t("spam") || "Spam",
        t("hate") || "Hate / Harassment",
        t("nudity") || "Nudity / Sexual content",
        t("violence") || "Violence / Dangerous",
      ];

  const handleQuickReasonClick = (text: string) => {
    setReason((prev) =>
      prev.trim().length === 0 ? text : `${prev.trim()}\n- ${text}`
    );
  };

  const title = isUserReport
    ? t("reportUserTitle") || "Report user"
    : t("reportContentTitle") || "Report content";

  const description = isUserReport
    ? t("reportUserDescription") ||
      "Tell us what is wrong with this user. Our moderation team will review your report."
    : t("reportContentDescription") ||
      "Tell us what is wrong with this content. Our moderation team will review your report.";

  const detailLabel = isUserReport
    ? t("reportUserDetailLabel") || "Describe the problem with this user"
    : t("reportDetailLabel") || "Describe the problem";

  const placeholder = isUserReport
    ? t("reportUserDetailPlaceholder") ||
      "Please provide more details about this user’s behavior..."
    : t("reportDetailPlaceholder") ||
      "Please provide more details so we can better understand the issue...";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
      <DialogContent className="w-[95%] md:max-w-md bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70]">
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10 relative">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none flex items-center gap-2">
            <Flag size={18} className="text-red-500" />
            {title}
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
              aria-label="Close"
              disabled={submitting}
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <AlertTriangle className="mt-0.5" size={16} />
            <p className="text-xs text-gray-700">{description}</p>
          </div>

          {/* Quick reasons */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-800">
              {t("reportQuickReasons") || "Quick reasons"}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickReasonClick(r)}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-800">
              {detailLabel}
              <span className="text-red-500 ml-0.5">*</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={placeholder}
              maxLength={2000}
            />
            <div className="text-[11px] text-gray-400 text-right">
              {reason.length}/2000
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="px-3"
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting
                ? t("reporting") || "Reporting..."
                : t("submitReport") || "Submit report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
