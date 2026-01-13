import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Tabs, Spin, Empty, Tag, Row, Col, message } from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import spBookingService from "../../services/serviceProviderBookingService";
import { ROUTES } from "../../routes";

const SPMyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("accepted");

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, statsRes] = await Promise.all([
        spBookingService.getMyBookings({ status: activeTab }),
        spBookingService.getBookingStats(),
      ]);
      setBookings(bookingsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      message.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      accepted: "blue",
      in_progress: "cyan",
      documents_submitted: "purple",
      completed: "green",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      accepted: "Accepted",
      in_progress: "In Progress",
      documents_submitted: "Docs Submitted",
      completed: "Completed",
    };
    return texts[status] || status;
  };

  const tabItems = [
    {
      key: "accepted",
      label: `Accepted (${stats?.accepted || 0})`,
    },
    {
      key: "in_progress",
      label: `In Progress (${stats?.in_progress || 0})`,
    },
    {
      key: "documents_submitted",
      label: `Docs Submitted (${stats?.documents_submitted || 0})`,
    },
    {
      key: "completed",
      label: `Completed (${stats?.completed || 0})`,
    },
  ];

  if (loading && !stats) {
    return (
      <div className="sp-my-bookings-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="sp-my-bookings-container">
      {/* Header */}
      <div className="sp-my-bookings-header">
        <h2>My Bookings</h2>
        <p>Manage your active service bookings</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={[16, 16]} className="sp-my-bookings-stats">
          <Col xs={24} sm={12} md={6}>
            <Card className="sp-stat-card sp-stat-blue">
              <div className="sp-stat-content">
                <div className="sp-stat-icon-wrapper">
                  <FileTextOutlined className="sp-stat-icon" />
                </div>
                <div className="sp-stat-text-group">
                  <div className="sp-stat-label">Total Bookings</div>
                  <div className="sp-stat-value">{stats.total}</div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="sp-stat-card sp-stat-cyan">
              <div className="sp-stat-content">
                <div className="sp-stat-icon-wrapper">
                  <SyncOutlined spin className="sp-stat-icon" />
                </div>
                <div className="sp-stat-text-group">
                  <div className="sp-stat-label">In Progress</div>
                  <div className="sp-stat-value">{stats.in_progress}</div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="sp-stat-card sp-stat-purple">
              <div className="sp-stat-content">
                <div className="sp-stat-icon-wrapper">
                  <FileTextOutlined className="sp-stat-icon" />
                </div>
                <div className="sp-stat-text-group">
                  <div className="sp-stat-label">Docs Submitted</div>
                  <div className="sp-stat-value">
                    {stats.documents_submitted}
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="sp-stat-card sp-stat-green">
              <div className="sp-stat-content">
                <div className="sp-stat-icon-wrapper">
                  <CheckCircleOutlined className="sp-stat-icon" />
                </div>
                <div className="sp-stat-text-group">
                  <div className="sp-stat-label">Completed</div>
                  <div className="sp-stat-value">{stats.completed}</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs */}
      <Card className="sp-my-bookings-tabs-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        {loading ? (
          <div className="sp-my-bookings-loading">
            <Spin />
          </div>
        ) : bookings.length === 0 ? (
          <Empty description="No bookings found" />
        ) : (
          <div className="sp-bookings-list">
            {bookings.map((booking) => (
              <Card
                key={booking._id}
                className="sp-booking-card"
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
                <div className="sp-booking-header">
                  <div className="sp-booking-info">
                    <h3>{booking.complianceItemId?.name}</h3>
                    <div className="sp-booking-id">
                      Booking ID: {booking.bookingId}
                    </div>
                  </div>
                  <Tag color={getStatusColor(booking.status)}>
                    {getStatusText(booking.status)}
                  </Tag>
                </div>

                <div className="sp-booking-details">
                  <div className="sp-booking-row">
                    <UserOutlined />
                    <span>{booking.businessOwnerId?.name}</span>
                  </div>
                  <div className="sp-booking-row">
                    <CalendarOutlined />
                    <span>
                      Booked: {new Date(booking.bookedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="sp-booking-row">
                    <FileTextOutlined />
                    <span>{booking.documents?.length || 0} documents</span>
                  </div>
                </div>

                <div className="sp-booking-footer">
                  <div className="sp-booking-price">₹{booking.agreedPrice}</div>
                  <div className="sp-booking-date">
                    Due:{" "}
                    {new Date(
                      booking.expectedCompletionDate
                    ).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <style jsx>{`
        .sp-my-bookings-container {
          padding: 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sp-my-bookings-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .sp-my-bookings-header {
          margin-bottom: 1.5rem;
        }

        .sp-my-bookings-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-primary-blue);
          margin: 0 0 0.5rem;
        }

        .sp-my-bookings-header p {
          color: #64748b;
          margin: 0;
          font-size: 0.875rem;
        }

        .sp-my-bookings-stats {
          margin-bottom: 1.5rem;
        }

        .sp-stat-card {
          border-radius: 12px;
        }

        .sp-stat-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sp-stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sp-stat-icon {
          font-size: 1.25rem;
          color: inherit;
        }

        .sp-stat-text-group {
          flex: 1;
        }

        .sp-stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .sp-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary-blue);
        }

        .sp-stat-blue .sp-stat-icon-wrapper {
          background: #e6f0ff;
          color: #1e3a8a;
        }

        .sp-stat-cyan .sp-stat-icon-wrapper {
          background: #e0f7fa;
          color: #006064;
        }

        .sp-stat-purple .sp-stat-icon-wrapper {
          background: #f3e5f5;
          color: #4a148c;
        }

        .sp-stat-green .sp-stat-icon-wrapper {
          background: #edf7ed;
          color: #1b5e20;
        }

        .sp-my-bookings-tabs-card {
          border-radius: 12px;
          padding: 10px;
        }

        .sp-bookings-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .sp-booking-card {
          border-radius: 12px;
          padding: 10px;
        }

        .sp-booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 0.75rem;
        }

        .sp-booking-info h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-primary-blue);
          margin: 0 0 0.25rem;
        }

        .sp-booking-id {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .sp-booking-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .sp-booking-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #475569;
        }

        .sp-booking-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px dashed #e2e8f0;
        }

        .sp-booking-price {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-primary-orange);
        }

        .sp-booking-date {
          font-size: 0.75rem;
          color: #64748b;
        }

        @media (min-width: 640px) {
          .sp-my-bookings-container {
            padding: 1.25rem;
          }

          .sp-my-bookings-header h2 {
            font-size: 1.75rem;
          }

          .sp-booking-info h3 {
            font-size: 1rem;
          }
        }

        @media (min-width: 1024px) {
          .sp-my-bookings-container {
            padding: 1.5rem 2rem;
          }

          .sp-my-bookings-header h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SPMyBookings;
