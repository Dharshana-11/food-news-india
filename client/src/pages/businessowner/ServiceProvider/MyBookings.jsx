import { useState, useEffect } from "react";
import { Card, Input, Tag, Spin, message, Empty, Space } from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";
import "./MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, statsRes] = await Promise.all([
        bookingService.getMyBookings({
          sortBy: "bookedAt",
          sortOrder: "desc",
        }),
        bookingService.getBookingStats(),
      ]);
      setBookings(bookingsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      accepted: "blue",
      in_progress: "cyan",
      documents_submitted: "purple",
      completed: "green",
      cancelled: "red",
      rejected: "red",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pending",
      accepted: "Accepted",
      in_progress: "In Progress",
      documents_submitted: "Docs Submitted",
      completed: "Completed",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  const filteredBookings = bookings.filter((booking) => {
    const serviceName = booking.serviceId?.name?.toLowerCase() || "";
    const providerName = booking.providerId?.companyName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return serviceName.includes(search) || providerName.includes(search);
  });

  const ongoingBookings = filteredBookings.filter((b) =>
    ["pending", "accepted", "in_progress", "documents_submitted"].includes(
      b.status
    )
  );
  const completedBookings = filteredBookings.filter(
    (b) => b.status === "completed"
  );

  if (loading) {
    return (
      <div className="bookings-loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        {/* Header */}
        <div className="bookings-header">
          <ArrowLeftOutlined
            className="back-icon"
            onClick={() => navigate("/business-owner/services")}
          />
          <h2>My Bookings</h2>
        </div>

        {/* Search */}
        <Input
          placeholder="Search services here"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
          className="bookings-search"
        />

        {/* Quick Stats */}
        {stats && (
          <div className="quick-stats">
            <div className="stat-item completed">
              <CheckCircleOutlined className="stat-icon" />
              <div className="stat-info">
                <div className="stat-value">{stats.completed || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="stat-item in-progress">
              <SyncOutlined className="stat-icon" spin />
              <div className="stat-info">
                <div className="stat-value">{stats.in_progress || 0}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>

            <div className="stat-item pending">
              <ClockCircleOutlined className="stat-icon" />
              <div className="stat-info">
                <div className="stat-value">{stats.pending || 0}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>
        )}

        {/* Ongoing Services */}
        <div className="bookings-section">
          <h3>Ongoing Services</h3>
          {ongoingBookings.length === 0 ? (
            <Empty description="No ongoing services" className="empty-state" />
          ) : (
            <div className="bookings-list">
              {ongoingBookings.map((booking) => (
                <Card
                  key={booking._id}
                  className="booking-card"
                  hoverable
                  onClick={() =>
                    navigate(`/business-owner/services/${booking._id}`)
                  }
                >
                  <div className="booking-content">
                    <div className="booking-icon">🏛️</div>

                    <div className="booking-info">
                      <div className="booking-header">
                        <span className="booking-name">
                          {booking.serviceId?.name}
                        </span>
                        <Tag color={getStatusColor(booking.status)}>
                          {getStatusText(booking.status)}
                        </Tag>
                      </div>

                      <div className="booking-provider">
                        by {booking.providerId?.companyName}
                        <span className="rating">
                          ⭐ {booking.providerId?.rating?.toFixed(1)}
                        </span>
                      </div>

                      <div className="booking-dates">
                        <span>
                          Booked:{" "}
                          {new Date(booking.bookedAt).toLocaleDateString()}
                        </span>
                        <span>
                          Expected:{" "}
                          {new Date(
                            booking.expectedCompletionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="booking-footer">
                        <span className="booking-price">
                          ₹{booking.agreedPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Services */}
        <div className="bookings-section">
          <h3>Completed Services</h3>
          {completedBookings.length === 0 ? (
            <Empty
              description="No completed services"
              className="empty-state"
            />
          ) : (
            <div className="bookings-list">
              {completedBookings.map((booking) => (
                <Card
                  key={booking._id}
                  className="booking-card completed"
                  hoverable
                  onClick={() =>
                    navigate(`/business-owner/services/${booking._id}`)
                  }
                >
                  <div className="booking-content">
                    <div className="booking-icon">🏛️</div>

                    <div className="booking-info">
                      <div className="booking-header">
                        <span className="booking-name">
                          {booking.serviceId?.name}
                        </span>
                        <Tag color="green">Completed</Tag>
                      </div>

                      <div className="booking-provider">
                        by {booking.providerId?.companyName}
                        <span className="rating">
                          ⭐ {booking.providerId?.rating?.toFixed(1)}
                        </span>
                      </div>

                      <div className="booking-dates">
                        <span>
                          Booked:{" "}
                          {new Date(booking.bookedAt).toLocaleDateString()}
                        </span>
                        <span>
                          Completed:{" "}
                          {new Date(
                            booking.actualCompletionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="booking-footer">
                        <span className="booking-price">
                          ₹{booking.agreedPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
