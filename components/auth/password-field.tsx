"use client";

import { useId, useState } from "react";
import { t } from "@/lib/i18n/translation";

type PasswordFieldProps = {
  autoComplete: string;
  id?: string;
  labelKey: string;
  name: string;
  placeholderKey: string;
};

export function PasswordField({
  autoComplete,
  id,
  labelKey,
  name,
  placeholderKey,
}: Readonly<PasswordFieldProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <label className="type-caption-strong text-calm-ink" htmlFor={inputId}>
        {t(labelKey)}
      </label>
      <div className="mt-2 flex min-h-11 overflow-hidden rounded-[8px] border border-calm-hairline bg-white focus-within:border-action-blue">
        <input
          autoComplete={autoComplete}
          className="type-body min-h-11 flex-1 px-4 text-calm-ink outline-none"
          id={inputId}
          name={name}
          placeholder={t(placeholderKey)}
          required
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-pressed={isVisible}
          className="type-button-utility border-l border-calm-hairline px-4 text-action-blue transition hover:bg-canvas-parchment"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? t("auth.password.hide") : t("auth.password.show")}
        </button>
      </div>
    </div>
  );
}
