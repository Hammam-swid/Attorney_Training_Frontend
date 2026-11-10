/** same normalization as the backend (src/utils/normalize-name.ts) */
export const normalizeName = (value?: string | null) =>
  (value ?? "")
    .replace(/[ً-ْٰ]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[​-‏ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s.,،;:\-_/\\]+|[\s.,،;:\-_/\\]+$/g, "")
    .trim()
    .toLowerCase();
