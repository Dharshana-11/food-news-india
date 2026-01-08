import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Spin,
  message,
  Empty,
  Typography,
  Select,
  Alert,
} from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  ExperimentOutlined,
  BookOutlined,
  SolutionOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAgentContext } from "../../../context/AgentContext";
import myServicesService from "../../../services/myServicesService";
import agentBusinessService from "../../../services/agentBusinessService";
import { ROUTES } from "../../../routes";
import "./AgentBookServices.css";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * AgentBookServices
 * -----------------------------------------------------------------------------
 * Agent version of Book Services page.
 *
 * KEY DIFFERENCE from Business Owner:
 * - Requires business selection before showing services
 * - Passes businessOwnerId to booking flow
 *
 * REUSES: Business Owner service card UI
 */
const AgentBookServices = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { activeBusiness, setActiveBusiness } = useAgentContext();

  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchServices();
    }
  }, [selectedBusiness]);

  /**
   * Fetch businesses agent manages
   */
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await agentBusinessService.getMyBusinesses();
      const businessList = response.businesses || [];
      setBusinesses(businessList);

      if (businessList.length > 0 && !selectedBusiness) {
        const defaultBusiness = businessList[0].businessOwnerId;
        setSelectedBusiness(defaultBusiness);
        setActiveBusiness(defaultBusiness);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      message.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch available compliance services
   */
  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await myServicesService.getServices({
        sortBy: "totalBookings",
        sortOrder: "desc",
        limit: 50,
      });
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  /**
   * Search filtering
   */
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Resolve icon based on service category
   */
  const getServiceIcon = (category) => {
    const icons = {
      license: <SafetyCertificateOutlined />,
      certificate: <FileTextOutlined />,
      hygiene: <SolutionOutlined />,
      training: <BookOutlined />,
      compliance: <SafetyCertificateOutlined />,
      testing: <ExperimentOutlined />,
      audit: <AuditOutlined />,
      other: <FileTextOutlined />,
    };

    return icons[category] || <FileTextOutlined />;
  };

  /**
   * Navigate to service providers with business context
   */
  const handleServiceClick = (serviceId) => {
    navigate(ROUTES.AGENT_SERVICE_PROVIDERS.replace(":serviceId", serviceId), {
      state: { businessOwnerId: selectedBusiness },
    });
  };

  if (loading) {
    return (
      <div className="agent-book-services-loader">
        <Spin size="large" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="agent-book-services-page">
        <div className="agent-book-services-container">
          <div className="agent-book-services-header">
            <ArrowLeftOutlined
              className="agent-book-services-back"
              onClick={() => navigate(-1)}
            />
            <h2>Book Services</h2>
          </div>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No businesses assigned yet"
          >
            <Text type="secondary">
              You need to be assigned to a business to book services
            </Text>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-book-services-page">
      <div className="agent-book-services-container">
        {/* Header */}
        <div className="agent-book-services-header">
          <ArrowLeftOutlined
            className="agent-book-services-back"
            onClick={() => navigate(-1)}
          />
          <div>
            <h2>Book Services</h2>
            <Text type="secondary">
              Choose a compliance service for your business
            </Text>
          </div>
        </div>

        {/* Business Selector */}
        {/* <Card className="agent-book-services-business-selector"> */}
        <div className="agent-book-services-selector-content">
          <ShopOutlined className="agent-book-services-selector-icon" />
          <div className="agent-book-services-selector-text">
            <Text strong>Select Business</Text>
            <Select
              size="large"
              value={selectedBusiness}
              onChange={setSelectedBusiness}
              style={{ width: "100%" }}
              placeholder="Choose a business"
              options={businesses.map((b) => ({
                value: b.businessOwnerId,
                label: b.businessName,
                business: b,
              }))}
              optionRender={(option) => {
                const b = option.data.business;

                return (
                  <div className="business-option">
                    <div className="business-option-name">{b.businessName}</div>
                    <div className="business-option-meta">
                      {b.ownerName}
                      {b.city && ` • ${b.city}`}
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>
        {/* </Card> */}

        {!selectedBusiness ? (
          <Alert
            message="Select a business to view available services"
            type="info"
            showIcon
          />
        ) : (
          <>
            {/* Search */}
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Search services"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="agent-book-services-search"
            />

            {/* Services */}
            <div className="agent-book-services-section">
              <Title level={4}>Available Services</Title>

              {loadingServices ? (
                <div className="agent-book-services-loading">
                  <Spin />
                </div>
              ) : filteredServices.length === 0 ? (
                <Empty description="No services found" />
              ) : (
                <div className="agent-book-services-grid">
                  {filteredServices.map((service) => (
                    <Card
                      key={service._id}
                      hoverable
                      className="agent-book-services-card"
                      onClick={() => handleServiceClick(service._id)}
                    >
                      <div className="agent-book-services-card-icon">
                        {getServiceIcon(service.category)}
                      </div>
                      <div className="agent-book-services-card-name">
                        {service.name}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentBookServices;
