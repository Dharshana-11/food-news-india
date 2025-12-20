import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spin,
  message,
  Tag,
  Timeline,
  Empty,
  Modal,
  Rate,
  Input,
  Space,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import bookingService from "../../../services/bookingService";
import "./ServiceDetails.css";

const { TextArea } = Input;

const ServiceDetails = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { bookingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      message.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      setSubmitting(true);
      await bookingService.addRating(bookingId, {
        score: rating,
        comment,
      });
      message.success("Rating submitted successfully!");
      setRatingModal(false);
      fetchBookingDetails();
    } catch (error) {
      console.error("Error submitting rating:", error);
      message.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    Modal.confirm({
      title: "Cancel Booking",
      content: "Are you sure you want to cancel this booking?",
      okText: "Yes, Cancel",
      cancelText: "No",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await bookingService.cancelBooking(
            bookingId,
            "Cancelled by customer"
          );
          message.success("Booking cancelled successfully");
          fetchBookingDetails();
        } catch (error) {
          console.error("Error cancelling booking:", error);
          message.error("Failed to cancel booking");
        }
      },
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined style={{ color: "#ff9800" }} />,
      accepted: <CheckCircleOutlined style={{ color: "#2196f3" }} />,
      in_progress: <ClockCircleOutlined style={{ color: "#2196f3" }} />,
      documents_submitted: <CheckCircleOutlined style={{ color: "#9c27b0" }} />,
      completed: <CheckCircleOutlined style={{ color: "#4caf50" }} />,
      cancelled: <CloseCircleOutlined style={{ color: "#f44336" }} />,
      rejected: <CloseCircleOutlined style={{ color: "#f44336" }} />,
    };
    return icons[status] || <ClockCircleOutlined />;
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
      pending: "Request Submitted",
      accepted: "Accepted",
      in_progress: "Documents Verified",
      documents_submitted: "Application Submitted",
      completed: "License Approved",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="service-details-loader">
        <Spin size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="service-details-error">
        <Empty description="Booking not found" />
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const canRate = booking.status === "completed" && !booking.rating?.score;
  const canCancel = !["completed", "cancelled", "rejected"].includes(
    booking.status
  );

  return (
    <div className="service-details-page">
      <div className="service-details-container">
        {/* Header */}
        <div className="details-header">
          <ArrowLeftOutlined
            className="back-icon"
            onClick={() => navigate(-1)}
          />
          <h2>Service Details</h2>
        </div>

        {/* Service Info Card */}
        <Card className="service-info-card">
          <div className="service-header-row">
            <div className="service-title-section">
              <div className="service-icon">🏛️</div>
              <div>
                <div className="service-name">
                  {booking.complianceItemId?.name}
                </div>
                <div className="service-id">
                  Booking ID: {booking.bookingId}
                </div>
              </div>
            </div>
            <Tag color={getStatusColor(booking.status)} className="status-tag">
              {getStatusText(booking.status)}
            </Tag>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div className="info-row">
              <span className="info-label">Service Provider:</span>
              <span className="info-value">
                {booking.providerId?.companyName}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Booked On:</span>
              <span className="info-value">
                {new Date(booking.bookedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Expected Completion:</span>
              <span className="info-value">
                {new Date(booking.expectedCompletionDate).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </span>
            </div>

            {booking.actualCompletionDate && (
              <div className="info-row">
                <span className="info-label">Completed On:</span>
                <span className="info-value">
                  {new Date(booking.actualCompletionDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            )}

            <div className="info-row price-row">
              <span className="info-label">Total Amount:</span>
              <span className="info-value price">₹{booking.agreedPrice}</span>
            </div>
          </Space>
        </Card>

        {/* Progress Tracker */}
        <Card title="Progress Tracker" className="progress-card">
          {booking.timeline && booking.timeline.length > 0 ? (
            <Timeline>
              {booking.timeline.map((event, index) => (
                <Timeline.Item
                  key={index}
                  dot={getStatusIcon(event.status)}
                  color={getStatusColor(event.status)}
                >
                  <div className="timeline-item">
                    <div className="timeline-status">
                      {getStatusText(event.status)}
                    </div>
                    <div className="timeline-date">
                      {new Date(event.timestamp).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {event.message && (
                      <div className="timeline-message">{event.message}</div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty
              description="No progress updates yet"
              style={{ margin: "20px 0" }}
            />
          )}
        </Card>

        {/* Documents (if any) */}
        {booking.documents && booking.documents.length > 0 && (
          <Card title="Deliverables" className="documents-card">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {booking.documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <span className="doc-icon">📄</span>
                  <span className="doc-name">{doc.name}</span>
                  <Button type="link" size="small">
                    Download
                  </Button>
                </div>
              ))}
            </Space>
          </Card>
        )}

        {/* Support Section */}
        <Card className="support-card">
          <div className="support-header">Support</div>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Button block icon={<PhoneOutlined />} className="support-button">
              Chat with service provider
            </Button>

            <Button block icon={<MessageOutlined />} className="support-button">
              Raise Support Ticket
            </Button>
          </Space>
        </Card>

        {/* Action Buttons */}
        <div className="action-buttons">
          {canCancel && (
            <Button
              danger
              size="large"
              block
              onClick={handleCancelBooking}
              className="action-button"
            >
              Cancel Booking
            </Button>
          )}

          {canRate && (
            <Button
              type="primary"
              size="large"
              block
              onClick={() => setRatingModal(true)}
              className="action-button"
            >
              Rate Service
            </Button>
          )}

          {booking.rating?.score && (
            <Card className="rating-display-card">
              <div className="rating-header">Your Rating</div>
              <Rate disabled value={booking.rating.score} />
              {booking.rating.comment && (
                <div className="rating-comment">{booking.rating.comment}</div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <Modal
        title="Rate Service"
        open={ratingModal}
        onCancel={() => setRatingModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setRatingModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleRatingSubmit}
          >
            Submit Rating
          </Button>,
        ]}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <div style={{ marginBottom: 12, fontWeight: 500 }}>
              How was your experience?
            </div>
            <Rate
              value={rating}
              onChange={setRating}
              style={{ fontSize: 32 }}
            />
          </div>

          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              Comments (Optional):
            </div>
            <TextArea
              rows={4}
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ServiceDetails;
