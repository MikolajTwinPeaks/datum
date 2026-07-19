/** Number formatting. Decimals always use a period; thousands a thin space. */

const THIN_SPACE = ' ';

/** Group thousands with a thin space: 384100 -> "384 100". */
export function thousands(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
}

/** Fixed-decimal string with a period separator: decimal(98.7, 1) -> "98.7". */
export function decimal(value: number, digits = 1): string {
  return value.toFixed(digits);
}

/** Zero-padded two-digit integer: pad2(4) -> "04". */
export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Seconds -> "HH:MM:SS". */
export function clockString(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}
