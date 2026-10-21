import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const supportedLocales = ["en", "ar"];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = supportedLocales.includes(requestedLocale)
    ? requestedLocale
    : "en";

  const messages =
    locale === "ar"
      ? (await import("../messages/ar.json")).default
      : (await import("../messages/en.json")).default;

  return { locale, messages };
});
