/**
 * ServiceProviderMyServices.jsx
 * ============================================================================
 * Service Provider → My Services Page
 *
 * Shows all services added by the service provider with ability to:
 * - Add new service (modal)
 * - Edit existing service (modal)
 * - Activate/deactivate service
 * - View service details and documents
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Input,
  Empty,
  Spin,
  message,
  Tag,
  Modal,
  Row,
  Col,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  PoweroffOutlined,
  CheckOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import serviceProviderService from "../../services/serviceProviderService";
import AddEditServiceModal from "./AddEditServiceModal";
import "./ServiceProviderMyServices.css";

const { Search } = Input;

const ServiceProviderMyServices = () => {
  /* =========================================================================
     State
     ========================================================================= */
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [existingServiceIds, setExistingServiceIds] = useState([]);

  const navigate = useNavigate();

  /* =========================================================================
     Effects
     ========================================================================= */
  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchText, activeFilter]);

  /* =========================================================================
     API Calls
     ========================================================================= */
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceProviderService.getMyServices();
      const servicesData = response.data || [];
      setServices(servicesData);

      // Track which compliance items already have services
      setExistingServiceIds(servicesData.map((s) => s.complianceItem._id));
    } catch (error) {
      console.error("Fetch services error:", error);
      message.error(error.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    Modal.confirm({
      title: "Deactivate Service",
      content:
        "Are you sure you want to deactivate this service? Business owners will not be able to book it.",
      okText: "Deactivate",
      okType: "danger",
      onOk: async () => {
        try {
          await serviceProviderService.deactivateService(id);
          message.success("Service deactivated successfully");
          fetchServices();
        } catch (error) {
          console.error("Deactivate error:", error);
          message.error(
            error.response?.data?.message || "Failed to deactivate service"
          );
        }
      },
    });
  };

  const handleActivate = async (id) => {
    try {
      await serviceProviderService.activateService(id);
      message.success("Service activated successfully");
      fetchServices();
    } catch (error) {
      console.error("Activate error:", error);
      message.error(
        error.response?.data?.message || "Failed to activate service"
      );
    }
  };

  /* =========================================================================
     Modal Handlers
     ========================================================================= */
  const handleOpenAddModal = () => {
    setEditingService(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingService(null);
  };

  const handleModalSuccess = () => {
    fetchServices();
  };

  /* =========================================================================
     Helpers
     ========================================================================= */
  const filterServices = () => {
    let filtered = [...services];

    // Status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((s) => s.status === activeFilter);
    }

    // Search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((s) =>
        s.complianceItem.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredServices(filtered);
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color: "default",
        icon: <ExclamationCircleOutlined />,
        text: "Draft",
      },
      pending_approval: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Pending Approval",
      },
      approved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Active",
      },
      rejected: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Rejected",
      },
      inactive: {
        color: "default",
        icon: <StopOutlined />,
        text: "Inactive",
      },
    };
    return configs[status] || configs.pending_approval;
  };

  const getActionMenuItems = (service) => {
    const items = [
      {
        key: "view",
        label: "View Details",
        icon: <EyeOutlined />,
        onClick: () => navigate(`/service-provider/my-services/${service._id}`),
      },
    ];

    // Allow editing for draft, pending, or rejected services
    if (
      service.status === "draft" ||
      service.status === "pending_approval" ||
      service.status === "rejected"
    ) {
      items.push({
        key: "edit",
        label: service.status === "draft" ? "Complete Service" : "Edit Service",
        icon: <EditOutlined />,
        onClick: () => handleOpenEditModal(service),
      });
    }

    if (service.status === "approved") {
      items.push({
        key: "deactivate",
        label: "Deactivate",
        icon: <PoweroffOutlined />,
        danger: true,
        onClick: () => handleDeactivate(service._id),
      });
    }

    if (service.status === "inactive") {
      items.push({
        key: "activate",
        label: "Activate",
        icon: <CheckOutlined />,
        onClick: () => handleActivate(service._id),
      });
    }

    return items;
  };

  const getStats = () => {
    return {
      total: services.length,
      active: services.filter((s) => s.status === "approved").length,
      pending: services.filter((s) => s.status === "pending_approval").length,
      rejected: services.filter((s) => s.status === "rejected").length,
      draft: services.filter((s) => s.status === "draft").length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="sp-my-services-loading">
        <Spin size="large" />
      </div>
    );
  }

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <div className="sp-my-services-container">
      {/* Header */}
      <div className="sp-my-services-header">
        <div className="sp-my-services-header-content">
          <h2>My Services</h2>
          <p>Manage compliance services you offer to business owners</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleOpenAddModal}
        >
          Add Service
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="sp-my-services-stats">
        <Col xs={24} sm={12} md={6}>
          <Card className="sp-my-services-stat-card sp-my-services-stat-blue">
            <div className="sp-my-services-stat-content">
              <div className="sp-my-services-stat-icon-wrapper">
                <FileTextOutlined className="sp-my-services-stat-icon" />
              </div>
              <div className="sp-my-services-stat-text-group">
                <div className="sp-my-services-stat-label">Total Services</div>
                <div className="sp-my-services-stat-value">{stats.total}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="sp-my-services-stat-card sp-my-services-stat-green">
            <div className="sp-my-services-stat-content">
              <div className="sp-my-services-stat-icon-wrapper">
                <CheckCircleOutlined className="sp-my-services-stat-icon" />
              </div>
              <div className="sp-my-services-stat-text-group">
                <div className="sp-my-services-stat-label">Active</div>
                <div className="sp-my-services-stat-value">{stats.active}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="sp-my-services-stat-card sp-my-services-stat-orange">
            <div className="sp-my-services-stat-content">
              <div className="sp-my-services-stat-icon-wrapper">
                <ClockCircleOutlined className="sp-my-services-stat-icon" />
              </div>
              <div className="sp-my-services-stat-text-group">
                <div className="sp-my-services-stat-label">Pending</div>
                <div className="sp-my-services-stat-value">{stats.pending}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="sp-my-services-stat-card sp-my-services-stat-red">
            <div className="sp-my-services-stat-content">
              <div className="sp-my-services-stat-icon-wrapper">
                <CloseCircleOutlined className="sp-my-services-stat-icon" />
              </div>
              <div className="sp-my-services-stat-text-group">
                <div className="sp-my-services-stat-label">Action Needed</div>
                <div className="sp-my-services-stat-value">
                  {stats.rejected + stats.draft}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="sp-my-services-filters">
        <div className="sp-my-services-filters-row">
          <Search
            placeholder="Search services..."
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="sp-my-services-search"
          />

          <div className="sp-my-services-filter-buttons">
            <Button
              type={activeFilter === "all" ? "primary" : "default"}
              onClick={() => setActiveFilter("all")}
            >
              All ({services.length})
            </Button>
            <Button
              type={activeFilter === "approved" ? "primary" : "default"}
              onClick={() => setActiveFilter("approved")}
            >
              Active ({stats.active})
            </Button>
            <Button
              type={activeFilter === "pending_approval" ? "primary" : "default"}
              onClick={() => setActiveFilter("pending_approval")}
            >
              Pending ({stats.pending})
            </Button>
            <Button
              type={activeFilter === "rejected" ? "primary" : "default"}
              onClick={() => setActiveFilter("rejected")}
            >
              Rejected ({stats.rejected})
            </Button>
            <Button
              type={activeFilter === "draft" ? "primary" : "default"}
              onClick={() => setActiveFilter("draft")}
            >
              Draft ({stats.draft})
            </Button>
          </div>
        </div>
      </Card>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              services.length === 0
                ? "No services added yet"
                : "No services match your filters"
            }
          >
            {services.length === 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAddModal}
              >
                Add Your First Service
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <div className="sp-my-services-list">
          {filteredServices.map((service) => {
            const statusConfig = getStatusConfig(service.status);

            return (
              <Card
                key={service._id}
                className="sp-my-services-card"
                hoverable
                onClick={() =>
                  navigate(`/service-provider/my-services/${service._id}`)
                }
              >
                {/* Header */}
                <div className="sp-my-services-card-header">
                  <div className="sp-my-services-service-icon">
                    <FileTextOutlined />
                  </div>
                  <div className="sp-my-services-service-info">
                    <h3>{service.complianceItem.name}</h3>
                    <div className="sp-my-services-service-code">
                      {service.complianceItem.code}
                    </div>
                  </div>
                  <Dropdown
                    menu={{ items: getActionMenuItems(service) }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      className="sp-my-services-action-btn"
                    />
                  </Dropdown>
                </div>

                {/* Status & Pricing */}
                <div className="sp-my-services-card-content">
                  <div className="sp-my-services-status-row">
                    <Tag
                      color={statusConfig.color}
                      icon={statusConfig.icon}
                      className="sp-my-services-status-tag"
                    >
                      {statusConfig.text}
                    </Tag>
                  </div>

                  <div className="sp-my-services-pricing-grid">
                    <div className="sp-my-services-pricing-item">
                      <div className="sp-my-services-pricing-label">Price</div>
                      <div className="sp-my-services-pricing-value">
                        ₹{service.price?.toLocaleString() || "N/A"}
                      </div>
                    </div>
                    <div className="sp-my-services-pricing-item">
                      <div className="sp-my-services-pricing-label">
                        Turnaround
                      </div>
                      <div className="sp-my-services-pricing-value">
                        {service.turnaroundDays} days
                      </div>
                    </div>
                  </div>

                  {/* Document Stats */}
                  <div className="sp-my-services-doc-stats">
                    <div className="sp-my-services-doc-stat-item">
                      <FileTextOutlined />
                      <span>{service.documentStats.total} Documents</span>
                    </div>
                    {service.documentStats.approved > 0 && (
                      <div className="sp-my-services-doc-stat-item sp-my-services-doc-stat-green">
                        <CheckCircleOutlined />
                        <span>{service.documentStats.approved} Approved</span>
                      </div>
                    )}
                    {service.documentStats.pending > 0 && (
                      <div className="sp-my-services-doc-stat-item sp-my-services-doc-stat-orange">
                        <ClockCircleOutlined />
                        <span>{service.documentStats.pending} Pending</span>
                      </div>
                    )}
                    {service.documentStats.rejected > 0 && (
                      <div className="sp-my-services-doc-stat-item sp-my-services-doc-stat-red">
                        <CloseCircleOutlined />
                        <span>{service.documentStats.rejected} Rejected</span>
                      </div>
                    )}
                  </div>

                  {/* Draft Notice */}
                  {service.status === "draft" && (
                    <div className="sp-my-services-draft-notice">
                      <ExclamationCircleOutlined />
                      <span>Complete submission to activate this service</span>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {service.status === "rejected" && service.adminNotes && (
                    <div className="sp-my-services-rejection-reason">
                      <WarningOutlined />
                      <span>{service.adminNotes}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <AddEditServiceModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingService={editingService}
        existingServiceIds={existingServiceIds}
      />
    </div>
  );
};

export default ServiceProviderMyServices;
