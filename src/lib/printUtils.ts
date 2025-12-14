/**
 * Generates print-friendly HTML for reports
 */

interface PrintTableColumn {
  label: string;
  value: string;
}

interface PrintTableOptions<T> {
  title: string;
  columns: PrintTableColumn[];
  data: T[];
  getFieldValue: (item: T, field: string) => string;
}

/**
 * Generates a print-friendly HTML document with a table
 * @param options - Configuration for the print table
 * @returns HTML string ready for printing
 */
export function generatePrintHTML<T>(options: PrintTableOptions<T>): string {
  const { title, columns, data, getFieldValue } = options;

  const headerCells = columns
    .map((column) => `<th>${column.label}</th>`)
    .join("");

  const bodyRows = data
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          ${columns
            .map((column) => {
              const value = getFieldValue(item, column.value);
              return `<td>${
                value === "//" ? '<span class="empty-value">-</span>' : value
              }</td>`;
            })
            .join("")}
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            padding: 20px;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: center;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #333;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          @media print {
            body {
              padding: 10px;
            }
            h1 {
              font-size: 18px;
              margin-bottom: 15px;
            }
            table {
              font-size: 12px;
            }
            th, td {
              padding: 6px 4px;
            }
          }
          .empty-value {
            color: #999;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              <th>ت.</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

/**
 * Opens a print window with the provided HTML content
 * @param html - HTML string to print
 * @returns Promise that resolves when print dialog is opened
 */
export function openPrintWindow(html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      reject(new Error("Failed to open print window"));
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      resolve();
    };
  });
}
