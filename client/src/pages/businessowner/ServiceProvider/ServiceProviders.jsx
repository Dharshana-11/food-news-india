import { useState, useEffect } from "react";
import { Card, Input, Tag, Spin, message, Empty, Badge } from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  StarFilled,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import serviceService from "../../services/serviceService";
import "./ServiceProviders.css";

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [serviceRes, providersRes] = await Promise.all([
        serviceService.getServiceById(serviceId),
        serviceService.getServiceProviders(serviceId, {
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

  const filteredProviders = providers.filter((provider) =>
    provider.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate top rated and others
  const topRated = filteredProviders.filter((p) => p.rating >= 4.5);
  const others = filteredProviders.filter((p) => p.rating < 4.5);

  if (loading) {
    return (
      <div className="providers-loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="service-providers-page">
      <div className="providers-container">
        {/* Header */}
        <div className="providers-header">
          <ArrowLeftOutlined
            className="back-icon"
            onClick={() => navigate(-1)}
          />
          <h2>{service?.name}</h2>
        </div>

        {/* Search */}
        <Input
          placeholder="Search service providers here"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
          className="providers-search"
        />

        {/* Top Rated Section */}
        {topRated.length > 0 && (
          <>
            <div className="section-header">
              <TrophyOutlined className="trophy-icon" />
              <span>Top of the day</span>
            </div>

            <div className="providers-list">
              {topRated.map((provider) => (
                <Card
                  key={provider._id}
                  className="provider-card top-rated"
                  hoverable
                  onClick={() =>
                    navigate(
                      `/business-owner/services/book/${serviceId}/${provider._id}`
                    )
                  }
                >
                  <div className="provider-content">
                    <div className="provider-avatar">
                      {provider.companyName?.charAt(0).toUpperCase()}
                    </div>

                    <div className="provider-info">
                      <div className="provider-name">
                        {provider.companyName}
                      </div>

                      <div className="provider-rating">
                        <span className="rating-value">
                          {provider.rating?.toFixed(1) || "0.0"}
                        </span>
                        <StarFilled className="star-icon" />
                      </div>

                      <div className="provider-meta">
                        <span className="customers">
                          {provider.totalCustomers}+ Happy Customers
                        </span>
                      </div>

                      <div className="provider-price">
                        ₹{provider.priceForThisItem || 0}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Others Section */}
        {others.length > 0 && (
          <>
            <div className="section-header">
              <span>Others</span>
            </div>

            <div className="providers-list">
              {others.map((provider) => (
                <Card
                  key={provider._id}
                  className="provider-card"
                  hoverable
                  onClick={() =>
                    navigate(
                      `/business-owner/services/book/${serviceId}/${provider._id}`
                    )
                  }
                >
                  <div className="provider-content">
                    <div className="provider-avatar">
                      {provider.companyName?.charAt(0).toUpperCase()}
                    </div>

                    <div className="provider-info">
                      <div className="provider-name">
                        {provider.companyName}
                      </div>

                      <div className="provider-rating">
                        <span className="rating-value">
                          {provider.rating?.toFixed(1) || "0.0"}
                        </span>
                        <StarFilled className="star-icon" />
                      </div>

                      <div className="provider-meta">
                        <span className="customers">
                          {provider.totalCustomers}+ Happy Customers
                        </span>
                      </div>

                      <div className="provider-price">
                        ₹{provider.priceForThisItem || 0}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {filteredProviders.length === 0 && (
          <Empty description="No service providers found" />
        )}
      </div>
    </div>
  );
};

export default ServiceProviders;
