const SHEET_ID = "1CxNyZLPEJ9NEPJ1xs5VkExKAgvEOr9SY5WgkrnjdvU0"; // Replace with your Google Sheet ID
const API_KEY = "AIzaSyDf6yf24YiBFjU-M9HrvfZEkmOKsIgqnqo"; // Replace with your API key

export async function fetchSheetData(range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return [];
  }
}

// Utility function to convert date format
export function formatDateToISO(dateString) {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd
}

// Example usage:
// const formattedDate = formatDateToISO("31/07/2025");
