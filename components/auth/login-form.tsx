"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordField } from "@/components/auth/password-field";
import { signIn } from "@/lib/actions/auth";
import { t } from "@/lib/i18n/translation";

const SAVED_EMAIL_KEY = "b2bb2g.login.savedEmail";
const SAVE_ID_KEY = "b2bb2g.login.saveId";
const AUTO_LOGIN_KEY = "b2bb2g.login.autoLogin";

function getStoredBoolean(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(key) === "true";
}

function getInitialAutoLogin(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const storedValue = window.localStorage.getItem(AUTO_LOGIN_KEY);

  return storedValue === null ? true : storedValue === "true";
}

function getInitialEmail(): string {
  if (typeof window === "undefined" || !getStoredBoolean(SAVE_ID_KEY)) {
    return "";
  }

  return window.localStorage.getItem(SAVED_EMAIL_KEY) ?? "";
}

export function LoginForm() {
  const [email, setEmail] = useState(getInitialEmail);
  const [saveId, setSaveId] = useState(() => getStoredBoolean(SAVE_ID_KEY));
  const [autoLogin, setAutoLogin] = useState(getInitialAutoLogin);

  function handleSubmit() {
    window.localStorage.setItem(AUTO_LOGIN_KEY, String(autoLogin));

    if (saveId && email) {
      window.localStorage.setItem(SAVE_ID_KEY, "true");
      window.localStorage.setItem(SAVED_EMAIL_KEY, email);
      return;
    }

    window.localStorage.removeItem(SAVE_ID_KEY);
    window.localStorage.removeItem(SAVED_EMAIL_KEY);
  }

  return (
    <form action={signIn} className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <input name="rememberSession" type="hidden" value={autoLogin ? "on" : "off"} />
      <div>
        <label className="type-caption-strong text-calm-ink" htmlFor="login-email">
          {t("auth.email")}
        </label>
        <input
          autoComplete="username"
          className="type-body mt-2 min-h-11 w-full rounded-[8px] border border-calm-hairline bg-white px-4 text-calm-ink outline-none transition focus:border-action-blue"
          id="login-email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("auth.email.placeholder")}
          required
          type="email"
          value={email}
        />
      </div>
      <PasswordField
        autoComplete="current-password"
        id="login-password"
        labelKey="auth.password"
        name="password"
        placeholderKey="auth.password.placeholder"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="group flex cursor-pointer items-start gap-3 rounded-[8px] border border-calm-hairline bg-white p-4 transition hover:border-action-blue/50">
          <input
            checked={saveId}
            className="mt-1 size-4 accent-action-blue"
            onChange={(event) => setSaveId(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="type-caption-strong block text-calm-ink">{t("auth.login.saveId")}</span>
            <span className="type-caption mt-1 block text-calm-ink-muted-80">
              {t("auth.login.saveId.description")}
            </span>
          </span>
        </label>
        <label className="group flex cursor-pointer items-start gap-3 rounded-[8px] border border-calm-hairline bg-white p-4 transition hover:border-action-blue/50">
          <input
            checked={autoLogin}
            className="mt-1 size-4 accent-action-blue"
            onChange={(event) => setAutoLogin(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="type-caption-strong block text-calm-ink">{t("auth.login.autoLogin")}</span>
            <span className="type-caption mt-1 block text-calm-ink-muted-80">
              {t("auth.login.autoLogin.description")}
            </span>
          </span>
        </label>
      </div>
      <div className="flex items-center justify-between gap-4">
        <Link className="type-button-utility text-action-blue" href="/signup">
          {t("auth.login.createAccount")}
        </Link>
        <Link className="type-button-utility text-calm-ink-muted-80 hover:text-calm-ink" href="/notice">
          {t("auth.login.help")}
        </Link>
      </div>
      <button className="pill-primary w-full" type="submit">
        {t("auth.login.submit")}
      </button>
    </form>
  );
}
