/**
 * @file TemplateSettings.jsx
 * @description Notification template management interface for customizing notification content.
 * @module pages/notifications/TemplateSettings
 * @requires react
 * @requires antd
 * @requires @ant-design/icons
 * @requires ../../services/notificationService
 * @requires ../../styles/global.css
 * 
 * @example
 * // Basic usage in a route
 * <Route path="/notifications/templates" element={<TemplateSettings />} />
 */

import { useEffect, useState } from "react";
import { Card, Input, Tabs, Button, message, Spin, Alert } from "antd";
import {
  getNotificationTypes,
  getTemplate,
  updateTemplate,
} from "../../services/notificationService";

// Icons
import {
  FileTextOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

// Styles
import "../../styles/global.css";

/**
 * Mapping of category names to their corresponding icons
 * @constant {Object} CATEGORY_ICONS
 * @property {JSX.Element} ticket - Icon for ticket-related notifications
 * @property {JSX.Element} user - Icon for user-related notifications
 * @property {JSX.Element} system - Icon for system notifications
 * @property {JSX.Element} feedback - Icon for feedback notifications
 * @property {JSX.Element} compliance - Icon for compliance notifications
 * @property {JSX.Element} other - Default icon for uncategorized notifications
 */
const CATEGORY_ICONS = {
  ticket: <FileTextOutlined className="ts-icon" />,
  user: <UserOutlined className="ts-icon" />,
  system: <WarningOutlined className="ts-icon" />,
  feedback: <CheckCircleOutlined className="ts-icon" />,
  compliance: <QuestionCircleOutlined className="ts-icon" />,
  other: <FileTextOutlined className="ts-icon" />,
};

/**
 * List of supported template variables that can be used in notification templates
 * @constant {string[]} SUPPORTED_VARS
 * @property {string} ticketId - The ID of the related ticket
 * @property {string} createdBy - Name of the user who created the notification
 * @property {string} priority - Priority level of the notification
 * @property {string} status - Current status of the notification
 * @property {string} assignedTo - User assigned to handle the notification
 * @property {string} username - Username of the recipient
 * @property {string} role - Role of the recipient
 * @property {string} uid - Unique identifier of the user
 */
const SUPPORTED_VARS = [
  "ticketId",
  "createdBy",
  "priority",
  "status",
  "assignedTo",
  "username",
  "role",
  "uid",
];

/**
 * TemplateSettings Component
 * 
 * @description
 * Provides an interface for managing notification templates, allowing customization of
 * notification titles and bodies with support for dynamic variables.
 * 
 * @returns {JSX.Element} A tabbed interface for managing notification templates
 * 
 * @example
 * // Basic usage
 * <TemplateSettings />
 */
const TemplateSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState({});
  const [templates, setTemplates] = useState({});
  const [preview, setPreview] = useState({});
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    loadAll();
  }, []);

  /**
   * Loads all notification types and their corresponding templates
   * @async
   * @function loadAll
   * @returns {Promise<void>}
   * @throws {Error} If loading fails
   */
  const loadAll = async () => {
    try {
      const types = await getNotificationTypes();
      const grouped = {};

      types.forEach((t) => {
        const cat = t.category || "other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(t);
      });

      setCategories(grouped);

      const temp = {};

      for (const t of types) {
        const tpl = await getTemplate(t.event);
        temp[t.event] = {
          titleTemplate: tpl?.titleTemplate || "",
          bodyTemplate: tpl?.bodyTemplate || "",
        };

        computePreviewAndWarnings(
          t.event,
          tpl?.titleTemplate || "",
          tpl?.bodyTemplate || ""
        );
      }

      setTemplates(temp);
    } catch (err) {
      console.error(err);
      message.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Extracts template variables from text
   * @function extractVars
   * @param {string} text - The text containing template variables
   * @returns {string[]} Array of variable names found in the text
   * @example
   * // Returns ['username', 'ticketId']
   * extractVars('Hello {{username}}, your ticket {{ticketId}} has been created.');
   */
  const extractVars = (text) => {
    const matches = text.match(/{{(.*?)}}/g) || [];
    return matches.map((v) => v.replace("{{", "").replace("}}", "").trim());
  };

  /**
   * Computes preview text and generates warnings for template variables
   * @function computePreviewAndWarnings
   * @param {string} event - The notification event identifier
   * @param {string} titleText - The title template text
   * @param {string} bodyText - The body template text
   */
  const computePreviewAndWarnings = (event, titleText, bodyText) => {
    const vars = extractVars(titleText + " " + bodyText);

    const unsupported = vars.filter((v) => !SUPPORTED_VARS.includes(v));

    const missing = [];
    if (event.startsWith("ticket") && !vars.includes("ticketId")) {
      missing.push("ticketId");
    }

    const mockData = {
      ticketId: "TCK-1023",
      createdBy: "Admin",
      priority: "High",
      status: "Open",
      assignedTo: "Support Agent",
      username: "John Doe",
      role: "super_admin",
      uid: "USR001",
    };

    const renderText = (text) =>
      text.replace(/{{(.*?)}}/g, (_, key) => mockData[key.trim()] || "???");

    setPreview((prev) => ({
      ...prev,
      [event]: {
        title: renderText(titleText),
        body: renderText(bodyText),
      },
    }));

    setWarnings((prev) => ({
      ...prev,
      [event]: { unsupported, missing },
    }));
  };

  /**
   * Handles changes to template fields
   * @function handleChange
   * @param {string} event - The notification event identifier
   * @param {'titleTemplate'|'bodyTemplate'} field - The field being modified
   * @param {string} value - The new value for the field
   */
  const handleChange = (event, field, value) => {
    const updated = {
      ...templates[event],
      [field]: value,
    };

    setTemplates((prev) => ({ ...prev, [event]: updated }));

    computePreviewAndWarnings(
      event,
      updated.titleTemplate,
      updated.bodyTemplate
    );
  };

  /**
   * Saves the template for a specific event
   * @async
   * @function saveTemplate
   * @param {string} event - The notification event identifier
   * @returns {Promise<void>}
   */
  const saveTemplate = async (event) => {
    try {
      setSaving(true);
      const { titleTemplate, bodyTemplate } = templates[event];
      await updateTemplate(event, { titleTemplate, bodyTemplate });
      message.success("Template saved!");
    } catch (err) {
      console.error(err);
      message.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <Card
      title="Customize Notification Templates"
      className="ts-container"
    >
      <Tabs tabPosition="left" className="ts-category-tabs">
        {Object.keys(categories).map((cat) => (
          <Tabs.TabPane
            tab={
              <span className="ts-tab-label">
                {CATEGORY_ICONS[cat]} {cat.toUpperCase()}
              </span>
            }
            key={cat}
          >
            <Tabs tabPosition="top" type="card" className="ts-event-tabs">
              {categories[cat].map((ev) => (
                <Tabs.TabPane tab={ev.label} key={ev.event}>
                  <div className="ts-editor-section">
                    <h3>Title Template</h3>
                    <Input
                      className="ts-input"
                      value={templates[ev.event]?.titleTemplate}
                      onChange={(e) =>
                        handleChange(
                          ev.event,
                          "titleTemplate",
                          e.target.value
                        )
                      }
                    />

                    <h3>Body Template</h3>
                    <Input.TextArea
                      rows={6}
                      className="ts-input"
                      value={templates[ev.event]?.bodyTemplate}
                      onChange={(e) =>
                        handleChange(
                          ev.event,
                          "bodyTemplate",
                          e.target.value
                        )
                      }
                    />

                    {/* Warnings */}
                    {warnings[ev.event]?.unsupported.length > 0 && (
                      <Alert
                        type="error"
                        className="ts-alert"
                        message="Unsupported Variables"
                        description={
                          <ul>
                            {warnings[ev.event].unsupported.map((u) => (
                              <li key={u}>⚠ {`{{${u}}}`} is not supported</li>
                            ))}
                          </ul>
                        }
                      />
                    )}

                    {warnings[ev.event]?.missing.length > 0 && (
                      <Alert
                        type="warning"
                        className="ts-alert"
                        message="Recommended Variables Missing"
                        description={
                          <ul>
                            {warnings[ev.event].missing.map((m) => (
                              <li key={m}>Consider including {`{{${m}}}`}</li>
                            ))}
                          </ul>
                        }
                      />
                    )}

                    <h3>Preview</h3>
                    <Card className="ts-preview">
                      <strong>{preview[ev.event]?.title}</strong>
                      <p>{preview[ev.event]?.body}</p>
                    </Card>

                    <Button
                      type="primary"
                      className="ts-btn"
                      loading={saving}
                      onClick={() => saveTemplate(ev.event)}
                    >
                      Save Template
                    </Button>
                  </div>
                </Tabs.TabPane>
              ))}
            </Tabs>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Card>
  );
};

export default TemplateSettings;
