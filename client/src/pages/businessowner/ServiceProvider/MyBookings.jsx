import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Tag,
  Spin,
  message,
  Empty,
  Space,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import bookingService from "../../../services/bookingService";
import "./MyBookings.css";

const { Title, Text } = Typography;

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
    const serviceName = booking.complianceItemId?.name?.toLowerCase() || "";
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
      <div className="my-bookings-loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        {/* Header */}
        <div className="my-bookings-header">
          <ArrowLeftOutlined
            className="my-bookings-back"
            onClick={() => navigate("/business-owner/services")}
          />
          <Title level={4}>My Bookings</Title>
        </div>

        {/* Search */}
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search by service or provider"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="my-bookings-search"
        />

        {/* Stats */}
        {stats && (
          <div className="my-bookings-stats">
            <div className="my-bookings-stat completed">
              <CheckCircleOutlined />
              <div>
                <div className="value">{stats.completed || 0}</div>
                <div className="label">Completed</div>
              </div>
            </div>

            <div className="my-bookings-stat in-progress">
              <SyncOutlined spin />
              <div>
                <div className="value">{stats.in_progress || 0}</div>
                <div className="label">In Progress</div>
              </div>
            </div>

            <div className="my-bookings-stat pending">
              <ClockCircleOutlined />
              <div>
                <div className="value">{stats.pending || 0}</div>
                <div className="label">Pending</div>
              </div>
            </div>
          </div>
        )}

        {/* Ongoing */}
        <div className="my-bookings-section">
          <Title level={5}>Ongoing Services</Title>

          {ongoingBookings.length === 0 ? (
            <Empty description="No ongoing services" />
          ) : (
            <Space
              direction="vertical"
              size="middle"
              className="my-bookings-list"
            >
              {ongoingBookings.map((booking) => (
                <Card
                  key={booking._id}
                  hoverable
                  className="my-bookings-card"
                  onClick={() =>
                    navigate(`/business-owner/services/${booking._id}`)
                  }
                >
                  <div className="my-bookings-card-content">
                    <div className="my-bookings-main">
                      <div className="my-bookings-title">
                        <Text strong>{booking.complianceItemId?.name}</Text>
                        <Tag color={getStatusColor(booking.status)}>
                          {getStatusText(booking.status)}
                        </Tag>
                      </div>

                      <Text type="secondary">
                        by {booking.providerId?.companyName}
                      </Text>

                      <div className="my-bookings-meta">
                        <span>
                          <StarFilled />{" "}
                          {booking.providerId?.rating?.toFixed(1)}
                        </span>
                        <span>
                          Booked:{" "}
                          {new Date(booking.bookedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="my-bookings-price">
                      ₹{booking.agreedPrice}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </div>

        {/* Completed */}
        <div className="my-bookings-section">
          <Title level={5}>Completed Services</Title>

          {completedBookings.length === 0 ? (
            <Empty description="No completed services" />
          ) : (
            <Space
              direction="vertical"
              size="middle"
              className="my-bookings-list"
            >
              {completedBookings.map((booking) => (
                <Card
                  key={booking._id}
                  hoverable
                  className="my-bookings-card completed"
                  onClick={() =>
                    navigate(`/business-owner/services/${booking._id}`)
                  }
                >
                  <div className="my-bookings-card-content">
                    <div className="my-bookings-main">
                      <div className="my-bookings-title">
                        <Text strong>{booking.complianceItemId?.name}</Text>
                        <Tag color="green">Completed</Tag>
                      </div>

                      <Text type="secondary">
                        by {booking.providerId?.companyName}
                      </Text>

                      <div className="my-bookings-meta">
                        <span>
                          <StarFilled />{" "}
                          {booking.providerId?.rating?.toFixed(1)}
                        </span>
                        <span>
                          Completed:{" "}
                          {new Date(
                            booking.actualCompletionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="my-bookings-price">
                      ₹{booking.agreedPrice}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
