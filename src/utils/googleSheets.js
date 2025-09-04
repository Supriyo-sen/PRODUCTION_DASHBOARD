// const SHEET_ID = "1CxNyZLPEJ9NEPJ1xs5VkExKAgvEOr9SY5WgkrnjdvU0"; // Replace with your Google Sheet ID
const API_KEY = "AIzaSyDf6yf24YiBFjU-M9HrvfZEkmOKsIgqnqo"; // Replace with your API key

// utils/googleSheets.js
// utils/googleSheets.js
// move to env on server for production

export async function fetchSheetData(sheetId, range) {
  console.log(range);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
    range
  )}?key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.values || [];
  } catch (err) {
    console.error("Sheets fetch error:", err);
    return [];
  }
}

/** Robust date → ISO (YYYY-MM-DD).
 * Accepts: "31/07/2025", "31-07-2025", "2025-07-31"
 */
export function formatDateToISO(d) {
  if (!d) return "";
  const s = String(d).trim();

  // YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // DD/MM/YYYY or DD-MM-YYYY
  m = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  return s; // fallback
}
