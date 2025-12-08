/**
 * Simple template renderer
 * Replaces {{variable}} placeholders with values from payload
 * Example:
 * renderTemplate("Ticket {{ticketId}} created", { ticketId: "TCK-101" })
 */

export const renderTemplate = (template, payload = {}) => {
  if (!template || typeof template !== "string") return "";

  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim();

    // Support nested values: like payload["user.name"]
    const value = trimmedKey.split(".").reduce((obj, prop) => {
      return obj && obj[prop] !== undefined ? obj[prop] : undefined;
    }, payload);

    return value !== undefined ? String(value) : `{{${trimmedKey}}}`; // keep placeholder if missing
  });
};
