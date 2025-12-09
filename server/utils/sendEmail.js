import nodemailer from "nodemailer";

/**
 * Email transporter instance using Nodemailer.
 *
 * 🔐 Uses Gmail or another SMTP provider based on configuration.
 * Requires the following environment variables:
 * - `EMAIL_USER`: Sender email address
 * - `EMAIL_PASS`: App password or SMTP password
 *
 * @constant {import("nodemailer").Transporter} transporter
 */
const transporter = nodemailer.createTransport({
  service: "gmail", // or SMTP provider
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // app password
  }
});

/**
 * Sends an email via Nodemailer.
 *
 * @async
 * @function sendEmail
 * @param {Object} options - Email payload object.
 * @param {string|string[]} options.to - Recipient email(s).
 * @param {string} options.subject - Email subject line.
 * @param {string} options.html - HTML content of the email body.
 * @returns {Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>} Promise containing SMTP response.
 *
 * @example
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   html: "<h1>Hello User</h1>"
 * });
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Support System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
};

export default sendEmail;
