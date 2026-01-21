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
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  StarFilled,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import myServiceServices from "../../../services/myServicesService";
import "./ProviderDetails.css";
import { useAgentContext } from "../../../context/AgentContext";
import { useAuth } from "../../../context/AuthContext";
import ROLES from "../../../constants/roles";

const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * ProviderDetails
 * -----------------------------------------------------------------------------
 * Shows service provider details and initiates checkout flow.
 *
 * SUPPORTS BOTH:
 * - Business Owner: businessOwnerId = current user
 * - Agent: businessOwnerId from active business context
 *
 * Flow: Provider Details → Checkout Page → Booking Created
 */
const ProviderDetails = () => {
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notesModal, setNotesModal] = useState(false);
  const [notes, setNotes] = useState("");
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  let activeBusiness = null;

  if (role === ROLES.AGENT) {
    ({ activeBusiness } = useAgentContext());
  }

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

  const handleProceedToCheckout = () => {
    // Validate agent has selected business
    if (role === ROLES.AGENT && !activeBusiness) {
      message.error("Please select a business before proceeding");
      return;
    }

    // Prepare booking data for checkout
    const checkoutData = {
      agreedPrice: provider.priceForThisItem,
      estimatedDays: provider.estimatedDaysForThisItem,
      notes: notes.trim(),
    };

    // Navigate to checkout page with booking data
    const checkoutRoute =
      role === ROLES.AGENT
        ? `/agent/services/book/${serviceId}/${providerId}/checkout`
        : `/business-owner/services/book/${serviceId}/${providerId}/checkout`;

    navigate(checkoutRoute, { state: checkoutData });
  };

  const handleBookNow = () => {
    setNotesModal(true);
  };

  const handleModalOk = () => {
    setNotesModal(false);
    handleProceedToCheckout();
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
        <Button type="primary" size="large" block onClick={handleBookNow}>
          Book Now
        </Button>
      </div>

      {/* Optional Notes Modal */}
      <Modal
        title="Add Notes (Optional)"
        open={notesModal}
        onOk={handleModalOk}
        onCancel={() => setNotesModal(false)}
        okText="Proceed to Checkout"
        cancelText="Cancel"
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Text type="secondary">
            Add any special requirements or instructions for the service
            provider
          </Text>

          <TextArea
            rows={4}
            placeholder="e.g., Urgent request, specific requirements, preferred contact time..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            showCount
            styles={{
              textarea: {
                padding: "20px",
              },
            }}
            style={{
              marginBottom: "16px",
            }}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default ProviderDetails;
