// utils/dateFormatter.js

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type (default: 'short')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "short") => {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "-";

  const options = {
    short: { year: "numeric", month: "short", day: "numeric" },
    long: { year: "numeric", month: "long", day: "numeric" },
    full: {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return d.toLocaleDateString("en-US", options[format] || options.short);
};

/**
 * Format date to YYYY-MM-DD
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateISO = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

/**
 * Check if date is expired
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if expired
 */
export const isExpired = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Get days until expiry
 * @param {string|Date} date - Expiry date
 * @returns {number} Number of days until expiry
 */
export const getDaysUntilExpiry = (date) => {
  if (!date) return null;
  const today = new Date();
  const expiry = new Date(date);
  const diff = expiry - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
