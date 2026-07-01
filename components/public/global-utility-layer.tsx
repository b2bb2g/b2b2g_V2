"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n/translation";

const COOKIE_STORAGE_KEY = "b2bb2g_cookie_consent_v1";

type CookieConsent = {
  analytics: boolean;
  functional: boolean;
  necessary: true;
  savedAt: string;
};

function readStoredConsent(): CookieConsent | null {
  try {
    const storedValue = window.localStorage.getItem(COOKIE_STORAGE_KEY);
    return storedValue ? (JSON.parse(storedValue) as CookieConsent) : null;
  } catch {
    return null;
  }
}

function createConsent({
  analytics,
  functional,
}: Readonly<{
  analytics: boolean;
  functional: boolean;
}>): CookieConsent {
  return {
    analytics,
    functional,
    necessary: true,
    savedAt: new Date().toISOString(),
  };
}

export function GlobalUtilityLayer() {
  const [cookiePanelOpen, setCookiePanelOpen] = useState(false);
  const [isConsentVisible, setIsConsentVisible] = useState(false);
  const [isTopButtonVisible, setIsTopButtonVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsTopButtonVisible(window.scrollY > 420);
    }

    const consentTimer = window.setTimeout(() => {
      setIsConsentVisible(!readStoredConsent());
    }, 0);
    const scrollTimer = window.setTimeout(handleScroll, 0);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.clearTimeout(consentTimer);
      window.clearTimeout(scrollTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function saveConsent(consent: CookieConsent) {
    window.localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consent));
    setCookiePanelOpen(false);
    setIsConsentVisible(false);
  }

  function handleBackToTop() {
    window.scrollTo({ behavior: "smooth", top: 0 });
  }

  return (
    <>
      <button
        aria-label={t("utility.backToTop")}
        className={`fixed right-5 z-[80] inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-[20px] font-bold text-slate-900 shadow-[0_18px_46px_rgb(43_67_104_/_18%)] backdrop-blur-xl transition duration-200 hover:text-action-blue ${
          isConsentVisible ? "bottom-[172px] sm:bottom-[152px]" : "bottom-5"
        } ${isTopButtonVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
        onClick={handleBackToTop}
        type="button"
      >
        <span aria-hidden="true">↑</span>
      </button>

      {isConsentVisible ? (
        <section
          className="fixed inset-x-3 bottom-3 z-[70] mx-auto grid max-w-[420px] gap-3 rounded-[20px] border border-slate-200/80 bg-white/95 p-3 shadow-[0_18px_54px_rgb(43_67_104_/_18%)] backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:mx-0 sm:w-[420px]"
          aria-label={t("cookie.title")}
        >
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold leading-tight text-action-blue">{t("cookie.eyebrow")}</p>
                <h2 className="mt-1 text-[15px] font-bold leading-tight text-calm-ink">{t("cookie.title")}</h2>
              </div>
              <button
                className="shrink-0 rounded-full px-2 py-1 text-[12px] font-bold text-calm-ink-muted-80 transition hover:bg-slate-100 hover:text-action-blue"
                onClick={() => saveConsent(createConsent({ analytics: false, functional: false }))}
                type="button"
              >
                Later
              </button>
            </div>
            <p className="mt-2 text-[12px] leading-5 text-calm-ink-muted-80">{t("cookie.description")}</p>
            {cookiePanelOpen ? (
              <div className="mt-3 grid gap-2">
                <span className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-5 text-calm-ink-muted-80">{t("cookie.option.necessary")}</span>
                <span className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-5 text-calm-ink-muted-80">{t("cookie.option.functional")}</span>
                <span className="rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-5 text-calm-ink-muted-80">{t("cookie.option.analytics")}</span>
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3">
              <Link className="text-[11px] font-bold text-action-blue hover:text-action-blue-focus" href="/cookies">
                {t("cookie.policyLink")}
              </Link>
              <Link className="text-[11px] font-bold text-action-blue hover:text-action-blue-focus" href="/privacy">
                {t("legal.privacy.title")}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className="inline-flex min-h-9 items-center justify-center rounded-full bg-action-blue px-4 text-[12px] font-bold text-white transition hover:bg-action-blue-focus"
              onClick={() => saveConsent(createConsent({ analytics: true, functional: true }))}
              type="button"
            >
              {t("cookie.acceptAll")}
            </button>
            <button
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-action-blue/20 bg-white px-4 text-[12px] font-bold text-action-blue transition hover:bg-action-blue/5"
              onClick={() => saveConsent(createConsent({ analytics: false, functional: false }))}
              type="button"
            >
              {t("cookie.necessaryOnly")}
            </button>
            <button
              className="col-span-2 text-center text-[12px] font-bold text-calm-ink-muted-80 transition hover:text-action-blue"
              onClick={() => setCookiePanelOpen((current) => !current)}
              type="button"
            >
              {cookiePanelOpen ? t("cookie.hideSettings") : t("cookie.manage")}
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
