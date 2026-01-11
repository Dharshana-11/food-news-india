// src/pages/ComplianceAndDocumentManagement/ServiceApprovalSummary.jsx
import { useState, useEffect } from "react";
import { Tag, Space, Button, Tooltip, Modal, Input, message } from "antd";
import { RightOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../components/CustomTable";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../routes";
import {
  getPendingServices,
  approveService,
  rejectService,
} from "../../services/serviceApprovalService";

const { TextArea } = Input;

const ServiceApprovalSummary = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Rejection modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const LIMIT = 5;

  /** ===================== FETCH DATA ===================== */
  const fetchServices = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const data = await getPendingServices();
      setServices(data.slice(0, LIMIT));
    } catch (err) {
      console.error("Failed to fetch pending services:", err);
      message.error("Failed to load pending services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchServices();
  }, [currentUser]);

  /** ===================== HANDLERS ===================== */
  const handleApprove = async (serviceId) => {
    try {
      await approveService(serviceId);
      message.success("Service approved successfully");
      fetchServices();
    } catch (err) {
      console.error(err);
      message.error("Failed to approve service");
    }
  };

  const handleRejectClick = (service) => {
    setSelectedService(service);
    setRejectionNotes("");
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionNotes.trim()) {
      message.warning("Please provide a reason for rejection");
      return;
    }

    setRejecting(true);
    try {
      await rejectService(selectedService._id, rejectionNotes);
      message.success("Service rejected successfully");
      setRejectModalVisible(false);
      fetchServices();
    } catch (err) {
      console.error(err);
      message.error("Failed to reject service");
    } finally {
      setRejecting(false);
    }
  };

  /** ===================== TABLE COLUMNS ===================== */
  const columns = [
    {
      title: "Provider",
      dataIndex: ["serviceProviderId", "companyName"],
      key: "provider",
      width: "25%",
      render: (text) => text || "-",
    },
    {
      title: "Compliance Item",
      key: "complianceItem",
      width: "25%",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.complianceItemId?.name || "-"}
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.complianceItemId?.code || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: "15%",
      render: (price) => (price ? `₹${price.toLocaleString("en-IN")}` : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => (
        <Tag color="orange">
          {status === "pending_approval" ? "Pending" : status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Approve">
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record._id)}
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
              }}
            >
              Approve
            </Button>
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleRejectClick(record)}
            >
              Reject
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  /** ===================== RENDER ===================== */
  return (
    <div className="compliance-item-summary-section">
      <div className="compliance-item-summary-header">
        <h3 className="compliance-item-summary-title">Service Approvals</h3>

        <a
          role="button"
          onClick={() =>
            navigate(
              ROUTES.SUPER_ADMIN_SERVICE_APPROVALS || "/admin/service-approvals"
            )
          }
          className="compliance-item-summary-link"
        >
          <RightOutlined />
        </a>
      </div>

      <div className="custom-table-wrapper compliance-item-summary-table">
        <CustomTable columns={columns} data={services} loading={loading} />
      </div>

      {/* Rejection Modal */}
      <Modal
        title="Reject Service"
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={rejecting}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        {selectedService && (
          <div style={{ marginBottom: 16 }}>
            <p>
              <strong>Provider:</strong>{" "}
              {selectedService.serviceProviderId?.companyName}
            </p>
            <p>
              <strong>Service:</strong> {selectedService.complianceItemId?.name}
            </p>
          </div>
        )}
        <TextArea
          rows={4}
          placeholder="Enter reason for rejection..."
          value={rejectionNotes}
          onChange={(e) => setRejectionNotes(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ServiceApprovalSummary;
