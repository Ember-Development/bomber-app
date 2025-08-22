export type ColumnDef<T> = {
  header: string;
  accessor: (row: T) => unknown;
  format?: (value: unknown, row: T) => string;
};

export type ExportOptions = {
  filenameBase?: string;
};

/** Public API: Export rows to CSV (UTF-8 + BOM so Excel displays correctly). */
export function exportCSV<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  opts?: ExportOptions
) {
  const headers = columns.map((c) => c.header);
  const data = rows.map((r) =>
    columns.map((c) => {
      const raw = c.accessor(r);
      const v = c.format ? c.format(raw, r) : normalize(raw);
      return v;
    })
  );

  const csv = [headers, ...data]
    .map((row) => row.map(csvEscape).join(','))
    .join('\r\n');

  // Prepend BOM for Excel
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });

  const name = (opts?.filenameBase ?? defaultBase()) + '.csv';
  downloadBlob(name, blob);
}

/** Public API: Export rows to legacy Excel (.xls) via SpreadsheetML (compatible w/ Excel/Numbers/Sheets). */
export function exportXLS<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  opts?: ExportOptions
) {
  const headers = columns.map((c) => c.header);
  const data = rows.map((r) =>
    columns.map((c) => {
      const raw = c.accessor(r);
      const v = c.format ? c.format(raw, r) : normalize(raw);
      return v;
    })
  );

  const xmlHeader = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Sheet1">
    <Table>`;

  const xmlFooter = `
    </Table>
  </Worksheet>
</Workbook>`;

  const rowXml = (cells: string[]) =>
    `<Row>${cells
      .map((c) => `<Cell><Data ss:Type="String">${xmlEscape(c)}</Data></Cell>`)
      .join('')}</Row>`;

  const sheet = [
    xmlHeader,
    rowXml(headers),
    ...data.map((r) => rowXml(r)),
    xmlFooter,
  ].join('');

  const blob = new Blob([sheet], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });

  const name = (opts?.filenameBase ?? defaultBase()) + '.xls';
  downloadBlob(name, blob);
}

/* ---------------- internal helpers ---------------- */

function defaultBase() {
  return `export-${new Date().toISOString().slice(0, 10)}`;
}

function normalize(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
}

function csvEscape(field: string): string {
  const needsQuote = /[",\n]/.test(field);
  const escaped = field.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadBlob(filename: string, blob: Blob) {
  // Guard for SSR (not needed on CRA/Vite client)
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
