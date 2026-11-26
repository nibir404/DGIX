/** Build a CSV that Excel, Numbers and Google Sheets all open correctly, and download it. */

type Cell = string | number | boolean | null | undefined;

const escape = (v: Cell) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Quote anything with a comma, quote, newline or leading/trailing space; double inner quotes.
  return /[",\n\r]|^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(header: string[], rows: Cell[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

/** Download rows as a CSV file. A UTF-8 byte-order mark keeps Excel from garbling non-ASCII text. */
export function downloadCsv(filename: string, header: string[], rows: Cell[][]) {
  const blob = new Blob(["﻿" + toCsv(header, rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Today's date as YYYY-MM-DD, for file names. */
export const stamp = () => new Date().toISOString().slice(0, 10);
