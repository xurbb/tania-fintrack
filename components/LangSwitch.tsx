"use client";

import { useLang, Lang } from "@/lib/i18n";

export default function LangSwitch({ compact, light }: { compact?: boolean; light?: boolean }) {
  const { lang, setLang, t } = useLang();
  return (
    <div
      className={`lang-switch ${compact ? "compact" : ""} ${light ? "light" : ""}`}
      role="group"
      aria-label={t("Bahasa")}
    >
      {(["id", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          className={`lang-btn ${lang === l ? "active" : ""}`}
          onClick={() => setLang(l)}
          title={l === "id" ? t("Indonesia") : t("Inggris")}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
