import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Tag,
  Spin,
  message,
  Empty,
  Typography,
  Space,
  Button,
  Divider,
  Select,
  Alert,
} from "antd";
import {
  SearchOutlined,
  ArrowRightOutlined,
  FileAddOutlined,
  ProfileOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import bookingService from "../../../services/bookingService";
import agentBusinessService from "../../../services/agentBusinessService";
import { ROUTES } from "../../../routes";
import "./AgentMyServices.css";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * AgentMyServices
 * -----------------------------------------------------------------------------
 * Agent version of My Services page.
 *
 * KEY DIFFERENCE from Business Owner:
 * - Requires business selection (businesses agent manages)
 * - Filters bookings by selected businessOwnerId
 * - Shows business context in UI
 *
 * REUSES: Business Owner booking card UI pattern
 */
const AgentMyServices = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchBookings();
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

      // Auto-select first business if available
      if (businessList.length > 0 && !selectedBusiness) {
        setSelectedBusiness(businessList[0].businessOwnerId);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      message.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch bookings for selected business
   */
  const fetchBookings = async () => {
    if (!selectedBusiness) return;

    try {
      setLoadingBookings(true);
      const response = await bookingService.getMyBookings({
        businessOwnerId: selectedBusiness,
        sortBy: "bookedAt",
        sortOrder: "desc",
      });
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to load services");
    } finally {
      setLoadingBookings(false);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      accepted: "blue",
      in_progress: "cyan",
      documents_submitted: "purple",
      completed: "green",
      cancelled: "red",
      rejected: "red",
    };
    return colors[status] || "default";
  };

  /**
   * Get status text
   */
  const getStatusText = (status) => {
    const texts = {
      pending: "Pending",
      accepted: "Accepted",
      in_progress: "In Progress",
      documents_submitted: "Docs Submitted",
      completed: "Completed",
      cancelled: "Cancelled",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  /**
   * Search filtering
   */
  const filteredBookings = bookings.filter((booking) => {
    const serviceName = booking.complianceItemId?.name?.toLowerCase() || "";
    const providerName = booking.providerId?.companyName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return serviceName.includes(search) || providerName.includes(search);
  });

  const ongoingServices = filteredBookings.filter((booking) =>
    ["pending", "accepted", "in_progress", "documents_submitted"].includes(
      booking.status
    )
  );

  const completedServices = filteredBookings.filter(
    (booking) => booking.status === "completed"
  );

  // Get selected business details
  const selectedBusinessDetails = businesses.find(
    (b) => b.businessOwnerId === selectedBusiness
  );

  if (loading) {
    return (
      <div className="agent-my-services-loader">
        <Spin size="large" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="agent-my-services-page">
        <div className="agent-my-services-container">
          <div className="agent-my-services-header">
            <h2>My Services</h2>
          </div>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No businesses assigned yet"
          >
            <Text type="secondary">
              You need to be assigned to a business to manage their services
            </Text>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-my-services-page">
      <div className="agent-my-services-container">
        {/* Header */}
        <div className="agent-my-services-header">
          <h2>My Services</h2>
          <Text type="secondary">
            Manage compliance services for your businesses
          </Text>
        </div>

        {/* Business Selector */}
        {/* <Card className="agent-my-services-business-selector"> */}
        <div className="agent-my-services-business-selector">
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Text strong>
              <ShopOutlined /> Select Business
            </Text>
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
          </Space>
        </div>

        {/* </Card> */}

        {!selectedBusiness ? (
          <Alert
            message="Select a business to view their services"
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
              placeholder="Search by service or provider"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="agent-my-services-search"
            />

            {/* Quick Actions */}
            <Card className="agent-my-services-quick-actions">
              <div className="agent-my-services-quick-actions-row">
                <Button
                  type="primary"
                  icon={<FileAddOutlined />}
                  onClick={() => navigate(ROUTES.AGENT_BOOK_SERVICES)}
                >
                  Book Services
                </Button>

                <Button
                  icon={<ProfileOutlined />}
                  onClick={() => navigate(ROUTES.AGENT_MY_BOOKINGS)}
                >
                  My Bookings
                </Button>
              </div>
            </Card>

            {loadingBookings ? (
              <div className="agent-my-services-loading">
                <Spin />
              </div>
            ) : (
              <>
                {/* Ongoing Services */}
                <div className="agent-my-services-section">
                  <Title level={4}>Ongoing Services</Title>

                  {ongoingServices.length === 0 ? (
                    <Empty description="No ongoing services" />
                  ) : (
                    <Space
                      direction="vertical"
                      size="middle"
                      className="agent-my-services-list"
                    >
                      {ongoingServices.map((booking) => (
                        <Card
                          key={booking._id}
                          hoverable
                          className="agent-my-services-card"
                          onClick={() =>
                            navigate(
                              ROUTES.AGENT_SERVICE_DETAILS.replace(
                                ":bookingId",
                                booking._id
                              )
                            )
                          }
                        >
                          <div className="agent-my-services-card-content">
                            <div className="agent-my-services-card-main">
                              <Space direction="vertical" size={4}>
                                <Space>
                                  <Text
                                    strong
                                    className="agent-my-services-name"
                                  >
                                    {booking.complianceItemId?.name}
                                  </Text>
                                  <Tag color={getStatusColor(booking.status)}>
                                    {getStatusText(booking.status)}
                                  </Tag>
                                </Space>

                                <Text type="secondary">
                                  by {booking.providerId?.companyName}
                                </Text>

                                <Space
                                  size="large"
                                  className="agent-my-services-meta"
                                >
                                  <Text type="secondary">
                                    Booked:{" "}
                                    {new Date(
                                      booking.bookedAt
                                    ).toLocaleDateString()}
                                  </Text>
                                  <Text
                                    strong
                                    className="agent-my-services-price"
                                  >
                                    ₹{booking.agreedPrice}
                                  </Text>
                                </Space>
                              </Space>
                            </div>

                            <ArrowRightOutlined className="agent-my-services-arrow" />
                          </div>
                        </Card>
                      ))}
                    </Space>
                  )}
                </div>

                <Divider />

                {/* Completed Services */}
                <div className="agent-my-services-section">
                  <Title level={4}>Completed Services</Title>

                  {completedServices.length === 0 ? (
                    <Empty description="No completed services" />
                  ) : (
                    <Space
                      direction="vertical"
                      size="middle"
                      className="agent-my-services-list"
                    >
                      {completedServices.map((booking) => (
                        <Card
                          key={booking._id}
                          hoverable
                          className="agent-my-services-card agent-my-services-card-completed"
                          onClick={() =>
                            navigate(
                              ROUTES.AGENT_SERVICE_DETAILS.replace(
                                ":bookingId",
                                booking._id
                              )
                            )
                          }
                        >
                          <div className="agent-my-services-card-content">
                            <div className="agent-my-services-card-main">
                              <Space direction="vertical" size={4}>
                                <Space>
                                  <Text
                                    strong
                                    className="agent-my-services-name"
                                  >
                                    {booking.complianceItemId?.name}
                                  </Text>
                                  <Tag color="green">Completed</Tag>
                                </Space>

                                <Text type="secondary">
                                  by {booking.providerId?.companyName}
                                </Text>

                                <Space
                                  size="large"
                                  className="agent-my-services-meta"
                                >
                                  <Text type="secondary">
                                    Completed:{" "}
                                    {new Date(
                                      booking.actualCompletionDate
                                    ).toLocaleDateString()}
                                  </Text>
                                  <Text
                                    strong
                                    className="agent-my-services-price"
                                  >
                                    ₹{booking.agreedPrice}
                                  </Text>
                                </Space>
                              </Space>
                            </div>

                            <ArrowRightOutlined className="agent-my-services-arrow" />
                          </div>
                        </Card>
                      ))}
                    </Space>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AgentMyServices;
