/**
 * @file ModuleSettings.jsx
 * @description Module-level notification settings management interface.
 * @module pages/notifications/ModuleSettings
 * @requires react
 * @requires antd
 * @requires ../../components/CustomTable
 * @requires ../../services/notificationService
 * @requires @ant-design/icons
 * 
 * @example
 * // Basic usage in a route
 * <Route path="/notifications/modules" element={<ModuleSettings />} />
 */

import { useEffect, useState } from "react";
import { Card, Switch, message, Spin, Tag } from "antd";
import CustomTable from "../../components/CustomTable";

// Services
import {
  getNotificationTypes,
  getNotificationSettings,
  updateNotificationSettings,
} from "../../services/notificationService";

// Icons
import {
  FileTextOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

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
  ticket: <FileTextOutlined style={{ fontSize: 22, color: "#1677ff" }} />,
  user: <UserOutlined style={{ fontSize: 22, color: "#52c41a" }} />,
  system: <WarningOutlined style={{ fontSize: 22, color: "#faad14" }} />,
  feedback: <CheckCircleOutlined style={{ fontSize: 22, color: "#722ed1" }} />,
  compliance: <QuestionCircleOutlined style={{ fontSize: 22, color: "#eb2f96" }} />,
  other: <FileTextOutlined style={{ fontSize: 22 }} />,
};

/**
 * Mapping of category names to their corresponding tag colors
 * @constant {Object} CATEGORY_COLORS
 * @property {string} ticket - Color for ticket-related tags
 * @property {string} user - Color for user-related tags
 * @property {string} system - Color for system tags
 * @property {string} feedback - Color for feedback tags
 * @property {string} compliance - Color for compliance tags
 * @property {string} other - Default color for uncategorized tags
 */
const CATEGORY_COLORS = {
  ticket: "blue",
  user: "green",
  system: "orange",
  feedback: "purple",
  compliance: "magenta",
  other: "default",
};

/**
 * ModuleSettings Component
 * 
 * @description
 * Provides an interface for managing notification settings at the module level.
 * Allows enabling/disabling notification types and viewing their current status.
 * 
 * @returns {JSX.Element} A card-based UI with a table of notification modules and their settings
 * 
 * @example
 * // In a parent component
 * <ModuleSettings />
 */
const ModuleSettings = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Fetches notification types and their current settings from the server
   * @async
   * @function loadData
   * @returns {Promise<void>}
   * @throws {Error} If data loading fails
   */
  const loadData = async () => {
    try {
      setLoading(true);

      const [types, settings] = await Promise.all([
        getNotificationTypes(),
        getNotificationSettings(),
      ]);

      // Group by category
      const grouped = {};

      types.forEach((t) => {
        const cat = t.category || "other";

        const setting = settings.find((s) => s.event === t.event);

        const row = {
          event: t.event,
          label: t.label || t.event,
          category: cat,
          channels: setting?.channels || t.defaultChannels,
          enabled: setting?.enabled ?? true,
        };

        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(row);
      });

      const formatted = Object.keys(grouped).map((cat) => ({
        category: cat,
        title: cat.charAt(0).toUpperCase() + cat.slice(1) + " Notifications",
        data: grouped[cat],
      }));

      setModules(formatted);
    } catch (err) {
      console.error(err);
      message.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles toggling a notification setting
   * @async
   * @function handleToggle
   * @param {string} event - The notification event identifier
   * @param {string} channel - The notification channel (e.g. push, email, sms, web)
   * @param {boolean} value - The new enabled/disabled state
   * @returns {Promise<void>}
   */
  /**
   * Handles toggling a notification setting
   * @async
   * @function handleToggle
   * @param {string} event - The notification event identifier
   * @param {string} channel - The notification channel (e.g., push, email, sms, web)
   * @param {boolean} value - The new enabled/disabled state
   * @returns {Promise<void>}
   */
  const handleToggle = async (event, channel, value) => {
    try {
      // Find the module that contains this event
      const mod = modules
        .flatMap((m) => m.data)
        .find((item) => item.event === event);

      if (!mod) {
        throw new Error(`Notification event not found: ${event}`);
      }

      // Build the updated channels object
      const updatedChannels = {
        ...mod.channels,
        [channel]: value,
      };

      await updateNotificationSettings({
        event,
        channels: updatedChannels,
      });

      message.success("Notification settings updated successfully!");
      // Refresh the data to reflect changes
      await loadData();
    } catch (err) {
      console.error("Failed to update notification setting:", err);
      message.error("Failed to update notification setting");
    }
  };


  // Columns WITHOUT category tag
  /**
   * Table column configuration
   * @constant {Array<Object>} columns
   * @property {string} title - Column header text
   * @property {string} dataIndex - Property name in the data object
   * @property {Function} render - Custom render function for the column
   * @property {number} [width] - Column width in pixels
   */
  const columns = [
    {
      title: "Event",
      dataIndex: "label",
      key: "event",
    },
    {
      title: "Push",
      key: "push",
      render: (_, row) => (
        <Switch
          checked={row.channels?.push}
          onChange={(val) => updateSetting(row.event, "push", val)}
        />
      ),
    },
    {
      title: "Email",
      key: "email",
      render: (_, row) => (
        <Switch
          checked={row.channels?.email}
          onChange={(val) => updateSetting(row.event, "email", val)}
        />
      ),
    },
    {
      title: "SMS",
      key: "sms",
      render: (_, row) => (
        <Switch
          checked={row.channels?.sms}
          onChange={(val) => updateSetting(row.event, "sms", val)}
        />
      ),
    },
    {
      title: "Web",
      key: "web",
      render: (_, row) => (
        <Switch
          checked={row.channels?.web}
          onChange={(val) => updateSetting(row.event, "web", val)}
        />
      ),
    },
  ];

  if (loading) return <Spin />;

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Module-Based Notification Settings</h2>

      {modules.map((mod) => (
        <Card
          key={mod.category}
          style={{ marginBottom: 25, borderRadius: 10 }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {CATEGORY_ICONS[mod.category]}

              <span style={{ fontSize: 16, fontWeight: 600 }}>{mod.title}</span>

              <Tag
                color={CATEGORY_COLORS[mod.category]}
                style={{ marginLeft: "auto", fontSize: 13 }}
              >
                {mod.category.toUpperCase()}
              </Tag>
            </div>
          }
        >
          <CustomTable columns={columns} data={mod.data} />
        </Card>
      ))}
    </div>
  );
};

export default ModuleSettings;
