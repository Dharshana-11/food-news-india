/**
 * @file NotificationLogs.jsx
 * @description Displays system-generated notification logs with filtering, status tracking, and raw JSON view.
 * Allows admins to inspect notification delivery data for audit or troubleshooting.
 * @module pages/notifications/NotificationLogs
 *
 * @requires react
 * @requires antd
 * @requires dayjs
 * @requires ../../services/notificationService
 */

import { Card, Button, Modal, Tag, Spin, message } from "antd";
import CustomTable from "../../components/CustomTable";
import { useState, useEffect } from "react";
import { getNotificationLogs } from "../../services/notificationService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Tooltip } from "antd";
dayjs.extend(relativeTime);

/**
 * Status color mapping for log display.
 * @constant {Record<string, string>}
 */
const statusColors = {
  success: "green",
  partial: "orange",
  failed: "red",
};

/**
 * @function NotificationLogs
 * @description
 * Administrative log viewer for notification history.  
 * Features:
 * - Fetch & filter logs from backend
 * - Status detection (Success, Partial Failure, Failure)
 * - Raw API response modal
 * - Time formatting with relative timestamps
 *
 * @returns {JSX.Element} Notification Logs UI Component
 *
 * @example
 * <Route path="/super-admin/notifications/logs" element={<NotificationLogs />} />
 */
const NotificationLogs = () => {
  /** @state {Array<Object>} logs - Formatted notification logs for table display */
  const [logs, setLogs] = useState([]);

  /** @state {Object|null} jsonData - Raw JSON payload to display in modal */
  const [jsonData, setJsonData] = useState(null);

  /** @state {boolean} loading - Loading indicator for table & requests */
  const [loading, setLoading] = useState(true);

  /** @state {Object} tableFilters - Active table filters from UI */
  const [tableFilters, setTableFilters] = useState({});

  // Initial fetch on mount
  useEffect(() => {
    fetchLogs({});
  }, []);

  /**
   * Fetches logs from backend API and formats status + timestamp.
   * @async
   * @function fetchLogs
   * @param {Object} filters - Filtering object applied to query
   * @returns {Promise<void>}
   */
  const fetchLogs = async (filters) => {
    try {
      setLoading(true);

      const logs = await getNotificationLogs(filters);

      const formatted = logs.map((l) => ({
        ...l,
        timestamp: new Date(l.createdAt).toLocaleString(),
        status:
          l.failureCount > 0
            ? l.successCount > 0
              ? "partial"
              : "failed"
            : "success",
      }));

      setLogs(formatted);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles filter updates triggered by the AntD table component.
   * Converts front-end filters to backend format before API call.
   * @function handleTableChange
   *
   * @param {Object} pagination - Pagination handling object
   * @param {Object} filters - Active UI filters (event, role, status)
   */
  const handleTableChange = (pagination, filters) => {
    const backendFilters = {};

    if (filters.event?.length) backendFilters.event = filters.event[0];
    if (filters.role?.length) backendFilters.role = filters.role[0];
    if (filters.status?.length) backendFilters.status = filters.status[0];

    setTableFilters(filters);
    fetchLogs(backendFilters);
  };

  /**
   * AntD table column configuration with status tags,
   * relative timestamp rendering, and filter options.
   * @constant {Array<Object>}
   */
  const columns = [
  {
    title: "Timestamp",
    dataIndex: "createdAt",
    render: (t) => (
      <Tooltip title={dayjs(t).format("DD MMM YYYY, hh:mm A")}>
        {dayjs(t).fromNow()}
      </Tooltip>
    )
  },
  {
    title: "Event",
    dataIndex: "event",
    filters: [...new Set(logs.map((l) => l.event))].map((e) => ({
      text: e,
      value: e,
    })),
    filteredValue: tableFilters.event || null,
  },
  {
    title: "UID",
    dataIndex: "uid",
  },
  {
    title: "Role",
    dataIndex: "role",
    render: (role) => {
      if (!role || role === "-") return "-";

      const items = role.split(",").filter(r => r.trim().length > 0);

      return (
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {items.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
      );
    },
    filters: [...new Set(logs.map((l) => l.role))].map((r) => ({
      text: r,
      value: r,
    })),
    filteredValue: tableFilters.role || null,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s) => <Tag color={statusColors[s]}>{s.toUpperCase()}</Tag>,
    filters: [
      { text: "SUCCESS", value: "success" },
      { text: "PARTIAL", value: "partial" },
      { text: "FAILED", value: "failed" },
    ],
    filteredValue: tableFilters.status || null,
  },
  {
    title: "Channel",
    dataIndex: "channel",
    render: (c) => <Tag color="blue">{c}</Tag>,
  },
  {
    title: "Success",
    dataIndex: "successCount",
  },
  {
    title: "Failed",
    dataIndex: "failureCount",
  },
  {
    title: "Raw Response",
    render: (_, record) => (
      <Button onClick={() => setJsonData(record.rawResponse)}>
        View JSON
      </Button>
    ),
  },
];

  /**
   * Clears table filters and reloads all logs.
   * @function resetFilters
   */
  const resetFilters = () => {
    setTableFilters({});
    fetchLogs({});
  };

  return (
    <Card
      title="Notification Logs"
      extra={
        <Button type="primary" onClick={resetFilters}>
          Refresh
        </Button>
      }
      style={{ borderRadius: 12 }}
    >
      {loading ? (
        <Spin />
      ) : (
        <CustomTable
          columns={columns}
          data={logs}
          onChange={handleTableChange}
        />
      )}

      <Modal
        open={!!jsonData}
        footer={null}
        onCancel={() => setJsonData(null)}
        width={600}
        title="Raw JSON Response"
      >
        <pre style={{ background: "#f6f6f6", padding: 10 }}>
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      </Modal>
    </Card>
  );
};

export default NotificationLogs;
