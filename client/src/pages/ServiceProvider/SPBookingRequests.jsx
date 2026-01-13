import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Spin,
  Empty,
  Button,
  Tag,
  Modal,
  message,
  Space,
} from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { TextArea } = Input;

import spBookingService from "../../services/serviceProviderBookingService";
import "./SPBookingRequests.css";

const SPBookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await spBookingService.getBookingRequests({
        search: searchTerm,
      });
      setRequests(response.data || []);
    } catch (error) {
      message.error("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    Modal.confirm({
      title: "Accept Booking?",
      content: "Are you sure you want to accept this booking request?",
      okText: "Yes, Accept",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await spBookingService.acceptBooking(bookingId);
          message.success("Booking accepted successfully!");
          fetchRequests();
        } catch (error) {
          message.error("Failed to accept booking");
        }
      },
    });
  };

  const handleReject = (booking) => {
    setSelectedBooking(booking);
    setRejectModal(true);
  };

  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      message.warning("Please provide a rejection reason");
      return;
    }

    try {
      setSubmitting(true);
      await spBookingService.rejectBooking(selectedBooking._id, rejectReason);
      message.success("Booking rejected");
      setRejectModal(false);
      setRejectReason("");
      setSelectedBooking(null);
      fetchRequests();
    } catch (error) {
      message.error("Failed to reject booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="sp-booking-requests-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="sp-booking-requests-container">
      {/* Header */}
      <div className="sp-booking-requests-header">
        <div>
          <h2>Booking Requests</h2>
          <p>Review and respond to new booking requests</p>
        </div>
      </div>

      {/* Search */}
      <Search
        placeholder="Search by booking ID or business name"
        allowClear
        size="large"
        // prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onSearch={fetchRequests}
        className="sp-booking-requests-search"
      />

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <Empty description="No pending booking requests" />
        </Card>
      ) : (
        <div className="sp-booking-requests-list">
          {requests.map((request) => (
            <Card key={request._id} className="sp-booking-request-card">
              <div className="sp-booking-request-header">
                <div className="sp-booking-request-info">
                  <h3>{request.complianceItemId?.name}</h3>
                  <div className="sp-booking-request-id">
                    Booking ID: {request.bookingId}
                  </div>
                </div>
                <Tag color="orange" icon={<ClockCircleOutlined />}>
                  Pending
                </Tag>
              </div>

              <div className="sp-booking-request-details">
                <div className="sp-booking-request-row">
                  <UserOutlined />
                  <span>{request.businessOwnerId?.name}</span>
                </div>
                <div className="sp-booking-request-row">
                  <CalendarOutlined />
                  <span>
                    Booked on {new Date(request.bookedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="sp-booking-request-row price">
                  <span>Agreed Price:</span>
                  <strong>₹{request.agreedPrice}</strong>
                </div>
              </div>

              <div className="sp-booking-request-actions">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(request)}
                >
                  Reject
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleAccept(request._id)}
                >
                  Accept
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        title="Reject Booking"
        open={rejectModal}
        onCancel={() => {
          setRejectModal(false);
          setRejectReason("");
          setSelectedBooking(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setRejectModal(false);
              setRejectReason("");
              setSelectedBooking(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={submitting}
            onClick={submitRejection}
          >
            Reject Booking
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <p>Please provide a reason for rejecting this booking:</p>
          <TextArea
            rows={4}
            placeholder="e.g., Unable to meet the deadline, Resource unavailable..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default SPBookingRequests;
