import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Spin,
  message,
  Empty,
  Typography,
  Space,
  Tag,
} from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  StarFilled,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import myServiceServices from "../../../services/myServicesService";
import "./ServiceProviders.css";

const { Title, Text } = Typography;

/**
 * ServiceProviders
 * -----------------------------------------------------------------------------
 * Displays all service providers for a selected compliance service.
 *
 * - Fetches service details + providers
 * - Supports search by provider name
 * - Highlights top-rated providers
 * - Navigates to booking flow on selection
 */
const ServiceProviders = () => {
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { serviceId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  /**
   * Fetch service details and providers
   */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [serviceRes, providersRes] = await Promise.all([
        myServiceServices.getServiceById(serviceId),
        myServiceServices.getServiceProviders(serviceId, {
          sortBy: "rating",
          limit: 50,
        }),
      ]);

      setService(serviceRes.data);
      setProviders(providersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load service providers");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search filtering
   */
  const filteredProviders = providers.filter((provider) =>
    provider.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topRated = filteredProviders.filter(
    (provider) => provider.rating >= 4.5
  );
  const others = filteredProviders.filter((provider) => provider.rating < 4.5);

  if (loading) {
    return (
      <div className="service-providers-loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="service-providers-page">
      <div className="service-providers-container">
        {/* Header */}
        <div className="service-providers-header">
          <ArrowLeftOutlined
            className="service-providers-back"
            onClick={() => navigate(-1)}
          />
          <div>
            <Title level={3}>{service?.name}</Title>
            <Text type="secondary">Choose a verified service provider</Text>
          </div>
        </div>

        {/* Search */}
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search service providers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="service-providers-search"
        />

        {/* Top Rated Providers */}
        {topRated.length > 0 && (
          <div className="service-providers-section">
            <div className="service-providers-section-title highlight">
              <TrophyOutlined />
              <span>Top Rated</span>
            </div>

            <Space
              direction="vertical"
              size="middle"
              className="service-providers-list"
            >
              {topRated.map((provider) => (
                <Card
                  key={provider._id}
                  hoverable
                  className="service-providers-card top-rated"
                  onClick={() =>
                    navigate(
                      `/business-owner/services/book/${serviceId}/${provider._id}`
                    )
                  }
                >
                  <div className="service-providers-card-content">
                    <div className="service-providers-avatar">
                      {provider.companyName?.charAt(0).toUpperCase()}
                    </div>

                    <div className="service-providers-info">
                      <div className="service-providers-name">
                        {provider.companyName}
                      </div>

                      <Space size="small" className="service-providers-rating">
                        <StarFilled />
                        <span>{provider.rating?.toFixed(1) || "0.0"}</span>
                        <Tag color="gold">Top</Tag>
                      </Space>

                      <Text type="secondary" className="service-providers-meta">
                        {provider.totalCustomers}+ happy customers
                      </Text>
                    </div>

                    <div className="service-providers-price">
                      ₹{provider.priceForThisItem || 0}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        )}

        {/* Other Providers */}
        {others.length > 0 && (
          <div className="service-providers-section">
            <div className="service-providers-section-title">
              <span>Other Providers</span>
            </div>

            <Space
              direction="vertical"
              size="middle"
              className="service-providers-list"
            >
              {others.map((provider) => (
                <Card
                  key={provider._id}
                  hoverable
                  className="service-providers-card"
                  onClick={() =>
                    navigate(
                      `/business-owner/services/book/${serviceId}/${provider._id}`
                    )
                  }
                >
                  <div className="service-providers-card-content">
                    <div className="service-providers-avatar">
                      {provider.companyName?.charAt(0).toUpperCase()}
                    </div>

                    <div className="service-providers-info">
                      <div className="service-providers-name">
                        {provider.companyName}
                      </div>

                      <Space size="small" className="service-providers-rating">
                        <StarFilled />
                        <span>{provider.rating?.toFixed(1) || "0.0"}</span>
                      </Space>

                      <Text type="secondary" className="service-providers-meta">
                        {provider.totalCustomers}+ happy customers
                      </Text>
                    </div>

                    <div className="service-providers-price">
                      ₹{provider.priceForThisItem || 0}
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        )}

        {filteredProviders.length === 0 && (
          <Empty description="No service providers found" />
        )}
      </div>
    </div>
  );
};

export default ServiceProviders;
