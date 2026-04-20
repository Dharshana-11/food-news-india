import { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Tag,
  Spin,
  message,
  Empty,
  Space,
  Typography,
  Select,
  Alert,
} from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  StarFilled,
  ShopOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import bookingService from "../../../services/bookingService";
import agentBusinessService from "../../../services/agentBusinessService";
import { ROUTES } from "../../../routes";
import "./AgentMyBookings.css";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * AgentMyBookings
 * -----------------------------------------------------------------------------
 * Agent version of My Bookings page.
 *
 * KEY DIFFERENCE from Business Owner:
 * - Business selector at top
 * - Shows stats per selected business
 * - Filters bookings by businessOwnerId
 */
const AgentMyBookings = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const incomingBusinessIdRef = useRef(location.state?.businessOwnerId ?? null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchData();
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

      if (businessList.length > 0) {
        const toSelect =
          incomingBusinessIdRef.current ?? // highest priority: passed from workspace
          selectedBusiness ?? // keep existing if already set
          businessList[0].businessOwnerId; // fallback: first business
        setSelectedBusiness(toSelect);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      message.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch bookings and stats for selected business
   */
  const fetchData = async () => {
    if (!selectedBusiness) return;

    try {
      setLoadingData(true);

      const [bookingsRes, statsRes] = await Promise.all([
        bookingService.getMyBookings({
          businessOwnerId: selectedBusiness,
          sortBy: "bookedAt",
          sortOrder: "desc",
        }),
        bookingService.getBookingStats({
          businessOwnerId: selectedBusiness,
        }),
      ]);

      setBookings(bookingsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load bookings");
    } finally {
      setLoadingData(false);
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

  const ongoingBookings = filteredBookings.filter((booking) =>
    ["pending", "accepted", "in_progress", "documents_submitted"].includes(
      booking.status,
    ),
  );

  const completedBookings = filteredBookings.filter(
    (booking) => booking.status === "completed",
  );

  if (loading) {
    return (
      <div className="agent-my-bookings-loader">
        <Spin size="large" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="agent-my-bookings-page">
        <div className="agent-my-bookings-container">
          <div className="agent-my-bookings-header">
            <ArrowLeftOutlined
              className="agent-my-bookings-back"
              onClick={() => navigate(ROUTES.AGENT_MY_SERVICES)}
            />
            <h2>My Bookings</h2>
          </div>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No businesses assigned yet"
          >
            <Text type="secondary">
              You need to be assigned to a business to view bookings
            </Text>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-my-bookings-page">
      <div className="agent-my-bookings-container">
        {/* Header */}
        <div className="agent-my-bookings-header">
          <ArrowLeftOutlined
            className="agent-my-bookings-back"
            onClick={() => navigate(ROUTES.AGENT_MY_SERVICES)}
          />
          <h2>My Bookings</h2>
        </div>

        {/* Business Selector */}
        {/* <Card className="agent-my-bookings-business-selector"> */}
        <div className="agent-my-bookings-business-selector">
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
            message="Select a business to view their bookings"
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
              className="agent-my-bookings-search"
            />

            {loadingData ? (
              <div className="agent-my-bookings-loading">
                <Spin />
              </div>
            ) : (
              <>
                {/* Stats */}
                {stats && (
                  <div className="agent-my-bookings-stats">
                    <div className="agent-my-bookings-stat completed">
                      <CheckCircleOutlined />
                      <div>
                        <div className="value">{stats.completed || 0}</div>
                        <div className="label">Completed</div>
                      </div>
                    </div>

                    <div className="agent-my-bookings-stat in-progress">
                      <SyncOutlined spin />
                      <div>
                        <div className="value">{stats.in_progress || 0}</div>
                        <div className="label">In Progress</div>
                      </div>
                    </div>

                    <div className="agent-my-bookings-stat pending">
                      <ClockCircleOutlined />
                      <div>
                        <div className="value">{stats.pending || 0}</div>
                        <div className="label">Pending</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ongoing Bookings */}
                <div className="agent-my-bookings-section">
                  <Title level={5}>Ongoing Services</Title>

                  {ongoingBookings.length === 0 ? (
                    <Empty description="No ongoing services" />
                  ) : (
                    <Space
                      direction="vertical"
                      size="middle"
                      className="agent-my-bookings-list"
                    >
                      {ongoingBookings.map((booking) => (
                        <Card
                          key={booking._id}
                          hoverable
                          className="agent-my-bookings-card"
                          onClick={() =>
                            navigate(
                              ROUTES.AGENT_SERVICE_DETAILS.replace(
                                ":bookingId",
                                booking._id,
                              ),
                            )
                          }
                        >
                          <div className="agent-my-bookings-card-content">
                            <div className="agent-my-bookings-main">
                              <div className="agent-my-bookings-title">
                                <Text strong>
                                  {booking.complianceItemId?.name}
                                </Text>
                                <Tag color={getStatusColor(booking.status)}>
                                  {getStatusText(booking.status)}
                                </Tag>
                              </div>

                              <Text type="secondary">
                                by {booking.providerId?.companyName}
                              </Text>

                              <div className="agent-my-bookings-meta">
                                <span>
                                  <StarFilled />{" "}
                                  {booking.providerId?.rating?.toFixed(1)}
                                </span>
                                <span>
                                  Booked:{" "}
                                  {new Date(
                                    booking.bookedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="agent-my-bookings-price">
                              ₹{booking.agreedPrice}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  )}
                </div>

                {/* Completed Bookings */}
                <div className="agent-my-bookings-section">
                  <Title level={5}>Completed Services</Title>

                  {completedBookings.length === 0 ? (
                    <Empty description="No completed services" />
                  ) : (
                    <Space
                      direction="vertical"
                      size="middle"
                      className="agent-my-bookings-list"
                    >
                      {completedBookings.map((booking) => (
                        <Card
                          key={booking._id}
                          hoverable
                          className="agent-my-bookings-card completed"
                          onClick={() =>
                            navigate(
                              ROUTES.AGENT_SERVICE_DETAILS.replace(
                                ":bookingId",
                                booking._id,
                              ),
                            )
                          }
                        >
                          <div className="agent-my-bookings-card-content">
                            <div className="agent-my-bookings-main">
                              <div className="agent-my-bookings-title">
                                <Text strong>
                                  {booking.complianceItemId?.name}
                                </Text>
                                <Tag color="green">Completed</Tag>
                              </div>

                              <Text type="secondary">
                                by {booking.providerId?.companyName}
                              </Text>

                              <div className="agent-my-bookings-meta">
                                <span>
                                  <StarFilled />{" "}
                                  {booking.providerId?.rating?.toFixed(1)}
                                </span>
                                <span>
                                  Completed:{" "}
                                  {new Date(
                                    booking.actualCompletionDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="agent-my-bookings-price">
                              ₹{booking.agreedPrice}
                            </div>
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

export default AgentMyBookings;
