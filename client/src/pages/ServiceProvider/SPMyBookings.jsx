import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Tabs, Spin, Empty, Tag, message } from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import spBookingService from "../../services/serviceProviderBookingService";
import "./SPMyBookings.css";
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

      {/* Stats Cards - REMOVED Row/Col, using CSS Grid */}
      {stats && (
        <div className="sp-my-bookings-stats">
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

          <Card className="sp-stat-card sp-stat-purple">
            <div className="sp-stat-content">
              <div className="sp-stat-icon-wrapper">
                <FileTextOutlined className="sp-stat-icon" />
              </div>
              <div className="sp-stat-text-group">
                <div className="sp-stat-label">Docs Submitted</div>
                <div className="sp-stat-value">{stats.documents_submitted}</div>
              </div>
            </div>
          </Card>

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
        </div>
      )}

      {/* Tabs */}
      <Card className="sp-my-bookings-tabs-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        {loading ? (
          <div className="sp-my-bookings-loading">
            <Spin />
          </div>
        ) : bookings.length === 0 ? (
          <div className="sp-bookings-empty">
            <Empty description="No bookings found" />
          </div>
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
                  <div className="sp-booking-status">
                    <Tag color={getStatusColor(booking.status)}>
                      {getStatusText(booking.status)}
                    </Tag>
                  </div>
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
    </div>
  );
};

export default SPMyBookings;
