import { useState, useEffect } from "react";
import { Card, Input, Spin, message, Empty } from "antd";
import { SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import serviceService from "../../services/serviceService";
import "./BookServices.css";

const BookServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getServices({
        sortBy: "totalBookings",
        sortOrder: "desc",
        limit: 50,
      });
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceIcon = (category) => {
    const icons = {
      license: "🏛️",
      certificate: "📜",
      hygiene: "🧼",
      training: "📚",
      compliance: "✅",
      testing: "🧪",
      audit: "🔍",
      other: "📋",
    };
    return icons[category] || "📋";
  };

  if (loading) {
    return (
      <div className="book-services-loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="book-services-page">
      <div className="book-services-container">
        {/* Header */}
        <div className="book-services-header">
          <ArrowLeftOutlined
            className="back-icon"
            onClick={() => navigate(-1)}
          />
          <h2>Book Services</h2>
        </div>

        {/* Search */}
        <Input
          placeholder="Search services & service providers here"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
          className="book-services-search"
        />

        {/* Available Services */}
        <div className="available-services-section">
          <h3>Available Services</h3>

          {filteredServices.length === 0 ? (
            <Empty description="No services found" />
          ) : (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <Card
                  key={service._id}
                  className="service-type-card"
                  hoverable
                  onClick={() =>
                    navigate(`/business-owner/services/book/${service._id}`)
                  }
                >
                  <div className="service-type-icon">
                    {getServiceIcon(service.category)}
                  </div>
                  <div className="service-type-name">{service.name}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookServices;
