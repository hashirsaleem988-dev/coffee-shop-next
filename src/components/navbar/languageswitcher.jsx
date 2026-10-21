"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import "./language-switcher.css";

function LanguageSwitcher() {
  const t = useTranslations("language");
  const [locale, setLocale] = useState("en");

  useEffect(() => {
  const frame = window.requestAnimationFrame(() => {
    const savedLocale = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];

    if (savedLocale === "ar" || savedLocale === "en") {
      setLocale(savedLocale);
    }
  });

  return () => window.cancelAnimationFrame(frame);
}, []);

  const changeLanguage = (nextLocale) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
    setLocale(nextLocale);
    window.location.reload();
  };

  return (
    <div className="language-switcher" aria-label={t("label")}>
      <button
        type="button"
        className={locale === "en" ? "is-active" : ""}
        aria-pressed={locale === "en"}
        onClick={() => changeLanguage("en")}
      >
        EN
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        className={locale === "ar" ? "is-active" : ""}
        aria-pressed={locale === "ar"}
        onClick={() => changeLanguage("ar")}
      >
        AR
      </button>
    </div>
  );
}

export default LanguageSwitcher;
