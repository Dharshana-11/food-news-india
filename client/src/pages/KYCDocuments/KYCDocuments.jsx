// pages/KYCDocuments/index.jsx
import { useState, useEffect } from "react";
import { Input, Button, Modal, message, Card, Tag, Empty, Avatar } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  IdcardOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import KYCDocumentForm from "./KYCDocumentForm";
import { getAllKYCDocuments, deleteKYCDocument } from "../../services/kycDocumentService";

const { Search } = Input;
const { confirm } = Modal;

const roleConfig = {
  business_owner: {
    label: "Business Owner",
    color: "#4F46E5",
    bg: "#EEF2FF",
    icon: <ShopOutlined />,
  },
  agent: {
    label: "Agent",
    color: "#059669",
    bg: "#ECFDF5",
    icon: <UserOutlined />,
  },
  service_provider: {
    label: "Service Provider",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: <TeamOutlined />,
  },
};

const KYCDocuments = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");

  // ===================== FETCH DATA =====================
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllKYCDocuments(1, 100);
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      message.error("Failed to load KYC documents");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===================== SEARCH =====================
  useEffect(() => {
    if (searchText) {
      const filtered = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.code.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  // ===================== HANDLERS =====================
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record) => {
    confirm({
      title: "Delete KYC Document?",
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteKYCDocument(record._id);
          message.success("KYC document deleted successfully");
          fetchData();
        } catch (error) {
          message.error("Failed to delete KYC document");
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    fetchData();
  };

  return (
    <SuperAdminLayout>
      <div className="kyc-documents-page">
        {/* Header */}
        <div className="kyc-header-section">
          <div className="kyc-header-content">
            <div className="kyc-header-left">
              {/* <div className="kyc-title-icon">
                <IdcardOutlined />
              </div> */}
              <div className="kyc-header-text">
                <h1 className="kyc-main-title">KYC Documents</h1>
                <p className="kyc-subtitle">
                  Manage identity verification documents for all user roles
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="kyc-add-button"
              size="large"
            >
              Add Document Type
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="kyc-info-section">
          <div className="kyc-info-cards">
            <Card className="kyc-info-card card-blue">
              <div className="info-card-content">
                <ShopOutlined className="info-card-icon" />
                <div className="info-card-text">
                  <h4>Business Owners</h4>
                  <p>
                    {
                      data.filter((doc) =>
                        doc.applicableRoles.flat().includes("business_owner")
                      ).length
                    }{" "}
                    documents
                  </p>
                </div>
              </div>
            </Card>
            <Card className="kyc-info-card card-green">
              <div className="info-card-content">
                <UserOutlined className="info-card-icon" />
                <div className="info-card-text">
                  <h4>Agents</h4>
                  <p>
                    {
                      data.filter((doc) =>
                        doc.applicableRoles.flat().includes("agent")
                      ).length
                    }{" "}
                    documents
                  </p>
                </div>
              </div>
            </Card>
            <Card className="kyc-info-card card-orange">
              <div className="info-card-content">
                <TeamOutlined className="info-card-icon" />
                <div className="info-card-text">
                  <h4>Service Providers</h4>
                  <p>
                    {
                      data.filter((doc) =>
                        doc.applicableRoles.flat().includes("service_provider")
                      ).length
                    }{" "}
                    documents
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Search */}
        <div className="kyc-search-section">
          <Search
            placeholder="Search documents by name or code..."
            allowClear
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
            className="kyc-search-bar"
          />
        </div>

        {/* Documents List */}
        <div className="kyc-documents-list">
          {loading ? (
            <div className="kyc-loading">
              <div className="kyc-spinner"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="kyc-empty">
              <Empty description="No KYC documents found" />
            </div>
          ) : (
            filteredData.map((doc) => {
              const flatRoles = doc.applicableRoles.flat();
              return (
                <Card key={doc._id} className="kyc-document-card" hoverable>
                  <div className="kyc-card-layout">
                    <div className="kyc-card-left">
                      <Avatar
                        size={64}
                        icon={<IdcardOutlined />}
                        className="kyc-card-avatar"
                      />
                      <div className="kyc-card-info">
                        <h3 className="kyc-card-title">{doc.name}</h3>
                        <div className="kyc-card-code">{doc.code}</div>
                        <p className="kyc-card-description">{doc.description}</p>
                      </div>
                    </div>

                    <div className="kyc-card-right">
                      <div className="kyc-card-roles">
                        <div className="roles-label">Applicable For:</div>
                        <div className="roles-tags">
                          {flatRoles.map((role, index) => {
                            const config = roleConfig[role];
                            return (
                              <Tag
                                key={index}
                                className="role-tag"
                                style={{
                                  color: config.color,
                                  borderColor: config.color,
                                  backgroundColor: config.bg,
                                }}
                                icon={config.icon}
                              >
                                {config.label}
                              </Tag>
                            );
                          })}
                        </div>
                      </div>

                      <div className="kyc-card-actions">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(doc)}
                          className="kyc-action-btn kyc-edit-btn"
                        >
                          Edit
                        </Button>
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(doc)}
                          className="kyc-action-btn kyc-delete-btn"
                          danger
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal */}
        <Modal
          title={
            <div className="kyc-modal-title">
              <IdcardOutlined style={{ marginRight: 8 }} />
              {editingRecord ? "Edit KYC Document" : "Add KYC Document"}
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
          footer={null}
          width={650}
          className="kyc-document-modal"
        >
          <KYCDocumentForm
            editingRecord={editingRecord}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingRecord(null);
            }}
          />
        </Modal>
      </div>
    </SuperAdminLayout>
  );
};

export default KYCDocuments;