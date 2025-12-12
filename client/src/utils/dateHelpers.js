// utils/dateHelpers.js

/**
 * Format date to readable string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Get days until expiry
 * @param {string|Date} expiryDate
 * @returns {number} Days remaining (negative if expired)
 */
export const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if document is expiring soon (within 30 days)
 * @param {string|Date} expiryDate
 * @returns {boolean}
 */
export const isExpiringSoon = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  return days !== null && days >= 0 && days <= 30;
};

/**
 * Check if document is expired
 * @param {string|Date} expiryDate
 * @returns {boolean}
 */
export const isExpired = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  return days !== null && days < 0;
};

/**
 * Format file size to human readable
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
