import * as Localization from "expo-localization";

let cachedLocale: string | null = null;

/**
 * Get user's locale efficiently with caching
 * Returns locale in format: "en", "es", "fr", etc.
 * 
 * Example usage:
 * ```typescript
 * const locale = getUserLocale();
 * // Use in queries
 * const data = useQuery(api.some.query, { locale });
 * ```
 */
export function getUserLocale(): string {
  if (cachedLocale) {
    return cachedLocale;
  }

  // Get device locale (e.g., "en-US", "es-MX")
  const deviceLocale = Localization.getLocales()[0]?.languageCode || "en";
  
  // Cache it for future calls
  cachedLocale = deviceLocale;
  
  return deviceLocale;
}

/**
 * Clear cached locale (useful for testing or if user changes language)
 */
export function clearLocaleCache(): void {
  cachedLocale = null;
}
