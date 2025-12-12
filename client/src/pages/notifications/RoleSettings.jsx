/**
 * @file RoleSettings.jsx
 * @description UI for assigning notification permissions to specific user roles.
 * Allows admins to control which roles receive each notification category.
 * @module pages/notifications/RoleSettings
 *
 * @requires react
 * @requires antd
 * @requires @ant-design/icons
 * @requires ../../services/notificationService
 */

import { useEffect, useState } from "react";
import { Card, Row, Col, Select, Spin, message, Button, Tag } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import {
  getNotificationTypes,
  getNotificationSettings,
  updateNotificationSettings,
} from "../../services/notificationService";

/**
 * Available role options for assigning notification visibility.
 * Used in multi-select drop-down menus.
 *
 * @constant {Array<{label: string, value: string}>}
 */
const ROLE_OPTIONS = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Agent", value: "agent" },
  { label: "Business Owner", value: "business_owner" },
  { label: "Service Provider", value: "service_provider" },
];

/**
 * Icon mapping for each notification category.
 *
 * @constant {Record<string, JSX.Element>}
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
 * Color tags for category display.
 *
 * @constant {Record<string, string>}
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
 * @function RoleSettings
 * @description
 * Component for configuring notification visibility based on user roles.
 * - Fetches notification categories & saved role assignments.
 * - Allows administrators to modify which roles receive specific events.
 * - Updates settings only when "Apply Changes" is clicked.
 *
 * @returns {JSX.Element} Rendered UI for Role-based Notification Management.
 *
 * @example
 * <Route path="/super-admin/notifications/roles" element={<RoleSettings />} />
 */
const RoleSettings = () => {
  /** @state {boolean} loading - Shows progress during API calls */
  const [loading, setLoading] = useState(true);

  /** @state {Object} modules - Grouped notifications by category */
  const [modules, setModules] = useState({});

  /**
   * @state {Record<string, string[]>}
   * changes - Stores pending modifications in role assignments.
   * Example: `{ "TICKET_ASSIGNED": ["admin", "agent"] }`
   */
  const [changes, setChanges] = useState({});

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Fetches available notification types and saved role settings from API.
   * Groups notifications by category before rendering.
   *
   * @async
   * @function loadData
   * @returns {Promise<void>}
   */
  const loadData = async () => {
    try {
      setLoading(true);

      const [types, settings] = await Promise.all([
        getNotificationTypes(),
        getNotificationSettings(),
      ]);

      const grouped = {};

      types.forEach((t) => {
        const module = t.category || "other";
        const found = settings.find((s) => s.event === t.event);

        const eventData = {
          event: t.event,
          label: t.label,
          module,
          notifyRoles: found?.notifyRoles || [],
        };

        if (!grouped[module]) grouped[module] = [];
        grouped[module].push(eventData);
      });

      setModules(grouped);
      setChanges({});

    } catch (err) {
      console.error(err);
      message.error("Failed to load role settings");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles updates in the multi-select role selector.
   *
   * @param {string} event - Notification event ID.
   * @param {string[]} values - Selected roles for that event.
   */
  const handleRoleChange = (event, values) => {
    setChanges((prev) => ({
      ...prev,
      [event]: values,
    }));
  };

  /**
   * Saves modified notification settings to the server.
   * Runs only when user clicks "Apply Changes".
   *
   * @async
   * @function applyChanges
   * @returns {Promise<void>}
   */
  const applyChanges = async () => {
    try {
      const entries = Object.entries(changes);
      if (!entries.length) {
        message.info("No changes to save");
        return;
      }

      for (const [event, roles] of entries) {
        await updateNotificationSettings({ event, notifyRoles: roles });
      }

      message.success("Role-based settings updated");
      loadData();

    } catch (err) {
      console.error(err);
      message.error("Failed to apply changes");
    }
  };

  // Show spinner during loading
  if (loading) return <Spin />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2>Role-Based Notification Settings</h2>
        <Button type="primary" onClick={applyChanges}>
          Apply Changes
        </Button>
      </div>

      {Object.keys(modules).map((module) => (
        <Card
          key={module}
          style={{ marginBottom: 25, borderRadius: 10 }}
          title={
            <div
                style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                }}
            >
                {/* Left: Icon + Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {CATEGORY_ICONS[module] || CATEGORY_ICONS.other}
                <span style={{ fontSize: 16, fontWeight: 600 }}>
                    {module.charAt(0).toUpperCase() + module.slice(1)} Notifications
                </span>
                </div>

                {/* Right: Tag */}
                <Tag color={CATEGORY_COLORS[module]} style={{ fontSize: 14, padding: "4px 10px" }}>
                {module.toUpperCase()}
                </Tag>
            </div>
            }
        >
          <Row gutter={[16, 16]}>
            {modules[module].map((ev) => (
              <Col span={8} key={ev.event}>
                <Card size="small" title={ev.label}>
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder="Select roles"
                    value={changes[ev.event] ?? ev.notifyRoles}
                    options={ROLE_OPTIONS}
                    onChange={(value) => handleRoleChange(ev.event, value)}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      ))}
    </div>
  );
};

export default RoleSettings;
