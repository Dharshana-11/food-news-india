import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Tag, Button, Empty, Progress } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  WarningOutlined,
  DollarOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

// Components
import StatCard from "../../components/dashboard/StatCard";
import KYCGuard from "../../components/KYCGuard/KYCGuard";

// Services
import serviceProviderService from "../../services/serviceProviderService";
import spBookingService from "../../services/serviceProviderBookingService";

// Constants
import ROLES from "../../constants/roles";
import { ROUTES } from "../../routes";

// Styles
import "./ServiceProviderDashboard.css";

const ServiceProviderDashboard = () => {
  const navigate = useNavigate();

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    pendingServices: 0,
    rejectedServices: 0,
    draftServices: 0,
    totalBookings: 0,
    pendingRequests: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });

  const [recentServices, setRecentServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [servicesRes, bookingsRes, requestsRes, bookingStatsRes] =
        await Promise.allSettled([
          serviceProviderService.getMyServices(),
          spBookingService.getMyBookings({ limit: 3 }),
          spBookingService.getBookingRequests({ limit: 3 }),
          spBookingService.getBookingStats(),
        ]);

      const newStats = { ...stats };

      // Process Services
      if (servicesRes.status === "fulfilled" && servicesRes.value?.data) {
        const services = servicesRes.value.data;
        setRecentServices(services.slice(0, 3));

        newStats.totalServices = services.length;
        newStats.activeServices = services.filter(
          (s) => s.status === "approved"
        ).length;
        newStats.pendingServices = services.filter(
          (s) => s.status === "pending_approval"
        ).length;
        newStats.rejectedServices = services.filter(
          (s) => s.status === "rejected"
        ).length;
        newStats.draftServices = services.filter(
          (s) => s.status === "draft"
        ).length;
      }

      // Process Bookings
      if (bookingsRes.status === "fulfilled" && bookingsRes.value?.data) {
        setRecentBookings(bookingsRes.value.data);
      }

      // Process Booking Requests
      if (requestsRes.status === "fulfilled" && requestsRes.value?.data) {
        setBookingRequests(requestsRes.value.data);
        newStats.pendingRequests = requestsRes.value.data.length;
      }

      // Process Booking Stats
      if (
        bookingStatsRes.status === "fulfilled" &&
        bookingStatsRes.value?.data
      ) {
        const bookingStats = bookingStatsRes.value.data;
        newStats.totalBookings = bookingStats.total || 0;
        newStats.activeBookings =
          (bookingStats.accepted || 0) +
          (bookingStats.in_progress || 0) +
          (bookingStats.documents_submitted || 0);
        newStats.completedBookings = bookingStats.completed || 0;
        newStats.totalRevenue = bookingStats.totalRevenue || 0;
      }

      setStats(newStats);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "My Services",
      icon: <FileTextOutlined />,
      path: ROUTES.SERVICE_PROVIDER_MY_SERVICES,
      color: "#4bb78f",
      bg: "var(--color-bg-green)",
    },
    {
      title: "Booking Requests",
      icon: <ClockCircleOutlined />,
      path: ROUTES.SERVICE_PROVIDER_BOOKING_REQUESTS,
      color: "#ff6c1f",
      bg: "var(--color-bg-orange)",
      badge: stats.pendingRequests > 0 ? stats.pendingRequests : null,
    },
    {
      title: "My Bookings",
      icon: <ShoppingOutlined />,
      path: ROUTES.SERVICE_PROVIDER_MY_BOOKINGS,
      color: "#667eea",
      bg: "#ede9fe",
    },
    {
      title: "Payments",
      icon: <DollarOutlined />,
      path: "/service-provider/payments",
      color: "#ffd166",
      bg: "var(--color-bg-yellow)",
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      pending_approval: "orange",
      approved: "green",
      rejected: "red",
      inactive: "default",
      pending: "orange",
      accepted: "blue",
      in_progress: "cyan",
      documents_submitted: "purple",
      completed: "green",
      cancelled: "red",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_approval: "Pending Approval",
      in_progress: "In Progress",
      documents_submitted: "Docs Submitted",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const serviceCompletionRate =
    stats.totalServices > 0
      ? Math.round((stats.activeServices / stats.totalServices) * 100)
      : 0;

  if (loading) {
    return (
      <KYCGuard userRole={ROLES.SERVICE_PROVIDER}>
        <div className="sp-dashboard-loading">
          <Spin size="large" tip="Loading dashboard..." />
        </div>
      </KYCGuard>
    );
  }

  return (
    <KYCGuard userRole={ROLES.SERVICE_PROVIDER}>
      <div className="sp-dashboard">
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            className="sp-dashboard-error-alert"
          />
        )}

        {/* Header */}
        <div className="sp-dashboard-header">
          <h1>Welcome Back!</h1>
          <p>Manage your services, bookings, and grow your business</p>
        </div>

        {/* Stats Grid */}
        <div className="sp-dashboard-stats-grid">
          <StatCard
            title="Active Services"
            value={stats.activeServices}
            icon={<CheckCircleOutlined />}
            onClick={() => navigate(ROUTES.SERVICE_PROVIDER_MY_SERVICES)}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={<ClockCircleOutlined />}
            onClick={() => navigate(ROUTES.SERVICE_PROVIDER_BOOKING_REQUESTS)}
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={<ShoppingOutlined />}
            onClick={() => navigate(ROUTES.SERVICE_PROVIDER_MY_BOOKINGS)}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<DollarOutlined />}
          />
        </div>

        {/* Quick Actions */}
        <section className="sp-dashboard-section">
          <h2 className="sp-dashboard-section-title">Quick Actions</h2>
          <div className="sp-dashboard-quick-actions">
            {quickActions.map((action) => (
              <Card
                key={action.path}
                className="sp-dashboard-action-card"
                hoverable
                onClick={() => navigate(action.path)}
              >
                <div
                  className="sp-dashboard-action-icon"
                  style={{
                    backgroundColor: action.bg,
                    color: action.color,
                  }}
                >
                  {action.icon}
                  {action.badge && (
                    <span className="sp-dashboard-action-badge">
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3>{action.title}</h3>
                <ArrowRightOutlined className="sp-dashboard-action-arrow" />
              </Card>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="sp-dashboard-two-column-layout">
          {/* Left Column */}
          <div className="sp-dashboard-column-left">
            {/* Pending Booking Requests */}
            {bookingRequests.length > 0 && (
              <section className="sp-dashboard-section">
                <div className="sp-dashboard-section-header">
                  <h2 className="sp-dashboard-section-title">
                    Pending Booking Requests
                  </h2>
                  <Button
                    type="link"
                    onClick={() =>
                      navigate(ROUTES.SERVICE_PROVIDER_BOOKING_REQUESTS)
                    }
                  >
                    View All
                  </Button>
                </div>

                <div className="sp-dashboard-requests-list">
                  {bookingRequests.map((request) => (
                    <Card
                      key={request._id}
                      className="sp-dashboard-request-card"
                      hoverable
                      onClick={() =>
                        navigate(ROUTES.SERVICE_PROVIDER_BOOKING_REQUESTS)
                      }
                    >
                      <div className="sp-dashboard-request-header">
                        <div>
                          <h3>{request.complianceItemId?.name || "Service"}</h3>
                          <p className="sp-dashboard-request-business">
                            {request.businessOwnerId?.name || "Business"}
                          </p>
                        </div>
                        <Tag color="orange" icon={<ClockCircleOutlined />}>
                          Pending
                        </Tag>
                      </div>
                      <div className="sp-dashboard-request-footer">
                        <span className="sp-dashboard-request-price">
                          ₹{request.agreedPrice?.toLocaleString() || 0}
                        </span>
                        <span className="sp-dashboard-request-date">
                          {new Date(
                            request.bookedAt || request.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Bookings */}
            <section className="sp-dashboard-section">
              <div className="sp-dashboard-section-header">
                <h2 className="sp-dashboard-section-title">Recent Bookings</h2>
                {recentBookings.length > 0 && (
                  <Button
                    type="link"
                    onClick={() =>
                      navigate(ROUTES.SERVICE_PROVIDER_MY_BOOKINGS)
                    }
                  >
                    View All
                  </Button>
                )}
              </div>

              {recentBookings.length > 0 ? (
                <div className="sp-dashboard-bookings-list">
                  {recentBookings.map((booking) => (
                    <Card
                      key={booking._id}
                      className="sp-dashboard-booking-card"
                      hoverable
                      onClick={() =>
                        navigate(
                          ROUTES.SERVICE_PROVIDER_BOOKING_DETAILS.replace(
                            ":id",
                            booking._id
                          )
                        )
                      }
                    >
                      <div className="sp-dashboard-booking-header">
                        <h3>{booking.complianceItemId?.name || "Service"}</h3>
                        <Tag color={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Tag>
                      </div>
                      <p className="sp-dashboard-booking-business">
                        {booking.businessOwnerId?.name || "Business"}
                      </p>
                      <div className="sp-dashboard-booking-footer">
                        <span className="sp-dashboard-booking-price">
                          ₹{booking.agreedPrice?.toLocaleString() || 0}
                        </span>
                        <span className="sp-dashboard-booking-date">
                          {new Date(
                            booking.bookedAt || booking.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No bookings yet"
                  >
                    <Button
                      type="primary"
                      onClick={() =>
                        navigate(ROUTES.SERVICE_PROVIDER_MY_SERVICES)
                      }
                    >
                      Add Your First Service
                    </Button>
                  </Empty>
                </Card>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="sp-dashboard-column-right">
            <Card className="sp-dashboard-right-panel">
              {/* Service Overview */}
              <div className="sp-dashboard-panel-section">
                <div className="sp-dashboard-section-header">
                  <h2 className="sp-dashboard-section-title">
                    Service Overview
                  </h2>
                  <Button
                    type="link"
                    onClick={() =>
                      navigate(ROUTES.SERVICE_PROVIDER_MY_SERVICES)
                    }
                  >
                    Manage
                  </Button>
                </div>

                <div className="sp-dashboard-service-overview">
                  <div className="sp-dashboard-service-progress-row">
                    <Progress
                      percent={serviceCompletionRate}
                      showInfo={false}
                    />
                    <span className="sp-dashboard-service-percent">
                      {serviceCompletionRate}%
                    </span>
                  </div>

                  <div className="sp-dashboard-service-meta">
                    <div>
                      <CheckCircleOutlined />
                      Active <strong>{stats.activeServices}</strong>
                    </div>
                    <div>
                      <ClockCircleOutlined />
                      Pending <strong>{stats.pendingServices}</strong>
                    </div>
                    <div>
                      <WarningOutlined />
                      Action Needed{" "}
                      <strong>
                        {stats.rejectedServices + stats.draftServices}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="sp-dashboard-panel-divider" />

              {/* My Services List */}
              {recentServices.length > 0 && (
                <div className="sp-dashboard-panel-section">
                  <div className="sp-dashboard-section-header">
                    <h2 className="sp-dashboard-section-title">My Services</h2>
                    <Button
                      type="link"
                      onClick={() =>
                        navigate(ROUTES.SERVICE_PROVIDER_MY_SERVICES)
                      }
                    >
                      View All
                    </Button>
                  </div>

                  {recentServices.map((service) => (
                    <div
                      key={service._id}
                      className="sp-dashboard-my-service-item"
                      onClick={() =>
                        navigate(
                          ROUTES.SERVICE_PROVIDER_SERVICE_DETAILS.replace(
                            ":id",
                            service._id
                          )
                        )
                      }
                    >
                      <div>
                        <h4>{service.complianceItem?.name}</h4>
                        <p>₹{service.price?.toLocaleString()}</p>
                      </div>
                      <div className="sp-dashboard-service-status-wrapper">
                        <Tag
                          color={getStatusColor(service.status)}
                          className="sp-dashboard-service-status-tag"
                        >
                          {getStatusLabel(service.status)}
                        </Tag>
                        <ArrowRightOutlined />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Services State */}
              {recentServices.length === 0 && (
                <div className="sp-dashboard-panel-section">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No services added yet"
                  >
                    <Button
                      type="primary"
                      onClick={() =>
                        navigate(ROUTES.SERVICE_PROVIDER_MY_SERVICES)
                      }
                    >
                      Add Your First Service
                    </Button>
                  </Empty>
                </div>
              )}

              {/* Divider */}
              {stats.pendingServices > 0 ||
              stats.rejectedServices > 0 ||
              stats.draftServices > 0 ? (
                <>
                  <div className="sp-dashboard-panel-divider" />

                  {/* Action Items */}
                  <div className="sp-dashboard-panel-section">
                    <h2 className="sp-dashboard-section-title">Action Items</h2>

                    {stats.pendingServices > 0 && (
                      <div className="sp-dashboard-action-item sp-dashboard-action-pending">
                        <ClockCircleOutlined />
                        <div>
                          <strong>
                            {stats.pendingServices} service
                            {stats.pendingServices > 1 ? "s" : ""} pending
                            approval
                          </strong>
                          <p>Waiting for admin review</p>
                        </div>
                      </div>
                    )}

                    {stats.rejectedServices > 0 && (
                      <div
                        className="sp-dashboard-action-item sp-dashboard-action-rejected"
                        onClick={() =>
                          navigate(ROUTES.SERVICE_PROVIDER_MY_SERVICES)
                        }
                      >
                        <WarningOutlined />
                        <div>
                          <strong>
                            {stats.rejectedServices} service
                            {stats.rejectedServices > 1 ? "s" : ""} rejected
                          </strong>
                          <p>Review and resubmit</p>
                        </div>
                        <ArrowRightOutlined />
                      </div>
                    )}

                    {stats.draftServices > 0 && (
                      <div
                        className="sp-dashboard-action-item sp-dashboard-action-draft"
                        onClick={() =>
                          navigate(ROUTES.SERVICE_PROVIDER_MY_SERVICES)
                        }
                      >
                        <ExclamationCircleOutlined />
                        <div>
                          <strong>
                            {stats.draftServices} incomplete service
                            {stats.draftServices > 1 ? "s" : ""}
                          </strong>
                          <p>Complete and submit</p>
                        </div>
                        <ArrowRightOutlined />
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </Card>
          </div>
        </div>
      </div>
    </KYCGuard>
  );
};

export default ServiceProviderDashboard;
