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
} from "antd";
import {
  ArrowLeftOutlined,
  StarFilled,
  CheckCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import myServiceServices from "../../../services/myServicesService";
import bookingService from "../../../services/bookingService";
import "./ProviderDetails.css";

const { TextArea } = Input;

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
        <p>Provider not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="provider-details-page">
      <div className="provider-details-container">
        {/* Header */}
        <div className="details-header">
          <ArrowLeftOutlined
            className="back-icon"
            onClick={() => navigate(-1)}
          />
          <h2>{provider.companyName}</h2>
        </div>
        {/* Provider Info Card */}
        <Card className="provider-info-card">
          <div className="provider-banner">
            <div className="provider-logo">
              <div className="logo-circle">
                {provider.companyName?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="provider-main-info">
            <div className="company-name">{provider.companyName}</div>

            <div className="rating-row">
              <span className="rating-score">
                {provider.rating?.toFixed(1) || "0.0"}
              </span>
              <StarFilled className="star" />
            </div>

            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <div className="info-item">
                <CheckCircleOutlined className="icon verified" />
                <span>Verified Service Partner</span>
              </div>

              <div className="info-item">
                <EnvironmentOutlined className="icon" />
                <span>{provider.location}</span>
              </div>

              <div className="info-item">
                <CheckCircleOutlined className="icon" />
                <span>₹{provider.priceForThisItem}</span>
              </div>
            </Space>
          </div>
        </Card>
        {/* Why Choose Card */}
        <Card className="why-choose-card" title="Why you should choose us?">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div className="benefit-item">
              ✓{" "}
              {provider.description || "Expert service with quality guarantee"}
            </div>
            <div className="benefit-item">
              ✓ {provider.totalCustomers}+ Happy Customers
            </div>
            <div className="benefit-item">
              ✓ {provider.completedBookings}+ Successful Completions
            </div>
          </Space>
        </Card>
        Required Documents
        {/* {service?.requiredDocuments && service.requiredDocuments.length > 0 && (
          <Card className="documents-card" title="Required Documents">
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              {service.requiredDocuments.map((doc, index) => (
                <div key={index} className="document-item">
                  <CheckCircleOutlined className="check-icon" />
                  <span>{doc}</span>
                  <Tag color="green">✓</Tag>
                </div>
              ))}
            </Space>

            <div className="vault-action">
              <Button
                type="link"
                icon={<span>📁</span>}
                onClick={() => navigate("/business-owner/documents")}
              >
                Attach from Vault
              </Button>
            </div>
          </Card>
        )} */}
        <Card className="documents-card" title="Documents">
          <p style={{ color: "#666", margin: 0 }}>
            Required documents will be requested by the service provider after
            booking.
          </p>
        </Card>
        {/* Book Button */}
        <div className="book-action">
          <Button
            type="primary"
            size="large"
            block
            onClick={() => setBookingModal(true)}
            className="book-button"
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
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
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <strong>Service:</strong> {service?.name}
          </div>
          <div>
            <strong>Provider:</strong> {provider.companyName}
          </div>
          <div>
            <strong>Price:</strong> ₹{provider.priceForThisItem}
          </div>
          <Divider />
          <div>
            <div style={{ marginBottom: 8 }}>
              <strong>Additional Notes (Optional):</strong>
            </div>
            <TextArea
              rows={4}
              placeholder="Add any special requirements or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ProviderDetails;
