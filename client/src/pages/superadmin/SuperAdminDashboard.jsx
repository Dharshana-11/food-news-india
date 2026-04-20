/**
 * SuperAdminDashboard.jsx
 * ------------------------------------------------------------
 * All data fetched dynamically from GET /api/admin/dashboard/*
 *
 * Service Summary widget shows SERVICE APPROVAL STATUS:
 *   - Pending Approval  (admin action required)
 *   - Approved Services (live)
 *   - Rejected / Inactive (needs attention)
 * ------------------------------------------------------------
 */

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Tag, Spin, Alert } from "antd";
import {
  ShopOutlined,
  UserOutlined,
  TeamOutlined,
  FileExclamationOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
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
import { fetchAllDashboardData } from "../../services/adminDashboardService";

/* ─────────────────────────────────────────────────────────
   PENDING VERIFICATIONS TABLE COLUMNS
───────────────────────────────────────────────────────── */

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
  { title: "Date Submitted", dataIndex: "dateSubmitted", key: "dateSubmitted" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag color={status === "Pending" ? "orange" : "red"}>{status}</Tag>
    ),
  },
];

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [allVerifications, setAllVerifications] = useState([]);
  const [serviceSummaryData, setServiceSummaryData] = useState([]);
  const [ticketsData, setTicketsData] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);

  /* ── Data loader ─────────────────────────────────── */
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        stats,
        compliance,
        activity,
        verifications,
        services,
        tickets,
        notifications,
      } = await fetchAllDashboardData();

      /* Stat cards */
      if (stats) {
        setStatsData([
          {
            title: "Total Businesses",
            value: stats.totalBusinesses,
            icon: <ShopOutlined />,
            path: `${ROUTES.SUPER_ADMIN_USERS}?role=${ROLES.BUSINESS_OWNER}`,
          },
          {
            title: "Agents",
            value: stats.agents,
            icon: <UserOutlined />,
            path: `${ROUTES.SUPER_ADMIN_USERS}?role=${ROLES.AGENT}`,
          },
          {
            title: "Service Providers",
            value: stats.serviceProviders,
            icon: <TeamOutlined />,
            path: `${ROUTES.SUPER_ADMIN_USERS}?role=${ROLES.SERVICE_PROVIDER}`,
          },
          {
            title: "Open Tickets",
            value: stats.openTickets,
            icon: <FileExclamationOutlined />,
            path: ROUTES.SUPER_ADMIN_SUPPORT,
          },
        ]);
      }

      if (compliance) setComplianceData(compliance);
      if (activity) setActivityData(activity);
      if (verifications) setAllVerifications(verifications);

      /* ─────────────────────────────────────────────────
         Service Summary widget
         Driven by SERVICE APPROVAL STATUS, not operational
         status. Mirrors what ServiceApprovalSummary shows:
           • Pending Approval  → admin needs to act
           • Approved Services → live & running
           • Needs Attention   → rejected + inactive
      ───────────────────────────────────────────────── */
      if (services) {
        const safeTotal = services.total || 1; // prevent division by zero
        setServiceSummaryData([
          {
            title: "Pending Approval",
            value: services.pendingApproval,
            total: safeTotal,
            icon: <ClockCircleOutlined />,
            color: "#fa8c16", // orange — needs admin action
            path: ROUTES.SUPER_ADMIN_SERVICES_APPROVAL,
          },
          {
            title: "Approved Services",
            value: services.approved,
            total: safeTotal,
            icon: <CheckCircleOutlined />,
            color: "#52c41a", // green — live
            path: ROUTES.SUPER_ADMIN_SERVICES_APPROVAL,
          },
          {
            title: "Needs Attention",
            value: services.needsAttention, // rejected + inactive
            total: safeTotal,
            icon: <ExclamationCircleOutlined />,
            color: "#ff4d4f", // red — provider needs to fix
            path: ROUTES.SUPER_ADMIN_SERVICES_APPROVAL,
          },
        ]);
      }

      if (tickets) setTicketsData(tickets);
      if (notifications) setNotificationsData(notifications);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin size="large" tip="Loading dashboard…" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          message={error}
          action={
            <a onClick={loadDashboard} style={{ cursor: "pointer" }}>
              Retry
            </a>
          }
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard" style={{ padding: "24px" }}>
      {/* Stat Cards */}
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

      {/* Charts */}
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

      {/* Pending Verifications */}
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
        <CustomTable
          columns={pendingColumns}
          data={allVerifications}
          pagination={false}
        />
      </div>

      {/* Service Summary / Tickets / Notifications */}
      <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
        <Col xs={24} md={8}>
          <Card
            title="Service Approvals"
            extra={
              <a
                style={{ color: "#162247", fontWeight: "600" }}
                onClick={() => navigate(ROUTES.SUPER_ADMIN_SERVICES_APPROVAL)}
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
                onClick={() => navigate(ROUTES.SUPER_ADMIN_TICKETS)}
              >
                <RightOutlined />
              </a>
            }
          >
            <div
              onClick={() => navigate(ROUTES.SUPER_ADMIN_TICKETS)}
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
  );
};

export default SuperAdminDashboard;
