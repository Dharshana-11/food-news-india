import { useState, useEffect } from "react";
import { Card, Input, Tag, Spin, message, Empty } from "antd";
import { SearchOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";
import "./MyServices.css";

const MyServices = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const ongoingServices = filteredBookings.filter((b) =>
    ["pending", "accepted", "in_progress", "documents_submitted"].includes(
      b.status
    )
  );
  const completedServices = filteredBookings.filter(
    (b) => b.status === "completed"
  );

  if (loading) {
    return (
      <div className="services-loader-wrapper">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="my-services-page">
      <div className="my-services-container">
        {/* Header */}
        <div className="my-services-header">
          <h2>My Services</h2>
        </div>

        {/* Search */}
        <Input
          placeholder="Search services here"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
          className="my-services-search"
        />

        {/* Quick Actions */}
        <Card className="quick-actions-card">
          <div className="quick-actions-grid">
            <div
              className="action-item"
              onClick={() => navigate("/business-owner/services/book")}
            >
              <div className="action-icon book">📋</div>
              <span>Book Services</span>
            </div>

            <div
              className="action-item"
              onClick={() => navigate("/business-owner/services/bookings")}
            >
              <div className="action-icon bookings">📑</div>
              <span>My Bookings</span>
            </div>

            <div
              className="action-item"
              onClick={() => navigate("/business-owner/services/track")}
            >
              <div className="action-icon track">📦</div>
              <span>Track Services</span>
            </div>
          </div>
        </Card>

        {/* Ongoing Services */}
        <div className="services-section">
          <h3 className="section-title">Ongoing Services</h3>
          {ongoingServices.length === 0 ? (
            <Empty description="No ongoing services" className="empty-state" />
          ) : (
            <div className="services-list">
              {ongoingServices.map((booking) => (
                <Card
                  key={booking._id}
                  className="service-card"
                  onClick={() =>
                    navigate(`/business-owner/services/${booking._id}`)
                  }
                  hoverable
                >
                  <div className="service-card-content">
                    <div className="service-icon">🏛️</div>

                    <div className="service-info">
                      <div className="service-header">
                        <span className="service-name">
                          {booking.serviceId?.name}
                        </span>
                        <Tag color={getStatusColor(booking.status)}>
                          {getStatusText(booking.status)}
                        </Tag>
                      </div>

                      <div className="service-provider">
                        by {booking.providerId?.companyName}
                      </div>

                      <div className="service-footer">
                        <span className="service-date">
                          Booked:{" "}
                          {new Date(booking.bookedAt).toLocaleDateString()}
                        </span>
                        <span className="service-price">
                          ₹{booking.agreedPrice}
                        </span>
                      </div>
                    </div>

                    <ArrowRightOutlined className="arrow-icon" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Services */}
        <div className="services-section">
          <h3 className="section-title">Completed Services</h3>
          {completedServices.length === 0 ? (
            <Empty
              description="No completed services"
              className="empty-state"
            />
          ) : (
            <div className="services-list">
              {completedServices.map((booking) => (
                <Card
                  key={booking._id}
                  className="service-card completed"
                  onClick={() =>
                    navigate(`/business-owner/services/${booking._id}`)
                  }
                  hoverable
                >
                  <div className="service-card-content">
                    <div className="service-icon">🏛️</div>

                    <div className="service-info">
                      <div className="service-header">
                        <span className="service-name">
                          {booking.serviceId?.name}
                        </span>
                        <Tag color="green">Completed</Tag>
                      </div>

                      <div className="service-provider">
                        by {booking.providerId?.companyName}
                      </div>

                      <div className="service-footer">
                        <span className="service-date">
                          Completed:{" "}
                          {new Date(
                            booking.actualCompletionDate
                          ).toLocaleDateString()}
                        </span>
                        <span className="service-price">
                          ₹{booking.agreedPrice}
                        </span>
                      </div>
                    </div>

                    <ArrowRightOutlined className="arrow-icon" />
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

export default MyServices;
