// pages/KYCDocuments/index.jsx
import { useState, useEffect } from "react";
import { Input, Button, Modal, message, Empty } from "antd";
import {
  PlusOutlined,
  IdcardOutlined,
  ShopOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import AppLayout from "../../layouts/AppLayout";
import KYCDocumentForm from "./KYCDocumentForm";
import KYCDocumentCard from "./KYCDocumentCard";
import KYCDocumentInfoCard from "./KYCDocumentsInfoCards";
import ROLES from "../../constants/roles";

import {
  getAllKYCDocuments,
  deleteKYCDocument,
} from "../../services/kycDocumentService";

const { Search } = Input;
const { confirm } = Modal;

/** Configuration for role badges */
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

/**
 * Page component for managing KYC documents
 * @component
 */
const KYCDocuments = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");

  // ===================== FETCH DATA =====================
  /** Fetch all KYC documents from the server */
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

  // ===================== SEARCH FILTER =====================
  useEffect(() => {
    if (searchText) {
      const filtered = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.code.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchText, data]);

  // ===================== HANDLERS =====================
  /** Open modal to add a new KYC document */
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  /** Open modal to edit an existing KYC document */
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  /** Confirm and delete a KYC document */
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

  /** Called when the form submission succeeds */
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    fetchData();
  };

  // ===================== INFO CARD DATA =====================
  const infoCardsData = [
    {
      title: "Business Owners",
      count: data.filter((doc) =>
        doc.applicableRoles.flat().includes("business_owner"),
      ).length,
      icon: <ShopOutlined className="info-card-icon" />,
      className: "card-blue",
    },
    {
      title: "Agents",
      count: data.filter((doc) => doc.applicableRoles.flat().includes("agent"))
        .length,
      icon: <UserOutlined className="info-card-icon" />,
      className: "card-green",
    },
    {
      title: "Service Providers",
      count: data.filter((doc) =>
        doc.applicableRoles.flat().includes("service_provider"),
      ).length,
      icon: <TeamOutlined className="info-card-icon" />,
      className: "card-orange",
    },
  ];

  // ===================== RENDER =====================
  return (
    <AppLayout role={ROLES.SUPER_ADMIN}>
      <div className="kyc-documents-page">
        {/* Header */}
        <div className="kyc-header-section">
          <div className="kyc-header-content">
            <div className="kyc-header-left">
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
            {infoCardsData.map((card, index) => (
              <KYCDocumentInfoCard key={index} {...card} />
            ))}
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
            filteredData.map((doc) => (
              <KYCDocumentCard
                key={doc._id}
                doc={doc}
                onEdit={handleEdit}
                onDelete={handleDelete}
                roleConfig={roleConfig}
              />
            ))
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
    </AppLayout>
  );
};

export default KYCDocuments;
