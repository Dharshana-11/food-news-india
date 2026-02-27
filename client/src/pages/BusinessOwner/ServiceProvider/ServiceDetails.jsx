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
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MessageOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import bookingService from "../../../services/bookingService";
import "./ServiceDetails.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

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
          await bookingService.cancelBooking(bookingId);
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
      pending: <ClockCircleOutlined />,
      accepted: <CheckCircleOutlined />,
      in_progress: <ClockCircleOutlined />,
      documents_submitted: <CheckCircleOutlined />,
      completed: <CheckCircleOutlined />,
      cancelled: <CloseCircleOutlined />,
      rejected: <CloseCircleOutlined />,
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
      in_progress: "In Progress ",
      documents_submitted: "Uploaded Deliverables",
      completed: "Completed",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  const handleDownload = (doc) => {
    window.open(bookingService.getDocumentDownloadUrl(doc._id), "_blank");
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
    booking.status,
  );

  return (
    <div className="service-details-page">
      <div className="service-details-container">
        {/* Header */}
        <div className="service-details-header">
          <ArrowLeftOutlined
            className="service-details-back"
            onClick={() => navigate(-1)}
          />
          <Title level={4}>Service Details</Title>
        </div>

        {/* Service Info */}
        <Card className="service-details-card">
          <div className="service-details-top">
            <div>
              <Text strong className="service-details-name">
                {booking.complianceItemId?.name}
              </Text>
              <Text type="secondary" className="service-details-id">
                Booking ID: {booking.bookingId}
              </Text>
            </div>

            <Tag color={getStatusColor(booking.status)}>
              {getStatusText(booking.status)}
            </Tag>
          </div>

          <Divider />

          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <div className="service-details-row">
              <span>Business Owner</span>
              <strong>{booking.businessOwnerId?.name || "N/A"}</strong>
            </div>

            <div className="service-details-row">
              <span>Service Provider</span>
              <strong>{booking.providerId?.companyName}</strong>
            </div>

            <div className="service-details-row">
              <span>Booked On</span>
              <strong>
                {new Date(booking.bookedAt).toLocaleDateString("en-IN")}
              </strong>
            </div>

            <div className="service-details-row">
              <span>Expected Completion</span>
              <strong>
                {new Date(booking.expectedCompletionDate).toLocaleDateString(
                  "en-IN",
                )}
              </strong>
            </div>

            {booking.actualCompletionDate && (
              <div className="service-details-row">
                <span>Completed On</span>
                <strong>
                  {new Date(booking.actualCompletionDate).toLocaleDateString(
                    "en-IN",
                  )}
                </strong>
              </div>
            )}

            <div className="service-details-row price">
              <span>Total Amount</span>
              <strong>₹{booking.agreedPrice}</strong>
            </div>
          </Space>
        </Card>

        {/* Timeline */}
        <Card title="Progress Tracker" className="service-details-card">
          {booking.timeline?.length ? (
            <Timeline>
              {booking.timeline.map((event, index) => (
                <Timeline.Item
                  key={index}
                  dot={getStatusIcon(event.status)}
                  color={getStatusColor(event.status)}
                >
                  <div className="service-details-timeline">
                    <div className="timeline-status">
                      {getStatusText(event.status)}
                    </div>
                    <div className="timeline-date">
                      {new Date(event.timestamp).toLocaleString("en-IN")}
                    </div>
                    {event.message && (
                      <div className="timeline-message">{event.message}</div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="No progress updates yet" />
          )}
        </Card>

        {/* Documents */}
        {booking.documents?.length > 0 && (
          <Card title="Deliverables" className="service-details-card">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {booking.deliverables.map((doc, index) => (
                <div key={index} className="service-details-doc">
                  <div className="service-details-doc-info">
                    <FileTextOutlined />
                    <span className="service-details-doc-name">
                      {doc.file.originalName}
                    </span>
                  </div>
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(doc)}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </Space>
          </Card>
        )}

        {/* Support */}
        <Card className="service-details-card">
          <Title level={5}>Support</Title>

          <div className="service-details-support-actions">
            <Button icon={<PhoneOutlined />}>Chat with service provider</Button>

            <Button icon={<MessageOutlined />}>Raise Support Ticket</Button>
          </div>
        </Card>

        {/* Actions */}
        <div className="service-details-actions">
          {canCancel && (
            <Button danger block onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          )}

          {canRate && (
            <Button type="primary" block onClick={() => setRatingModal(true)}>
              Rate Service
            </Button>
          )}

          {booking.rating?.score && (
            <Card className="service-details-card">
              <Title level={5}>Your Rating</Title>
              <Rate disabled value={booking.rating.score} />
              {booking.rating.comment && (
                <Text type="secondary">{booking.rating.comment}</Text>
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
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Rate value={rating} onChange={setRating} />
          <TextArea
            rows={4}
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default ServiceDetails;
