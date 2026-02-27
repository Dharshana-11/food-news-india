import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Tag,
  Timeline,
  Empty,
  Modal,
  Input,
  Select,
  Upload,
  message,
  Divider,
  Space,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  UploadOutlined,
  SendOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./SPBookingDetails.css";
import spBookingService from "../../services/serviceProviderBookingService";

const { TextArea } = Input;

const SPBookingDetails = () => {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [validFrom, setValidFrom] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await spBookingService.getBookingById(bookingId);

      if (response.success) {
        setBooking(response.data);
      } else {
        message.error(response.message || "Failed to load booking details");
      }
    } catch (error) {
      console.error("Fetch booking details error:", error);
      message.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = async () => {
    if (!updateMessage.trim()) {
      message.warning("Please enter an update message");
      return;
    }

    try {
      setSubmitting(true);
      const response = await spBookingService.postServiceUpdate(bookingId, {
        message: updateMessage,
        status: updateStatus || undefined,
      });

      if (response.success) {
        message.success("Update posted successfully");
        setUpdateModal(false);
        setUpdateMessage("");
        setUpdateStatus("");
        fetchBookingDetails();
      } else {
        message.error(response.message || "Failed to post update");
      }
    } catch (error) {
      console.error("Post update error:", error);
      message.error(error.message || "Failed to post update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDeliverables = async () => {
    if (fileList.length === 0) {
      message.warning("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj);

    if (validFrom) {
      formData.append("validFrom", validFrom.toISOString());
    }

    try {
      setSubmitting(true);
      const response = await spBookingService.uploadDeliverables(
        bookingId,
        formData,
      );

      if (response.success) {
        message.success("Deliverable uploaded successfully");
        setUploadModal(false);
        setFileList([]);
        setValidFrom(null);
        fetchBookingDetails();
      } else {
        message.error(response.message || "Failed to upload deliverable");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error(error.message || "Failed to upload deliverable");
    } finally {
      setSubmitting(false);
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

  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      accepted: [{ value: "in_progress", label: "Start Work" }],
      in_progress: [
        { value: "documents_submitted", label: "Submit Documents" },
      ],
      documents_submitted: [{ value: "completed", label: "Mark as Completed" }],
    };
    return transitions[currentStatus] || [];
  };

  const viewDocument = (docId) => {
    const url = spBookingService.getDocumentViewUrl(docId);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="sp-booking-details-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="sp-booking-details-error">
        <Empty description="Booking not found" />
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const statusTransitions = getAvailableStatusTransitions(booking.status);

  return (
    <div className="sp-booking-details-page">
      <div className="sp-booking-details-container">
        {/* Header */}
        <div className="sp-booking-details-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="sp-booking-details-back"
          ></Button>
          <div className="sp-booking-details-title-section">
            <h2>Booking Details</h2>
            <p>Booking ID: {booking.bookingId}</p>
          </div>
        </div>

        {/* Service Info Card */}
        <Card className="sp-booking-details-card sp-booking-details-service-card">
          <div className="sp-booking-details-top">
            <div>
              <h3>{booking.complianceItemId?.name}</h3>
              <p className="sp-booking-details-code">
                {booking.complianceItemId?.code}
              </p>
            </div>
            <Tag
              color={getStatusColor(booking.status)}
              className="sp-booking-details-status-tag"
            >
              {getStatusText(booking.status)}
            </Tag>
          </div>

          <Divider />

          <div className="sp-booking-details-info-grid">
            <div className="sp-booking-details-info-row">
              <span className="sp-booking-details-label">
                <DollarOutlined /> Agreed Price
              </span>
              <strong className="sp-booking-details-value">
                ₹{booking.agreedPrice}
              </strong>
            </div>

            <div className="sp-booking-details-info-row">
              <span className="sp-booking-details-label">
                <CalendarOutlined /> Booked On
              </span>
              <strong className="sp-booking-details-value">
                {new Date(booking.bookedAt).toLocaleDateString()}
              </strong>
            </div>

            <div className="sp-booking-details-info-row">
              <span className="sp-booking-details-label">
                <CalendarOutlined /> Expected Completion
              </span>
              <strong className="sp-booking-details-value">
                {new Date(booking.expectedCompletionDate).toLocaleDateString()}
              </strong>
            </div>

            {booking.actualCompletionDate && (
              <div className="sp-booking-details-info-row">
                <span className="sp-booking-details-label">
                  <CheckCircleOutlined /> Completed On
                </span>
                <strong className="sp-booking-details-value">
                  {new Date(booking.actualCompletionDate).toLocaleDateString()}
                </strong>
              </div>
            )}
          </div>
        </Card>

        {/* Business Owner Info */}
        <Card
          title="Business Owner Information"
          className="sp-booking-details-card"
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div className="sp-booking-details-info-row">
              <span className="sp-booking-details-label">
                <UserOutlined /> Name
              </span>
              <strong className="sp-booking-details-value">
                {booking.businessOwnerId?.name}
              </strong>
            </div>

            {booking.businessOwnerId?.phone && (
              <div className="sp-booking-details-info-row">
                <span className="sp-booking-details-label">
                  <PhoneOutlined /> Phone
                </span>
                <strong className="sp-booking-details-value">
                  {booking.businessOwnerId.phone}
                </strong>
              </div>
            )}

            {booking.businessOwnerId?.email && (
              <div className="sp-booking-details-info-row">
                <span className="sp-booking-details-label">
                  <MailOutlined /> Email
                </span>
                <strong className="sp-booking-details-value">
                  {booking.businessOwnerId.email}
                </strong>
              </div>
            )}
          </Space>
        </Card>

        {/* Timeline */}
        <Card title="Progress Timeline" className="sp-booking-details-card">
          {booking.timeline?.length > 0 ? (
            <Timeline>
              {booking.timeline.map((event, index) => (
                <Timeline.Item
                  key={index}
                  dot={
                    event.status === "completed" ? (
                      <CheckCircleOutlined
                        style={{ fontSize: "16px", color: "#52c41a" }}
                      />
                    ) : (
                      <ClockCircleOutlined style={{ fontSize: "16px" }} />
                    )
                  }
                  color={getStatusColor(event.status)}
                >
                  <div className="sp-booking-timeline-item">
                    <div className="sp-booking-timeline-status">
                      {getStatusText(event.status)}
                    </div>
                    <div className="sp-booking-timeline-date">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    {event.message && (
                      <div className="sp-booking-timeline-message">
                        {event.message}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="No updates yet" />
          )}
        </Card>

        {/* Deliverables */}
        <Card title="Uploaded Deliverables" className="sp-booking-details-card">
          {booking.deliverables?.length > 0 ? (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {booking.deliverables.map((doc, index) => (
                <div key={index} className="sp-booking-deliverable">
                  <div className="sp-booking-deliverable-info">
                    <FileTextOutlined />
                    <div>
                      <div className="sp-booking-deliverable-name">
                        {doc.file?.originalName}
                      </div>
                      <div className="sp-booking-deliverable-date">
                        Uploaded: {new Date(doc.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => viewDocument(doc._id)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </Space>
          ) : (
            <Empty description="No deliverables uploaded yet" />
          )}
        </Card>

        {/* Action Buttons */}
        {booking.status !== "completed" && booking.status !== "cancelled" && (
          <div className="sp-booking-details-actions">
            <Button
              type="default"
              size="large"
              icon={<SendOutlined />}
              onClick={() => setUpdateModal(true)}
              block
            >
              Post Update
            </Button>

            {booking.status !== "rejected" && (
              <Button
                type="primary"
                size="large"
                icon={<UploadOutlined />}
                onClick={() => setUploadModal(true)}
                block
              >
                Upload Deliverable
              </Button>
            )}
          </div>
        )}

        {/* Post Update Modal */}
        <Modal
          title="Post Service Update"
          open={updateModal}
          onCancel={() => {
            setUpdateModal(false);
            setUpdateMessage("");
            setUpdateStatus("");
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setUpdateModal(false);
                setUpdateMessage("");
                setUpdateStatus("");
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={submitting}
              onClick={handlePostUpdate}
            >
              Post Update
            </Button>,
          ]}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <label className="sp-booking-modal-label">Update Message *</label>
              <TextArea
                rows={4}
                placeholder="Describe the progress or update..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
              />
            </div>

            {statusTransitions.length > 0 && (
              <div>
                <label className="sp-booking-modal-label">
                  Change Status (Optional)
                </label>
                <Select
                  allowClear
                  placeholder="Keep current status"
                  value={updateStatus || undefined}
                  onChange={setUpdateStatus}
                  style={{ width: "100%" }}
                  options={statusTransitions}
                />
              </div>
            )}
          </Space>
        </Modal>

        {/* Upload Deliverable Modal */}
        <Modal
          title="Upload Deliverable"
          open={uploadModal}
          onCancel={() => {
            setUploadModal(false);
            setFileList([]);
            setValidFrom(null);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setUploadModal(false);
                setFileList([]);
                setValidFrom(null);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={submitting}
              onClick={handleUploadDeliverables}
              disabled={fileList.length === 0}
            >
              Upload
            </Button>,
          ]}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <label className="sp-booking-modal-label">Select File *</label>
              <Upload
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                accept=".pdf,.jpg,.jpeg,.png"
              >
                <Button icon={<UploadOutlined />} block>
                  Choose File
                </Button>
              </Upload>
              <p className="sp-booking-modal-hint">
                Supported formats: PDF, JPG, PNG (Max 5MB)
              </p>
            </div>

            <div>
              <label className="sp-booking-modal-label">
                Valid From (Optional)
              </label>
              <DatePicker
                value={validFrom}
                onChange={setValidFrom}
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </div>
          </Space>
        </Modal>
      </div>
    </div>
  );
};

export default SPBookingDetails;
