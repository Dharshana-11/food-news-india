// src/pages/ComplianceAndDocumentManagement/ServiceApprovals.jsx
import { useState, useEffect } from "react";
import { Tag, Space, Button, Tooltip, Modal, Input, message } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import CustomTable from "../../components/CustomTable";
import { useAuth } from "../../context/AuthContext";
import {
  getPendingServices,
  approveService,
  rejectService,
} from "../../services/serviceApprovalService";

const { TextArea } = Input;

const ServiceApprovals = () => {
  const { currentUser } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Rejection modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [rejecting, setRejecting] = useState(false);

  /** ===================== FETCH DATA ===================== */
  const fetchServices = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const data = await getPendingServices();
      setServices(data);
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
    Modal.confirm({
      title: "Approve Service",
      content: "Are you sure you want to approve this service?",
      okText: "Approve",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await approveService(serviceId);
          message.success("Service approved successfully");
          fetchServices();
        } catch (err) {
          console.error(err);
          message.error("Failed to approve service");
        }
      },
    });
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

  const handleRefresh = () => {
    setSearchTerm("");
    fetchServices();
  };

  /** ===================== FILTERED DATA ===================== */
  const filteredServices = services.filter((service) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      service.serviceProviderId?.companyName?.toLowerCase().includes(search) ||
      service.complianceItemId?.name?.toLowerCase().includes(search) ||
      service.complianceItemId?.code?.toLowerCase().includes(search)
    );
  });

  /** ===================== TABLE COLUMNS ===================== */
  const columns = [
    {
      title: "Provider",
      dataIndex: ["serviceProviderId", "companyName"],
      key: "provider",
      width: "20%",
      render: (text) => text || "-",
    },
    {
      title: "Compliance Item",
      key: "complianceItem",
      width: "20%",
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
      width: "12%",
      render: (price) => (price ? `₹${price.toLocaleString("en-IN")}` : "-"),
    },
    {
      title: "Turnaround",
      dataIndex: "turnaroundDays",
      key: "turnaroundDays",
      width: "12%",
      render: (days) => (days ? `${days} days` : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => (
        <Tag color="orange">
          {status === "pending_approval" ? "Pending" : status}
        </Tag>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("en-IN") : "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: "12%",
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
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleRejectClick(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  /** ===================== RENDER ===================== */
  return (
    <div className="compliance-items-section">
      {/* Header */}
      <div className="compliance-items-header">
        <h3 className="compliance-items-title">Service Approvals</h3>
      </div>

      {/* Toolbar */}
      <div className="compliance-toolbar">
        <div className="compliance-items-search-wrapper">
          <Input
            placeholder="Search by provider or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
          <Button
            className="compliance-items-search-icon"
            icon={<SearchOutlined />}
          />
          <Button
            className="refresh-btn"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          />
        </div>

        <div style={{ marginLeft: "auto", fontSize: "14px", color: "#666" }}>
          <strong>{filteredServices.length}</strong> pending service
          {filteredServices.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="custom-table-wrapper compliance-items-table">
        <div className="custom-table-scroll">
          <CustomTable
            columns={columns}
            data={filteredServices}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        </div>
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
        width={600}
      >
        {selectedService && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Provider:</strong>{" "}
              {selectedService.serviceProviderId?.companyName}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Service:</strong> {selectedService.complianceItemId?.name}{" "}
              ({selectedService.complianceItemId?.code})
            </div>
            {selectedService.price && (
              <div style={{ marginBottom: 8 }}>
                <strong>Price:</strong> ₹
                {selectedService.price.toLocaleString("en-IN")}
              </div>
            )}
            {selectedService.turnaroundDays && (
              <div style={{ marginBottom: 8 }}>
                <strong>Turnaround:</strong> {selectedService.turnaroundDays}{" "}
                days
              </div>
            )}
          </div>
        )}
        <div>
          <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
            Reason for Rejection *
          </label>
          <TextArea
            rows={4}
            placeholder="Enter reason for rejection..."
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ServiceApprovals;
