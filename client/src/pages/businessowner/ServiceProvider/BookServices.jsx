import { useState, useEffect } from "react";
import { Card, Input, Spin, message, Empty, Typography } from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  ExperimentOutlined,
  BookOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import myServicesService from "../../../services/myServicesService";
import "./BookServices.css";

const { Title, Text } = Typography;

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
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="book-services-back"
            onClick={() => navigate(-1)}
          />
          <div>
            <Title level={3}>Book Services</Title>
            <Text type="secondary">
              Choose a compliance service to continue
            </Text>
          </div>
        </div>

        {/* Search */}
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search services"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="book-services-search"
        />

        {/* Services */}
        <div className="book-services-section">
          <Title level={4}>Available Services</Title>

          {filteredServices.length === 0 ? (
            <Empty description="No services found" />
          ) : (
            <div className="book-services-grid">
              {filteredServices.map((service) => (
                <Card
                  key={service._id}
                  hoverable
                  className="book-services-card"
                  onClick={() =>
                    navigate(`/business-owner/services/book/${service._id}`)
                  }
                >
                  <div className="book-services-card-icon">
                    {getServiceIcon(service.category)}
                  </div>
                  <div className="book-services-card-name">{service.name}</div>
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
