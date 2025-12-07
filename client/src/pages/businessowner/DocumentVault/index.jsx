// pages/BusinessOwner/DocumentVault/index.jsx
import { useState, useEffect } from "react";
import { Input, Button, Empty, Spin, message, Modal, Select } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import AppLayout from "../../../layouts/AppLayout.jsx";
import ROLES from "../../../constants/roles.js";
import KYCGuard from "../../../components/KYCGuard/KYCGuard.jsx";
import DocumentCard from "./DocumentCard";
import UploadDocumentModal from "./UploadDocumentModal";
import FilterDrawer from "./FilterDrawer";
import StatsCards from "./StatsCards";
import {
  getMyDocuments,
  getDocumentStats,
  deleteMyDocument,
  getDocumentUrl,
} from "../../../services/documentVaultService";
import "./DocumentVault.css";

const { Search } = Input;

const DocumentVault = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: null,
    status: null,
    expiry: null,
  });
  const [viewMode, setViewMode] = useState("all"); // all, kyc, compliance

  // ===================== FETCH DATA =====================
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const [docsResponse, statsResponse] = await Promise.all([
        getMyDocuments(filters),
        getDocumentStats(),
      ]);

      setDocuments(docsResponse.data.all);
      setFilteredDocuments(docsResponse.data.all);
      setStats(statsResponse.data);
    } catch (error) {
      message.error("Failed to load documents");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  // ===================== SEARCH =====================
  useEffect(() => {
    if (searchText) {
      const filtered = documents.filter((doc) =>
        doc.file.originalName.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchText, documents]);

  // ===================== VIEW MODE FILTER =====================
  const getDisplayDocuments = () => {
    if (viewMode === "kyc") {
      return filteredDocuments.filter((doc) => doc.kycDocumentId);
    } else if (viewMode === "compliance") {
      return filteredDocuments.filter((doc) => doc.complianceItemId);
    }
    return filteredDocuments;
  };

  // ===================== HANDLERS =====================
  const handleDelete = (docId) => {
    Modal.confirm({
      title: "Delete Document?",
      content: "Are you sure you want to delete this document?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteMyDocument(docId);
          message.success("Document deleted successfully");
          fetchDocuments();
        } catch (error) {
          message.error("Failed to delete document");
        }
      },
    });
  };

  const handleView = (doc) => {
    const url = getDocumentUrl(doc.file.filePath);
    window.open(url, "_blank");
  };

  const handleDownload = (doc) => {
    const url = getDocumentUrl(doc.file.filePath);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    fetchDocuments();
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setIsFilterDrawerOpen(false);
  };

  const displayDocuments = getDisplayDocuments();

  return (
    <AppLayout role={ROLES.BUSINESS_OWNER}>
      <KYCGuard userRole={ROLES.BUSINESS_OWNER}>
        <div className="document-vault-page">
          {/* Header */}
          <div className="vault-header">
            <div className="header-content">
              <FolderOpenOutlined className="header-icon" />
              <div>
                <h1 className="vault-title">Document Vault</h1>
                <p className="vault-subtitle">
                  Securely store and manage all your business documents
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsUploadModalOpen(true)}
              className="upload-btn"
              size="large"
            >
              Upload Document
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && <StatsCards stats={stats} />}

          {/* Controls */}
          <div className="vault-controls">
            <Search
              placeholder="Search documents..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              className="vault-search"
            />

            <div className="control-buttons">
              <Select
                value={viewMode}
                onChange={setViewMode}
                className="view-mode-select"
                size="large"
              >
                <Select.Option value="all">All Documents</Select.Option>
                <Select.Option value="kyc">KYC Documents</Select.Option>
                <Select.Option value="compliance">
                  Compliance Documents
                </Select.Option>
              </Select>

              <Button
                icon={<FilterOutlined />}
                onClick={() => setIsFilterDrawerOpen(true)}
                size="large"
                className="filter-btn"
              >
                Filter
              </Button>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="documents-section">
            {loading ? (
              <div className="vault-loading">
                <Spin size="large" />
              </div>
            ) : displayDocuments.length === 0 ? (
              <div className="vault-empty">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    searchText
                      ? "No documents found"
                      : "No documents yet. Upload your first document!"
                  }
                >
                  {!searchText && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      Upload Document
                    </Button>
                  )}
                </Empty>
              </div>
            ) : (
              <div className="documents-grid">
                {displayDocuments.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onView={() => handleView(doc)}
                    onDownload={() => handleDownload(doc)}
                    onDelete={() => handleDelete(doc._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modals & Drawers */}
          <UploadDocumentModal
            visible={isUploadModalOpen}
            onCancel={() => setIsUploadModalOpen(false)}
            onSuccess={handleUploadSuccess}
          />

          <FilterDrawer
            visible={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            onApply={handleFilterApply}
            currentFilters={filters}
          />
        </div>
      </KYCGuard>
    </AppLayout>
  );
};

export default DocumentVault;
