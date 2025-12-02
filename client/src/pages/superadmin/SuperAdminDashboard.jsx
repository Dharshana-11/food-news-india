/**
 * SuperAdminDashboard.jsx
 * ------------------------------------------------------------
 * Main dashboard screen for the Super Admin role.
 *
 * Displays:
 *  - Key statistics (businesses, agents, tickets, etc.)
 *  - Donut and line charts (compliance overview, activity)
 *  - Pending verifications table
 *  - Service summary, ticket snapshot, and notifications
 *
 * Uses:
 *  - Ant Design for layout and components
 *  - Recharts via ChartCard for visualization
 *  - Custom reusable dashboard widgets
 * ------------------------------------------------------------
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Tag } from "antd";
import {
  ShopOutlined,
  UserOutlined,
  TeamOutlined,
  FileExclamationOutlined,
  IdcardOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";

import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import CustomTable from "../../components/CustomTable";
import ServiceSummary from "../../components/dashboard/ServiceSummary";
import TicketsSnapshot from "../../components/dashboard/TicketsSnapshot";
import Notifications from "../../components/dashboard/Notifications";
import { ROUTES } from "../../routes";
import ROLES from "../../constants/roles";
import AppLayout from "../../layouts/AppLayout";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  /* =======================================================
     DASHBOARD DATA
  ======================================================= */

  // ---------- Top Statistic Cards ----------
  const statsData = [
    {
      title: "Total Businesses",
      value: 123,
      icon: <ShopOutlined />,
      path: `${ROUTES.SUPER_ADMIN_USERS}?role=${ROLES.BUSINESS_OWNER}`,
    },
    {
      title: "Agents",
      value: 45,
      icon: <UserOutlined />,
      path: `${ROUTES.SUPER_ADMIN_USERS}?role=${ROLES.AGENT}`,
    },
    {
      title: "Service Providers",
      value: 67,
      icon: <TeamOutlined />,
      path: `${ROUTES.SUPER_ADMIN_USERS}?role=${ROLES.SERVICE_PROVIDER}`,
    },
    {
      title: "Open Tickets",
      value: 9,
      icon: <FileExclamationOutlined />,
      path: ROUTES.SUPER_ADMIN_SUPPORT,
    },
  ];

  // ---------- Compliance Donut Chart ----------
  const complianceData = [
    { name: "Compliant", value: 58 },
    { name: "Pending Review", value: 32 },
    { name: "Non-Compliant", value: 10 },
  ];

  // ---------- Table Columns ----------
  const pendingColumns = [
    {
      title: "Entity Type",
      dataIndex: "entityType",
      key: "entityType",
      render: (type) => {
        const icon =
          type === "Business Owner" ? (
            <ShopOutlined />
          ) : type === "Agent" ? (
            <IdcardOutlined />
          ) : (
            <TeamOutlined />
          );
        return (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {icon} {type}
          </span>
        );
      },
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Category / KYC Type", dataIndex: "category", key: "category" },
    { title: "Submitted By", dataIndex: "submittedBy", key: "submittedBy" },
    {
      title: "Date Submitted",
      dataIndex: "dateSubmitted",
      key: "dateSubmitted",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Pending" ? "orange" : "red"}>{status}</Tag>
      ),
    },
  ];

  // ---------- Pending Verifications ----------
  const allVerifications = [
    {
      key: 1,
      entityType: "Business Owner",
      name: "Aroma Café",
      category: "Food & Beverages",
      submittedBy: "Agent 102",
      dateSubmitted: "2025-10-31",
      status: "Pending",
    },
    {
      key: 2,
      entityType: "Agent",
      name: "Rahul Mehta",
      category: "KYC Verification",
      submittedBy: "Self",
      dateSubmitted: "2025-10-30",
      status: "Pending",
    },
    {
      key: 3,
      entityType: "Service Provider",
      name: "FixIt Plumbing",
      category: "Maintenance",
      submittedBy: "Agent 301",
      dateSubmitted: "2025-10-28",
      status: "Pending",
    },
  ];

  // ---------- Line Chart Activity ----------
  const activityData = [
    { name: "Mon", logins: 30, tickets: 20 },
    { name: "Tue", logins: 50, tickets: 35 },
    { name: "Wed", logins: 40, tickets: 25 },
    { name: "Thu", logins: 70, tickets: 45 },
    { name: "Fri", logins: 55, tickets: 40 },
    { name: "Sat", logins: 90, tickets: 75 },
    { name: "Sun", logins: 65, tickets: 55 },
  ];

  // ---------- Service Summary ----------
  const serviceSummaryData = [
    {
      title: "Active Services",
      value: 80,
      total: 100,
      icon: <CheckCircleOutlined />,
      color: "#ff6c1f",
      path: ROUTES.SUPER_ADMIN_SERVICES,
    },
    {
      title: "Under Maintenance",
      value: 12,
      total: 100,
      icon: <SettingOutlined />,
      color: "#162247",
      path: ROUTES.SUPER_ADMIN_SERVICES,
    },
    {
      title: "Delayed Responses",
      value: 8,
      total: 100,
      icon: <ClockCircleOutlined />,
      color: "#ffb400",
      path: ROUTES.SUPER_ADMIN_SERVICES,
    },
  ];

  // ---------- Tickets Snapshot ----------
  const ticketsData = [
    { type: "Open", count: 12 },
    { type: "In Progress", count: 8 },
    { type: "Resolved", count: 40 },
    { type: "Escalated", count: 3 },
    { type: "Pending Customer", count: 6 },
    { type: "System Error", count: 2 },
    { type: "Verification", count: 10 },
    { type: "Delayed", count: 4 },
  ];

  // ---------- Notifications ----------
  const notificationsData = [
    {
      type: "alert",
      message: "System maintenance scheduled tonight",
      time: "2 hrs ago",
      tag: "System",
      tagColor: "orange",
    },
    {
      type: "success",
      message: "3 verifications approved",
      time: "4 hrs ago",
      tag: "Verification",
      tagColor: "green",
    },
    {
      type: "warning",
      message: "2 tickets delayed",
      time: "1 day ago",
      tag: "Tickets",
      tagColor: "volcano",
    },
    {
      type: "info",
      message: "New service provider sign-up",
      time: "1 day ago",
      tag: "Service",
      tagColor: "blue",
    },
    {
      type: "pending",
      message: "Agent KYC review pending",
      time: "2 days ago",
      tag: "Agent",
      tagColor: "gold",
    },
    {
      type: "update",
      message: "Platform UI enhancements deployed",
      time: "3 days ago",
      tag: "Release",
      tagColor: "purple",
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppLayout role={ROLES.SUPER_ADMIN}>
      <div className="super-admin-dashboard" style={{ padding: "24px" }}>
        {/* ---------- Statistic Cards ---------- */}
        <Row gutter={[24, 24]} className="stats-row">
          {statsData.map((item, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <div
                onClick={() => navigate(item.path)}
                style={{ cursor: "pointer" }}
              >
                <StatCard {...item} />
              </div>
            </Col>
          ))}
        </Row>

        {/* ---------- Charts Section ---------- */}
        <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
          <Col xs={24} md={8}>
            <ChartCard
              title="Compliance Overview"
              data={complianceData}
              color="#ff6c1f"
              chartType="donut"
            />
          </Col>
          <Col xs={24} md={16}>
            <ChartCard
              title="Activity Chart"
              data={activityData}
              color="#ff6c1f"
              chartType="line"
              className="activity-chart"
            />
          </Col>
        </Row>

        {/* ---------- Pending Verifications ---------- */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            marginTop: 20,
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                color: "#162247",
                marginBottom: 16,
              }}
            >
              Pending Verifications
            </h3>
            <a
              onClick={() => navigate(ROUTES.SUPER_ADMIN_COMPLIANCE)}
              style={{ color: "#162247", fontWeight: 500, cursor: "pointer" }}
            >
              <RightOutlined />
            </a>
          </div>
          <CustomTable columns={pendingColumns} data={allVerifications} />
        </div>

        {/* ---------- Summary, Tickets, Notifications ---------- */}
        <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
          <Col xs={24} md={8}>
            <Card
              title="Service Summary"
              extra={
                <a
                  style={{ color: "#162247", fontWeight: "600" }}
                  onClick={() => navigate(ROUTES.SUPER_ADMIN_SERVICES)}
                >
                  <RightOutlined />
                </a>
              }
            >
              <ServiceSummary
                summary={serviceSummaryData.map((item) => ({
                  ...item,
                  onClick: () => navigate(item.path),
                }))}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              title="Tickets Snapshot"
              extra={
                <a
                  style={{ color: "#162247", fontWeight: "600" }}
                  onClick={() => navigate(ROUTES.SUPER_ADMIN_SUPPORT)}
                >
                  <RightOutlined />
                </a>
              }
            >
              <div
                onClick={() => navigate(ROUTES.SUPER_ADMIN_SUPPORT)}
                style={{ cursor: "pointer" }}
              >
                <TicketsSnapshot tickets={ticketsData} />
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              title="Notifications"
              extra={
                <a
                  style={{ color: "#162247", fontWeight: "600" }}
                  onClick={() => navigate(ROUTES.SUPER_ADMIN_NOTIFICATIONS)}
                >
                  <RightOutlined />
                </a>
              }
            >
              <Notifications notifications={notificationsData} />
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
};

export default SuperAdminDashboard;
