/**
 * ServiceProviderServiceDetails.jsx
 * ============================================================================
 * Detailed view of a single service with authorization documents
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  message,
  Tag,
  Descriptions,
  Alert,
  Table,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PoweroffOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import serviceProviderService from "../../services/serviceProviderService";
import serviceProviderDocumentService from "../../services/serviceProviderDocumentService";
import AddEditServiceModal from "./AddEditServiceModal";
import "./ServiceProviderServiceDetails.css";

const ServiceProviderServiceDetails = () => {
  /* =========================================================================
     State
     ========================================================================= */
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  /* =========================================================================
     Effects
     ========================================================================= */
  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  /* =========================================================================
     API Calls
     ========================================================================= */
  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await serviceProviderService.getServiceById(id);
      setService(response.data.service);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Fetch service details error:", error);
      message.error(
        error.response?.data?.message || "Failed to load service details",
      );
      navigate("/service-provider/my-services");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    Modal.confirm({
      title: "Deactivate Service",
      content: "Are you sure you want to deactivate this service?",
      okText: "Deactivate",
      okType: "danger",
      onOk: async () => {
        try {
          await serviceProviderService.deactivateService(id);
          message.success("Service deactivated");
          fetchServiceDetails();
        } catch (error) {
          message.error(
            error.response?.data?.message || "Failed to deactivate",
          );
        }
      },
    });
  };

  const handleActivate = async () => {
    try {
      await serviceProviderService.activateService(id);
      message.success("Service activated");
      fetchServiceDetails();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to activate");
    }
  };

  const handleEditModalSuccess = () => {
    fetchServiceDetails();
  };

  /* =========================================================================
     Helpers
     ========================================================================= */
  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color: "default",
        icon: <ClockCircleOutlined />,
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
        icon: <PoweroffOutlined />,
        text: "Inactive",
      },
    };
    return configs[status] || configs.pending_approval;
  };

  const documentColumns = [
    {
      title: "File Name",
      dataIndex: ["file", "originalName"],
      key: "fileName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const configs = {
          pending: { color: "orange", icon: <ClockCircleOutlined /> },
          approved: { color: "green", icon: <CheckCircleOutlined /> },
          rejected: { color: "red", icon: <CloseCircleOutlined /> },
        };
        const config = configs[status] || configs.pending;
        return (
          <Tag color={config.color} icon={config.icon}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Uploaded",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() =>
            window.open(
              serviceProviderDocumentService.getDocumentViewUrl(record?._id),
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="sp-service-details-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!service) return null;

  const statusConfig = getStatusConfig(service.status);

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <div className="sp-service-details-container">
      {/* Header */}
      <div className="sp-service-details-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/service-provider/my-services")}
        >
          Back to Services
        </Button>
        <div className="sp-service-details-actions">
          {service.status === "approved" && (
            <Button
              danger
              icon={<PoweroffOutlined />}
              onClick={handleDeactivate}
            >
              Deactivate
            </Button>
          )}
          {service.status === "inactive" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleActivate}
            >
              Activate
            </Button>
          )}
          {(service.status === "draft" ||
            service.status === "pending_approval" ||
            service.status === "rejected") && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditModalVisible(true)}
            >
              {service.status === "draft" ? "Complete Service" : "Edit Service"}
            </Button>
          )}
        </div>
      </div>

      {/* Service Info Card */}
      <Card className="sp-service-details-info-card">
        <div className="sp-service-details-title-row">
          <div>
            <h2>{service.complianceItemId.name}</h2>
            <div className="sp-service-details-code">
              {service.complianceItemId.code}
            </div>
          </div>
          <Tag
            color={statusConfig.color}
            icon={statusConfig.icon}
            className="sp-service-details-status-tag"
          >
            {statusConfig.text}
          </Tag>
        </div>

        <Descriptions
          column={{ xs: 1, sm: 2, md: 3 }}
          className="sp-service-details-descriptions"
        >
          <Descriptions.Item label="Price">
            ₹{service.price?.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Turnaround">
            {service.turnaroundDays} days
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(service.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          {service.reviewedAt && (
            <Descriptions.Item label="Reviewed">
              {new Date(service.reviewedAt).toLocaleDateString()}
            </Descriptions.Item>
          )}
        </Descriptions>

        {service.status === "draft" && (
          <Alert
            type="warning"
            message="Service is incomplete"
            description="This service was not fully submitted. Click 'Complete Service' to finish submission."
            showIcon
            className="sp-service-details-alert"
          />
        )}

        {service.status === "rejected" && service.adminNotes && (
          <Alert
            type="error"
            message="Service Rejected. Edit to re-submit"
            description={service.adminNotes}
            showIcon
            className="sp-service-details-alert"
          />
        )}
      </Card>

      {/* Authorization Documents */}
      <Card
        title={
          <span>
            <FileTextOutlined /> Authorization Documents
          </span>
        }
      >
        {service.complianceItemId.serviceProviderRequirements?.length > 0 && (
          <Alert
            type="info"
            message={`${service.complianceItemId.serviceProviderRequirements.length} documents required for this service`}
            className="sp-service-details-req-alert"
          />
        )}

        <Table
          columns={documentColumns}
          dataSource={documents}
          rowKey="_id"
          pagination={false}
          locale={{
            emptyText:
              service.status === "draft"
                ? "No documents uploaded yet. Click 'Complete Service' to upload."
                : "No documents uploaded",
          }}
        />
      </Card>

      {/* Edit Service Modal */}
      <AddEditServiceModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditModalSuccess}
        editingService={service}
        existingServiceIds={[]}
      />
    </div>
  );
};

export default ServiceProviderServiceDetails;
