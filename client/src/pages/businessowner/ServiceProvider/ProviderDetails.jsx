import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spin,
  message,
  Tag,
  Modal,
  Input,
  Space,
  Divider,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  StarFilled,
  CheckCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import myServiceServices from "../../../services/myServicesService";
import bookingService from "../../../services/bookingService";
import "./ProviderDetails.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

const ProviderDetails = () => {
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { serviceId, providerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (serviceId && providerId) {
      fetchData();
    }
  }, [serviceId, providerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [serviceRes, providersRes] = await Promise.all([
        myServiceServices.getServiceById(serviceId),
        myServiceServices.getServiceProviders(serviceId),
      ]);

      setService(serviceRes.data);
      const foundProvider = providersRes.data.find((p) => p._id === providerId);
      setProvider(foundProvider);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load provider details");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      setSubmitting(true);
      await bookingService.createBooking({
        complianceItemId: serviceId,
        providerId,
        agreedPrice: provider.priceForThisItem,
        estimatedDays: provider.estimatedDaysForThisItem,
        notes,
      });

      message.success("Service booked successfully!");
      setBookingModal(false);
      navigate("/business-owner/services/bookings");
    } catch (error) {
      console.error("Error creating booking:", error);
      message.error("Failed to book service");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="provider-details-loader">
        <Spin size="large" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-details-error">
        <Text>Provider not found</Text>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="provider-details-page">
      <div className="provider-details-container">
        {/* Header */}
        <div className="provider-details-header">
          <ArrowLeftOutlined
            className="provider-details-back"
            onClick={() => navigate(-1)}
          />
          <Title level={4}>{provider.companyName}</Title>
        </div>

        {/* Provider Card */}
        <Card className="provider-details-card">
          <div className="provider-details-card-header">
            <div className="provider-details-avatar">
              {provider.companyName?.charAt(0).toUpperCase()}
            </div>

            <div className="provider-details-main">
              <Text strong className="provider-details-name">
                {provider.companyName}
              </Text>

              <Space size="small" className="provider-details-rating">
                <StarFilled />
                <span>{provider.rating?.toFixed(1) || "0.0"}</span>
                <Tag color="green">Verified</Tag>
              </Space>

              <Space direction="vertical" size={6}>
                <div className="provider-details-info">
                  <EnvironmentOutlined />
                  <span>{provider.location}</span>
                </div>

                <div className="provider-details-info">
                  <CheckCircleOutlined />
                  <span>Verified Service Partner</span>
                </div>
              </Space>
            </div>

            <div className="provider-details-price">
              ₹{provider.priceForThisItem}
            </div>
          </div>
        </Card>

        {/* Why Choose */}
        <Card className="provider-details-section">
          <Title level={5}>Why choose this provider</Title>

          <Space direction="vertical" size={8}>
            <Text>
              <CheckCircleOutlined />{" "}
              {provider.description || "Expert service with quality guarantee"}
            </Text>
            <Text>
              <CheckCircleOutlined /> {provider.totalCustomers}+ happy customers
            </Text>
            <Text>
              <CheckCircleOutlined /> {provider.completedBookings}+ successful
              completions
            </Text>
          </Space>
        </Card>

        {/* Documents */}
        <Card className="provider-details-section">
          <Title level={5}>Documents</Title>
          <Text type="secondary">
            Required documents will be requested by the service provider after
            booking.
          </Text>
        </Card>
      </div>

      {/* Sticky CTA */}
      <div className="provider-details-cta">
        <Button
          type="primary"
          size="large"
          block
          onClick={() => setBookingModal(true)}
        >
          Book Now
        </Button>
      </div>

      {/* Booking Modal */}
      <Modal
        title="Confirm Booking"
        open={bookingModal}
        onCancel={() => setBookingModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setBookingModal(false)}>
            Cancel
          </Button>,
          <Button
            key="book"
            type="primary"
            loading={submitting}
            onClick={handleBooking}
          >
            Confirm Booking
          </Button>,
        ]}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Text>
            <strong>Service:</strong> {service?.name}
          </Text>
          <Text>
            <strong>Provider:</strong> {provider.companyName}
          </Text>
          <Text>
            <strong>Price:</strong> ₹{provider.priceForThisItem}
          </Text>

          <Divider />

          <TextArea
            rows={4}
            placeholder="Additional notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default ProviderDetails;
