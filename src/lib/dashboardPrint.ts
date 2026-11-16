/**
 * Organized, branded print of the dashboard (instead of printing the screen):
 * key figures, then each statistic as a small table with bars, laid out for A4.
 */
import { BRAND, brandDocument, escapeHtml } from "./printUtils";

export interface DashboardPrintData {
  /** undefined = all years */
  year?: number;
  /** year used by the "per month" section */
  monthsYear: number;
  statistics?: {
    activitiesCount: number;
    traineesCount: number;
    instructorsCount: number;
    organizationsCount: number;
  };
  activitiesPerType: { name: string; activities: number }[];
  activitiesPerMonth: { month: string; activities: number }[];
  traineesPerType: { name: string | null; traineeCount: number | string }[];
  topInstructors: { name: string; avgRating?: number | string | null }[];
}

const num = (v: unknown) => Number(v) || 0;
const fmt = (v: unknown) => num(v).toLocaleString("ar-LY-u-nu-latn");

const dashboardCss = `
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 6px 0 18px; }
  .kpi {
    border: 1px solid ${BRAND.goldLine};
    border-top: 4px solid ${BRAND.primary};
    border-radius: 8px;
    padding: 10px 12px;
    background: #fff;
    break-inside: avoid;
  }
  .kpi-label { font-size: 9.5pt; color: ${BRAND.muted}; }
  .kpi-value { font-size: 20pt; font-weight: 700; color: ${BRAND.primary}; line-height: 1.3; }

  .sections { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .section {
    border: 1px solid ${BRAND.border};
    border-radius: 8px;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .section.wide { grid-column: 1 / -1; }
  .section h2 {
    margin: 0;
    padding: 7px 12px;
    font-size: 11pt;
    color: #fff;
    background: ${BRAND.primary};
    border-bottom: 3px solid ${BRAND.gold};
  }
  .section .note { font-size: 8.5pt; color: ${BRAND.muted}; padding: 4px 12px 8px; }
  .section table { font-size: 9.5pt; }
  .section th { padding: 5px 6px; }
  .section td { padding: 5px 6px; }
  .section td.label { text-align: start; }
  .bar-cell { width: 40%; }
  .bar { height: 10px; border-radius: 3px; background: ${BRAND.primary}; min-width: 2px; }
  .bar.gold { background: ${BRAND.gold}; }
  .empty { padding: 14px; text-align: center; color: ${BRAND.muted}; font-size: 9.5pt; }

  /* monthly columns */
  .months { display: flex; align-items: flex-end; gap: 6px; height: 170px; padding: 14px 12px 4px; }
  .month { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
  .month .count { font-size: 8.5pt; font-weight: 700; color: ${BRAND.ink}; margin-bottom: 2px; }
  .month .col { width: 70%; background: ${BRAND.primary}; border-radius: 3px 3px 0 0; min-height: 1px; }
  .month .col.zero { background: ${BRAND.border}; }
  .month-names { display: flex; gap: 6px; padding: 0 12px 10px; border-top: 1px solid ${BRAND.border}; }
  .month-names span { flex: 1; text-align: center; font-size: 8pt; color: ${BRAND.muted}; padding-top: 4px; }

  .rank { display: inline-block; min-width: 22px; border-radius: 999px; background: ${BRAND.gold}; color: ${BRAND.ink}; font-weight: 700; font-size: 8.5pt; }
`;

/** rows with a share and a bar, largest first */
const barTable = (
  rows: { label: string; value: number }[],
  headers: [string, string],
  barClass = "",
) => {
  const total = rows.reduce((s, r) => s + r.value, 0);
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return `<div class="empty">لا توجد بيانات</div>`;
  return `<table>
    <thead><tr><th>${headers[0]}</th><th>${headers[1]}</th><th>النسبة</th><th class="bar-cell"></th></tr></thead>
    <tbody>
      ${[...rows]
        .sort((a, b) => b.value - a.value)
        .map(
          (r) => `<tr>
            <td class="label">${escapeHtml(r.label)}</td>
            <td>${fmt(r.value)}</td>
            <td>${total ? Math.round((r.value / total) * 100) : 0}%</td>
            <td class="bar-cell"><div class="bar ${barClass}" style="width:${(r.value / max) * 100}%"></div></td>
          </tr>`,
        )
        .join("")}
      <tr class="sums-row"><td class="label">المجموع</td><td>${fmt(total)}</td><td>100%</td><td></td></tr>
    </tbody>
  </table>`;
};

export function generateDashboardPrintHTML(d: DashboardPrintData) {
  const scope = d.year ? `السنة ${d.year}` : "كل السنوات";
  const s = d.statistics;

  const kpis = [
    ["إجمالي الأنشطة التدريبية", s?.activitiesCount],
    ["إجمالي المتدربين", s?.traineesCount],
    ["إجمالي المدربين", s?.instructorsCount],
    ["عدد الجهات المختصة", s?.organizationsCount],
  ]
    .map(
      ([label, value]) =>
        `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${fmt(value)}</div></div>`,
    )
    .join("");

  const maxMonth = Math.max(1, ...d.activitiesPerMonth.map((m) => num(m.activities)));
  const monthsTotal = d.activitiesPerMonth.reduce((t, m) => t + num(m.activities), 0);
  const months = d.activitiesPerMonth.length
    ? `<div class="months">${d.activitiesPerMonth
        .map((m) => {
          const v = num(m.activities);
          return `<div class="month"><span class="count">${v || ""}</span><div class="col ${v ? "" : "zero"}" style="height:${(v / maxMonth) * 100}%"></div></div>`;
        })
        .join("")}</div>
      <div class="month-names">${d.activitiesPerMonth
        .map((m) => `<span>${escapeHtml(m.month)}</span>`)
        .join("")}</div>`
    : `<div class="empty">لا توجد بيانات</div>`;

  const instructors = d.topInstructors.length
    ? `<table>
        <thead><tr><th>#</th><th>المدرب</th><th>متوسط التقييم</th></tr></thead>
        <tbody>${d.topInstructors
          .map(
            (i, idx) => `<tr>
              <td><span class="rank">${idx + 1}</span></td>
              <td class="label">${escapeHtml(i.name)}</td>
              <td>${i.avgRating ? num(i.avgRating).toFixed(2) : "لا يوجد تقييمات"}</td>
            </tr>`,
          )
          .join("")}</tbody>
      </table>`
    : `<div class="empty">لا توجد تقييمات</div>`;

  const body = `<style>${dashboardCss}</style>
    <div class="kpis">${kpis}</div>
    <div class="sections">
      <section class="section">
        <h2>الأنشطة حسب النوع — ${scope}</h2>
        ${barTable(
          d.activitiesPerType.map((t) => ({ label: t.name, value: num(t.activities) })),
          ["نوع النشاط", "عدد الأنشطة"],
        )}
      </section>
      <section class="section">
        <h2>المتدربون حسب الفئة — ${scope}</h2>
        ${barTable(
          d.traineesPerType.map((t) => ({ label: t.name ?? "غير معروف", value: num(t.traineeCount) })),
          ["الفئة", "عدد المتدربين"],
          "gold",
        )}
      </section>
      <section class="section wide">
        <h2>الأنشطة في كل شهر — ${d.monthsYear} (المجموع: ${fmt(monthsTotal)})</h2>
        ${months}
        <div class="note">حسب تاريخ بداية كل نشاط</div>
      </section>
      <section class="section wide">
        <h2>أعلى المدربين تقييماً — ${scope}</h2>
        ${instructors}
      </section>
    </div>`;

  return brandDocument({
    title: "لوحة الإحصائيات",
    subtitleLines: [`الفترة: ${scope}`],
    body,
  });
}
