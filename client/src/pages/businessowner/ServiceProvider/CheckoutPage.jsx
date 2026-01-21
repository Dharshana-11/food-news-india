import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Card,
  Button,
  Divider,
  Typography,
  Space,
  message,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useAgentContext } from "../../../context/AgentContext";
import bookingService from "../../../services/bookingService";
import myServiceServices from "../../../services/myServicesService";
import ROLES from "../../../constants/roles";
import "./CheckoutPage.css";

const { Title, Text, Paragraph } = Typography;

/**
 * CheckoutPage
 * -----------------------------------------------------------------------------
 * Handles offline payment confirmation and booking creation.
 *
 * Flow:
 * 1. Shows service details and payment info
 * 2. User confirms offline payment (UPI/Bank Transfer)
 * 3. Creates booking with "pending" status
 * 4. Redirects to My Bookings
 *
 * Supports both Business Owner and Agent roles
 */
const CheckoutPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  const { currentUser } = useAuth();
  const role = currentUser?.role;

  let activeBusiness = null;
  if (role === ROLES.AGENT) {
    ({ activeBusiness } = useAgentContext());
  }

  const navigate = useNavigate();
  const location = useLocation();
  const { serviceId, providerId } = useParams();

  const PAYMENT_INFO = {
    upiId: import.meta.env.VITE_PAYMENT_UPI_ID,
    accountNumber: import.meta.env.VITE_PAYMENT_ACCOUNT_NUMBER,
    ifscCode: import.meta.env.VITE_PAYMENT_IFSC,
    accountName: import.meta.env.VITE_PAYMENT_ACCOUNT_NAME,
    qrCodeUrl: import.meta.env.VITE_PAYMENT_QR_URL,
  };

  if (!PAYMENT_INFO.upiId || !PAYMENT_INFO.qrCodeUrl) {
    console.warn("⚠ Missing payment info from environment variables.");
  }

  useEffect(() => {
    // Get booking data from navigation state
    const data = location.state;

    if (!data || !serviceId || !providerId) {
      message.error("Invalid checkout session");
      navigate(-1);
      return;
    }

    if (role === ROLES.AGENT && !activeBusiness) {
      message.error("Please select a business first");
      navigate(-1);
      return;
    }

    setBookingData(data);
    fetchServiceDetails();
  }, [serviceId, providerId]);

  const fetchServiceDetails = async () => {
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
      console.error("Error fetching details:", error);
      message.error("Failed to load checkout details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard`);
  };

  const handleConfirmPayment = async () => {
    try {
      setSubmitting(true);

      const payload = {
        complianceItemId: serviceId,
        providerId,
        agreedPrice: bookingData.agreedPrice,
        estimatedDays: bookingData.estimatedDays,
        notes: bookingData.notes || "",
      };

      // Add businessOwnerId for Agent role
      if (role === ROLES.AGENT) {
        payload.businessOwnerId = activeBusiness;
      }

      await bookingService.createBooking(payload);

      message.success({
        content:
          "Booking created successfully! Provider will review your request.",
        duration: 4,
      });

      // Navigate to appropriate bookings page
      const bookingsRoute =
        role === ROLES.AGENT
          ? "/agent/services/bookings"
          : "/business-owner/services/bookings";

      navigate(bookingsRoute, { replace: true });
    } catch (error) {
      console.error("Error creating booking:", error);
      message.error(error.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!service || !provider || !bookingData) {
    return (
      <div className="checkout-error">
        <Text>Unable to load checkout information</Text>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <ArrowLeftOutlined
            className="checkout-back"
            onClick={() => navigate(-1)}
          />
          <Title level={4}>Complete Payment</Title>
        </div>

        {/* Alert */}
        <Alert
          message="Offline Payment"
          description="Complete the payment via UPI or bank transfer, then confirm below. Your booking will be reviewed by the service provider."
          type="info"
          showIcon
          className="checkout-alert"
        />

        {/* Order Summary */}
        <Card className="checkout-card">
          <Title level={5} className="checkout-card-title">
            Order Summary
          </Title>

          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <Text className="checkout-label">Service</Text>
              <Text strong>{service.name}</Text>
            </div>
            <div className="checkout-summary-row">
              <Text className="checkout-label">Provider</Text>
              <Text strong>{provider.companyName}</Text>
            </div>
            <div className="checkout-summary-row">
              <Text className="checkout-label">Estimated Duration</Text>
              <Text>{bookingData.estimatedDays} days</Text>
            </div>

            <Divider className="checkout-divider" />

            <div className="checkout-summary-row checkout-total">
              <Text className="checkout-label">Total Amount</Text>
              <Text className="checkout-amount">
                ₹{bookingData.agreedPrice}
              </Text>
            </div>
          </div>
        </Card>

        {/* Payment Instructions */}
        <Card className="checkout-card">
          <Title level={5} className="checkout-card-title">
            <QrcodeOutlined /> Payment Details
          </Title>

          <div className="checkout-payment">
            {/* QR Code Section */}
            <div className="checkout-payment-section checkout-qr-section">
              <Text className="checkout-payment-title">Scan QR Code</Text>
              <div className="checkout-qr-container">
                <div className="checkout-qr-wrapper">
                  <img
                    src={PAYMENT_INFO.qrCodeUrl}
                    alt="UPI QR Code"
                    className="checkout-qr-image"
                  />
                  <Text type="secondary" className="checkout-qr-hint">
                    Scan with any UPI app
                  </Text>
                </div>
              </div>
            </div>

            {/* UPI Section */}
            <div className="checkout-payment-section checkout-upi-section">
              <div className="checkout-payment-header">
                <Divider className="checkout-payment-divider-mobile">
                  OR
                </Divider>
                <Text className="checkout-payment-title">UPI Payment</Text>
              </div>
              <div className="checkout-payment-detail">
                <div className="checkout-payment-info">
                  <Text type="secondary">UPI ID</Text>
                  <Text strong className="checkout-payment-value">
                    {PAYMENT_INFO.upiId}
                  </Text>
                </div>
                <Button
                  icon={<CopyOutlined />}
                  size="small"
                  onClick={() => handleCopy(PAYMENT_INFO.upiId, "UPI ID")}
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Bank Transfer Section */}
            <div className="checkout-payment-section checkout-bank-section">
              <div className="checkout-payment-header">
                <Divider className="checkout-payment-divider-mobile">
                  OR
                </Divider>
                <Text className="checkout-payment-title">Bank Transfer</Text>
              </div>

              <div className="checkout-bank-details">
                <div className="checkout-payment-detail">
                  <div className="checkout-payment-info">
                    <Text type="secondary">Account Number</Text>
                    <Text strong className="checkout-payment-value">
                      {PAYMENT_INFO.accountNumber}
                    </Text>
                  </div>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() =>
                      handleCopy(PAYMENT_INFO.accountNumber, "Account Number")
                    }
                  >
                    Copy
                  </Button>
                </div>

                <div className="checkout-payment-detail">
                  <div className="checkout-payment-info">
                    <Text type="secondary">IFSC Code</Text>
                    <Text strong className="checkout-payment-value">
                      {PAYMENT_INFO.ifscCode}
                    </Text>
                  </div>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() =>
                      handleCopy(PAYMENT_INFO.ifscCode, "IFSC Code")
                    }
                  >
                    Copy
                  </Button>
                </div>

                <div className="checkout-payment-detail">
                  <div className="checkout-payment-info">
                    <Text type="secondary">Account Name</Text>
                    <Text strong className="checkout-payment-value">
                      {PAYMENT_INFO.accountName}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <Paragraph className="checkout-note">
            <Text type="secondary">
              Note: Please include your booking reference in the payment remarks
              for faster processing.
            </Text>
          </Paragraph> */}
        </Card>

        {/* Confirmation Button */}
        <div className="checkout-actions">
          <Button
            type="primary"
            size="large"
            block
            icon={<CheckCircleOutlined />}
            loading={submitting}
            onClick={handleConfirmPayment}
            className="checkout-confirm-btn"
          >
            I've Completed Payment
          </Button>

          <Button
            size="large"
            block
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="checkout-cancel-btn"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
