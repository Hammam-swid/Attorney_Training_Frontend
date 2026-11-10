/**
 * Printing of reports.
 *
 * - Every printed report uses the program's visual identity (logo, royal blue
 *   and gold, center name, print date, page numbers).
 * - Printing happens inside a hidden iframe in the current page: no new tab or
 *   window is opened.
 */
import { NOTE_FLAG_STYLES, noteFlagOf } from "./noteFlag";
import { NoteFlag } from "@/types";

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export const BRAND = {
  centerName: "مركز البحوث الجنائية والتدريب",
  systemName: "منظومة إدارة التدريب",
  primary: "#1E3A8A", // --primary
  primaryDark: "#172E6E",
  gold: "#D4AF37", // --accent
  goldSoft: "#F5EFD9", // --secondary
  goldLine: "#E8D9A8",
  ink: "#1A1D2B", // --foreground
  muted: "#5B5440", // --muted-foreground
  border: "#D6D1C4", // --border
  /** center logo (same as the sidebar / login page) */
  logo: "/center-logo.png",
  /** Attorney General Office emblem */
  sealLogo: "/logo.svg",
};

const absoluteUrl = (path: string) =>
  typeof window !== "undefined" ? new URL(path, window.location.origin).href : path;

const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const printDate = () =>
  new Intl.DateTimeFormat("ar-LY-u-nu-latn", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

export const noteLegendHtml = () =>
  `<div class="legend"><span class="legend-title">دلالة الألوان على الاسم:</span>${Object.values(
    NOTE_FLAG_STYLES,
  )
    .map((s) => `<span class="legend-chip" style="background:${s.printBg}">${s.label}</span>`)
    .join("")}</div>`;

/** background style for the name cell of a trainee flagged in notes (منتقل / منتدب) */
export const nameCellStyle = (
  t?: { notes?: string | null; noteFlag?: NoteFlag } | null,
) => {
  const flag = noteFlagOf(t);
  return flag
    ? `background:${NOTE_FLAG_STYLES[flag].printBg};font-weight:bold`
    : undefined;
};

const brandCss = `
  @page {
    size: A4;
    margin: 14mm 12mm 16mm;
    @bottom-center {
      content: "صفحة " counter(page) " من " counter(pages);
      font-family: Tahoma, "Segoe UI", Arial, sans-serif;
      font-size: 9pt;
      color: ${BRAND.muted};
    }
  }
  @page landscape { size: A4 landscape; }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    font-family: "Segoe UI", Tahoma, "Noto Naskh Arabic", Arial, sans-serif;
    direction: rtl;
    color: ${BRAND.ink};
    font-size: 11pt;
    line-height: 1.5;
  }

  /* ---------- header ---------- */
  .report-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 10px;
    border-bottom: 3px solid ${BRAND.primary};
    position: relative;
  }
  .report-header::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    bottom: -7px;
    height: 2px;
    background: ${BRAND.gold};
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-text { display: flex; flex-direction: column; gap: 2px; }
  .brand-name { font-size: 15pt; font-weight: 700; color: ${BRAND.primary}; }
  .brand-system { font-size: 10pt; color: ${BRAND.muted}; }
  /* center-logo.png is a portrait page with white margins: show only the mark */
  .center-logo { width: 104px; height: 74px; overflow: hidden; position: relative; flex: none; }
  .center-logo img { position: absolute; width: 128px; height: auto; top: -54px; right: -10px; }
  .seal-logo { height: 52px; width: auto; }
  .report-meta { font-size: 9pt; color: ${BRAND.muted}; text-align: start; }

  .report-title {
    margin: 22px 0 6px;
    text-align: center;
    font-size: 16pt;
    font-weight: 700;
    color: ${BRAND.primary};
  }
  .report-subtitles {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px 10px;
    margin: 0 0 12px;
  }
  .report-subtitles span {
    background: ${BRAND.goldSoft};
    border: 1px solid ${BRAND.goldLine};
    border-radius: 999px;
    padding: 2px 10px;
    font-size: 9.5pt;
    color: ${BRAND.ink};
  }

  .legend {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    font-size: 9pt;
    color: ${BRAND.muted};
    margin-bottom: 10px;
  }
  .legend-chip { padding: 1px 10px; border-radius: 4px; color: ${BRAND.ink}; }

  /* ---------- tables ---------- */
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  th {
    background: ${BRAND.primary};
    color: #fff;
    font-weight: 600;
    padding: 7px 6px;
    border: 1px solid ${BRAND.primaryDark};
    text-align: center;
  }
  td {
    padding: 6px;
    border: 1px solid ${BRAND.border};
    text-align: center;
    vertical-align: middle;
  }
  tbody tr:nth-child(even) td { background-color: #FAF8F1; }
  td.index-cell, th.index-cell { width: 34px; color: ${BRAND.muted}; }
  th.index-cell { color: #fff; }
  .empty-value { color: #A8A29A; }
  .sums-row td {
    background: ${BRAND.goldSoft} !important;
    border-top: 2px solid ${BRAND.gold};
    font-weight: 700;
  }

  /* ---------- grouped report ---------- */
  .group { margin-top: 18px; break-inside: auto; }
  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 7px 12px;
    background: ${BRAND.primary};
    color: #fff;
    font-size: 11.5pt;
    border-radius: 6px 6px 0 0;
    border-bottom: 3px solid ${BRAND.gold};
    break-after: avoid;
  }
  .group-index {
    background: ${BRAND.gold};
    color: ${BRAND.ink};
    border-radius: 999px;
    min-width: 24px;
    padding: 0 6px;
    text-align: center;
    font-size: 10pt;
  }
  .group-details {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 18px;
    padding: 6px 12px;
    font-size: 9pt;
    background: ${BRAND.goldSoft};
    border: 1px solid ${BRAND.goldLine};
    border-top: 0;
    break-after: avoid;
  }

  /* ---------- footer (last page) ---------- */
  .report-footer {
    margin-top: 18px;
    padding-top: 6px;
    border-top: 1px solid ${BRAND.goldLine};
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    color: ${BRAND.muted};
  }
`;

/** full branded document around a report body */
function brandDocument(options: {
  title: string;
  subtitleLines?: string[];
  showNoteLegend?: boolean;
  body: string;
  landscape?: boolean;
}) {
  const { title, subtitleLines = [], showNoteLegend, body, landscape } = options;
  const date = printDate();
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8">
    <title>${escapeHtml(title)}</title>
    <style>${brandCss}${landscape ? "body { page: landscape; }" : ""}</style>
  </head>
  <body>
    <header class="report-header">
      <div class="brand">
        <div class="center-logo"><img src="${absoluteUrl(BRAND.logo)}" alt="${BRAND.centerName}"></div>
        <div class="brand-text">
          <span class="brand-name">${BRAND.centerName}</span>
          <span class="brand-system">${BRAND.systemName}</span>
        </div>
      </div>
      <img class="seal-logo" src="${absoluteUrl(BRAND.sealLogo)}" alt="مكتب النائب العام">
    </header>
    <div class="report-meta">تاريخ الطباعة: ${date}</div>
    <h1 class="report-title">${escapeHtml(title)}</h1>
    ${
      subtitleLines.filter(Boolean).length
        ? `<div class="report-subtitles">${subtitleLines
            .filter(Boolean)
            .map((l) => `<span>${escapeHtml(l)}</span>`)
            .join("")}</div>`
        : ""
    }
    ${showNoteLegend ? noteLegendHtml() : ""}
    ${body}
    <footer class="report-footer">
      <span>${BRAND.centerName} — ${BRAND.systemName}</span>
      <span>${date}</span>
    </footer>
  </body>
</html>`;
}

// ---------------------------------------------------------------------------
// Single table report
// ---------------------------------------------------------------------------

interface PrintTableColumn {
  label: string;
  value: string;
}

interface PrintTableOptions<T> {
  title: string;
  columns: PrintTableColumn[];
  data: T[];
  getFieldValue: (item: T, field: string) => string;
  sumsRow?: Record<string, string>;
  /** extra lines shown under the title (filters, counts, trainee info ...) */
  subtitleLines?: string[];
  /** inline css for a cell, e.g. to color the name of a transferred trainee */
  getCellStyle?: (item: T, field: string) => string | undefined;
  /** shows the notes colors legend */
  showNoteLegend?: boolean;
  /** landscape page; defaults to landscape when there are more than 7 columns */
  landscape?: boolean;
}

/**
 * Generates a branded print document with a table.
 * Cell values are inserted as HTML (as before), so callers may pass markup.
 */
export function generatePrintHTML<T>(options: PrintTableOptions<T>): string {
  const { title, columns, data, getFieldValue, getCellStyle } = options;

  const headerCells = columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");

  const bodyRows = data
    .map(
      (item, index) => `<tr>
          <td class="index-cell">${index + 1}</td>
          ${columns
            .map((column) => {
              const value = getFieldValue(item, column.value);
              const style = getCellStyle?.(item, column.value);
              return `<td${style ? ` style="${style}"` : ""}>${
                value === "//" || value === "" || value == null
                  ? '<span class="empty-value">—</span>'
                  : value
              }</td>`;
            })
            .join("")}
        </tr>`,
    )
    .join("");

  const sumsRowHtml = options.sumsRow
    ? `<tr class="sums-row">
        <td class="index-cell">المجموع</td>
        ${columns.map((column) => `<td>${options.sumsRow?.[column.value] || ""}</td>`).join("")}
      </tr>`
    : "";

  return brandDocument({
    title,
    subtitleLines: options.subtitleLines,
    showNoteLegend: options.showNoteLegend,
    landscape: options.landscape ?? columns.length > 7,
    body: `<table>
        <thead><tr><th class="index-cell">ت.</th>${headerCells}</tr></thead>
        <tbody>${bodyRows}${sumsRowHtml}</tbody>
      </table>`,
  });
}

// ---------------------------------------------------------------------------
// Grouped report (e.g. each activity followed by its trainees)
// ---------------------------------------------------------------------------

export interface PrintGroup<T> {
  title: string;
  /** detail lines of the group (dates, hours, instructors ...) */
  details: string[];
  rows: T[];
}

export function generateGroupedPrintHTML<T>(options: {
  title: string;
  subtitleLines?: string[];
  columns: PrintTableColumn[];
  groups: PrintGroup<T>[];
  getFieldValue: (item: T, field: string) => string;
  getCellStyle?: (item: T, field: string) => string | undefined;
  showNoteLegend?: boolean;
  emptyMessage?: string;
  landscape?: boolean;
}) {
  const { title, columns, groups, getFieldValue, getCellStyle } = options;
  const header = `<tr><th class="index-cell">ت.</th>${columns
    .map((c) => `<th>${escapeHtml(c.label)}</th>`)
    .join("")}</tr>`;

  const body = groups
    .map(
      (g, gi) => `<section class="group">
        <h2 class="group-title"><span class="group-index">${gi + 1}</span>${escapeHtml(g.title)}</h2>
        <div class="group-details">${g.details
          .map((d) => `<span>${escapeHtml(d)}</span>`)
          .join("")}</div>
        <table>
          <thead>${header}</thead>
          <tbody>
            ${
              g.rows.length
                ? g.rows
                    .map(
                      (row, i) =>
                        `<tr><td class="index-cell">${i + 1}</td>${columns
                          .map((c) => {
                            const style = getCellStyle?.(row, c.value);
                            const value = getFieldValue(row, c.value);
                            return `<td${style ? ` style="${style}"` : ""}>${
                              value === "-" || value === "" ? '<span class="empty-value">—</span>' : escapeHtml(value)
                            }</td>`;
                          })
                          .join("")}</tr>`,
                    )
                    .join("")
                : `<tr><td colspan="${columns.length + 1}" class="empty-value">${
                    options.emptyMessage ?? "لا يوجد متدربون"
                  }</td></tr>`
            }
          </tbody>
        </table>
      </section>`,
    )
    .join("");

  return brandDocument({
    title,
    subtitleLines: options.subtitleLines,
    showNoteLegend: options.showNoteLegend,
    landscape: options.landscape ?? columns.length > 7,
    body,
  });
}

// ---------------------------------------------------------------------------
// Printing without opening a new window
// ---------------------------------------------------------------------------

let activeFrame: HTMLIFrameElement | null = null;

const waitForImages = (doc: Document, timeoutMs = 3000) =>
  Promise.race([
    Promise.all(
      Array.from(doc.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    ),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);

/**
 * Prints the given HTML document from a hidden iframe inside the current page
 * (the browser's print dialog opens directly, no new tab / window).
 */
export function printHTML(html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // a previous print that is still around
    activeFrame?.remove();

    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.setAttribute("tabindex", "-1");
    // must stay "displayed" (not display:none) or some browsers print a blank page
    Object.assign(frame.style, {
      position: "fixed",
      insetInlineEnd: "0",
      bottom: "0",
      width: "0",
      height: "0",
      border: "0",
      opacity: "0",
      pointerEvents: "none",
    });
    activeFrame = frame;

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      // let the print job finish reading the document before removing it
      setTimeout(() => {
        frame.remove();
        if (activeFrame === frame) activeFrame = null;
      }, 1000);
    };

    frame.onload = async () => {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      if (!win || !doc) {
        cleanup();
        reject(new Error("Failed to prepare the print frame"));
        return;
      }
      try {
        await waitForImages(doc);
        if (doc.fonts?.ready) await doc.fonts.ready;
        win.addEventListener("afterprint", cleanup, { once: true });
        win.focus();
        win.print(); // blocks in most browsers until the dialog is closed
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        // fallback for browsers that never fire afterprint
        setTimeout(cleanup, 60_000);
      }
    };

    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}

/**
 * Kept for backward compatibility: all report pages call this.
 * It no longer opens a window, it prints in place.
 */
export const openPrintWindow = printHTML;
