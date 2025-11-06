/**
 * branding.js
 * ------------------------------------------------------------
 * Centralized branding constants for the FoodPoint platform.
 *
 * This module provides:
 * - Brand identity details such as name, tagline, and highlight.
 * - Static assets for dark/light logos and key illustrations.
 *
 * Having a single branding source ensures consistent usage across
 * headers, login screens, dashboards, and marketing pages.
 * ------------------------------------------------------------
 */

/**
 * @constant {Object} BRAND
 * @description Defines core brand identity details and assets.
 *
 * @property {string} NAME - Full brand name displayed in the UI.
 * @property {string} HIGHLIGHT - The highlighted keyword (styled differently in logos or headings).
 * @property {string} SLOGAN - The official tagline or subtext of the platform.
 * @property {string} LOGO_DARK - Path to the dark theme logo asset.
 * @property {string} LOGO_LIGHT - Path to the light theme logo asset.
 * @property {string} IMAGE - Path to a key illustrative image (e.g., landing/compliance graphic).
 */
import logoDark from "../assets/placeholder_logo_dark_theme.png";
import logoLight from "../assets/placeholder_logo_light_theme.png";
import illustration from "../assets/compliance_image.png";

const BRAND = {
  NAME: "Food News India",
  HIGHLIGHT: "Food",
  SLOGAN: "Simplify Compliance, Empower Your Business",
  LOGO_DARK: logoDark,
  LOGO_LIGHT: logoLight,
  IMAGE: illustration,
};

export default BRAND;
