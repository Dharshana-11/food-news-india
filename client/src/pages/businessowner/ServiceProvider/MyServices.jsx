import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Tag,
  Spin,
  message,
  Empty,
  Typography,
  Space,
  Button,
  Divider,
} from "antd";
import {
  SearchOutlined,
  ArrowRightOutlined,
  FileAddOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import bookingService from "../../../services/bookingService";
import "./MyServices.css";

const { Title, Text } = Typography;

/**
 * MyServices
 * -----------------------------------------------------------------------------
 * Displays all booked compliance services for a Business Owner.
 * - Supports search by service or provider
 * - Separates ongoing and completed services
 * - Provides quick navigation actions
 */
const MyServices = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  /**
   * Fetch bookings for the current user
   */
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings({
        sortBy: "bookedAt",
        sortOrder: "desc",
      });
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resolve AntD tag color for booking status
   */
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

  /**
   * Human-readable status text
   */
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

  /**
   * Search filtering
   */
  const filteredBookings = bookings.filter((booking) => {
    const serviceName = booking.complianceItemId?.name?.toLowerCase() || "";
    const providerName = booking.providerId?.companyName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return serviceName.includes(search) || providerName.includes(search);
  });

  const ongoingServices = filteredBookings.filter((booking) =>
    ["pending", "accepted", "in_progress", "documents_submitted"].includes(
      booking.status
    )
  );

  const completedServices = filteredBookings.filter(
    (booking) => booking.status === "completed"
  );

  if (loading) {
    return (
      <div className="my-services-loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="my-services-page">
      <div className="my-services-container">
        {/* Header */}
        <div className="my-services-header">
          <Title level={3}>My Services</Title>
          <Text type="secondary">
            Track, manage, and review your booked compliance services
          </Text>
        </div>

        {/* Search */}
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search by service or provider"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="my-services-search"
        />

        {/* Quick Actions */}
        <Card className="my-services-quick-actions">
          <div className="my-services-quick-actions-row">
            <Button
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => navigate("/business-owner/services/book")}
            >
              Book Services
            </Button>

            <Button
              icon={<ProfileOutlined />}
              onClick={() => navigate("/business-owner/services/bookings")}
            >
              My Bookings
            </Button>
          </div>
        </Card>

        {/* Ongoing Services */}
        <div className="my-services-section">
          <Title level={4}>Ongoing Services</Title>

          {ongoingServices.length === 0 ? (
            <Empty description="No ongoing services" />
          ) : (
            <Space
              direction="vertical"
              size="middle"
              className="my-services-list"
            >
              {ongoingServices.map((booking) => (
                <Card
                  key={booking._id}
                  hoverable
                  className="my-services-card"
                  onClick={() =>
                    navigate(`/business-owner/services/${booking._id}`)
                  }
                >
                  <div className="my-services-card-content">
                    <div className="my-services-card-main">
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Text strong className="my-services-name">
                            {booking.complianceItemId?.name}
                          </Text>
                          <Tag color={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Tag>
                        </Space>

                        <Text type="secondary">
                          by {booking.providerId?.companyName}
                        </Text>

                        <Space size="large" className="my-services-meta">
                          <Text type="secondary">
                            Booked:{" "}
                            {new Date(booking.bookedAt).toLocaleDateString()}
                          </Text>
                          <Text strong className="my-services-price">
                            ₹{booking.agreedPrice}
                          </Text>
                        </Space>
                      </Space>
                    </div>

                    <ArrowRightOutlined className="my-services-arrow" />
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </div>

        <Divider />

        {/* Completed Services */}
        <div className="my-services-section">
          <Title level={4}>Completed Services</Title>

          {completedServices.length === 0 ? (
            <Empty description="No completed services" />
          ) : (
            <Space
              direction="vertical"
              size="middle"
              className="my-services-list"
            >
              {completedServices.map((booking) => (
                <Card
                  key={booking._id}
                  hoverable
                  className="my-services-card my-services-card-completed"
                  onClick={() =>
                    navigate(`/business-owner/services/${booking._id}`)
                  }
                >
                  <div className="my-services-card-content">
                    <div className="my-services-card-main">
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Text strong className="my-services-name">
                            {booking.complianceItemId?.name}
                          </Text>
                          <Tag color="green">Completed</Tag>
                        </Space>

                        <Text type="secondary">
                          by {booking.providerId?.companyName}
                        </Text>

                        <Space size="large" className="my-services-meta">
                          <Text type="secondary">
                            Completed:{" "}
                            {new Date(
                              booking.actualCompletionDate
                            ).toLocaleDateString()}
                          </Text>
                          <Text strong className="my-services-price">
                            ₹{booking.agreedPrice}
                          </Text>
                        </Space>
                      </Space>
                    </div>

                    <ArrowRightOutlined className="my-services-arrow" />
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

export default MyServices;
