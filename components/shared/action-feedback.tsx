"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n/translation";

type FeedbackTone = "info" | "success" | "warning" | "danger";

type ToastItem = {
  id: number;
  message: string;
  tone: FeedbackTone;
};

type PendingAction = {
  cancelLabel: string;
  confirmLabel: string;
  form: HTMLFormElement;
  message: string;
  pendingMessage: string;
  successMessage: string;
  title: string;
  tone: FeedbackTone;
};

type ActionToastEventDetail = {
  message: string;
  tone?: FeedbackTone;
};

const DEFAULT_TOAST_DURATION = 3200;

function readTone(value: string | undefined): FeedbackTone {
  if (value === "success" || value === "warning" || value === "danger") {
    return value;
  }

  return "info";
}

export function ActionFeedbackProvider() {
  const confirmedForms = useRef(new WeakSet<HTMLFormElement>());
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function addToast(message: string, tone: FeedbackTone = "info") {
      const id = Date.now() + Math.random();

      setToasts((items) => [...items, { id, message, tone }]);
      window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id));
      }, DEFAULT_TOAST_DURATION);
    }

    function handleToast(event: Event) {
      const detail = (event as CustomEvent<ActionToastEventDetail>).detail;

      if (!detail?.message) {
        return;
      }

      addToast(detail.message, readTone(detail.tone));
    }

    function handleSubmit(event: SubmitEvent) {
      const form = event.target instanceof HTMLFormElement ? event.target : null;

      if (!form || form.dataset.actionConfirm !== "true") {
        return;
      }

      if (confirmedForms.current.has(form)) {
        confirmedForms.current.delete(form);
        addToast(
          form.dataset.pendingMessage ?? t("feedback.pending.default", "ko"),
          readTone(form.dataset.pendingTone),
        );

        const successMessage = form.dataset.successMessage;
        if (successMessage) {
          window.setTimeout(() => {
            addToast(successMessage, "success");
          }, 900);
        }

        return;
      }

      event.preventDefault();

      setPendingAction({
        cancelLabel: form.dataset.cancelLabel ?? t("feedback.confirm.cancel", "ko"),
        confirmLabel: form.dataset.confirmLabel ?? t("feedback.confirm.confirm", "ko"),
        form,
        message: form.dataset.confirmMessage ?? t("feedback.confirm.default", "ko"),
        pendingMessage: form.dataset.pendingMessage ?? t("feedback.pending.default", "ko"),
        successMessage: form.dataset.successMessage ?? "",
        title: form.dataset.confirmTitle ?? t("feedback.confirm.title", "ko"),
        tone: readTone(form.dataset.confirmTone),
      });
    }

    window.addEventListener("b2bb2g:toast", handleToast);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      window.removeEventListener("b2bb2g:toast", handleToast);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  function closeModal() {
    setPendingAction(null);
  }

  function confirmAction() {
    if (!pendingAction) {
      return;
    }

    const { form } = pendingAction;
    confirmedForms.current.add(form);
    setPendingAction(null);
    form.requestSubmit();
  }

  return (
    <>
      <div className="action-toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`action-toast action-toast-${toast.tone}`} key={toast.id}>
            <span className="action-toast-dot" aria-hidden="true" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {pendingAction ? (
        <div className="action-confirm-overlay" role="presentation">
          <button
            aria-label={t("feedback.confirm.close", "ko")}
            className="action-confirm-backdrop"
            onClick={closeModal}
            type="button"
          />
          <section
            aria-modal="true"
            className={`action-confirm-dialog action-confirm-${pendingAction.tone}`}
            role="dialog"
          >
            <div>
              <p className="action-confirm-eyebrow">
                {t("feedback.confirm.eyebrow", "ko")}
              </p>
              <h2 className="action-confirm-title">{pendingAction.title}</h2>
              <p className="action-confirm-message">{pendingAction.message}</p>
            </div>
            <div className="action-confirm-actions">
              <button className="action-confirm-cancel" onClick={closeModal} type="button">
                {pendingAction.cancelLabel}
              </button>
              <button className="action-confirm-submit" onClick={confirmAction} type="button">
                {pendingAction.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
