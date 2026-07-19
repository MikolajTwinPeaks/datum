/** Dependency-free CSV building + browser download. */

export type CsvValue = string | number;

/** Quote a field when it contains a comma, quote or newline; escape inner quotes. */
function escapeField(value: CsvValue): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Serialise a header + rows into CSV text (CRLF line endings, trailing newline). */
export function buildCsv(header: string[], rows: CsvValue[][]): string {
  const lines = [header, ...rows].map((row) => row.map(escapeField).join(','));
  return `${lines.join('\r\n')}\r\n`;
}

/** Build a CSV and trigger a file download in the browser. */
export function downloadCsv(filename: string, header: string[], rows: CsvValue[][]): void {
  const csv = buildCsv(header, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
