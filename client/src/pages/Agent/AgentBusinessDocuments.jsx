/**
 * AgentBusinessDocuments.jsx
 * ============================================================================
 * Document vault for a specific business (reuses BO components)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Spin,
  message,
  Empty,
  Alert,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import agentDocumentService from "../../services/agentDocumentService";
import { ROUTES } from "../../routes";
import StatsCards from "../BusinessOwner/DocumentVault/StatsCards";
import DocumentCard from "../BusinessOwner/DocumentVault/DocumentCard";
import UploadDocumentModal from "./UploadDocumentModal";

import "./AgentBusinessDocuments.css";

const { Option } = Select;

const AgentBusinessDocuments = () => {
  const { relationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({});
  const [permissions, setPermissions] = useState({});
  const [business, setBusiness] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [relationId, categoryFilter, statusFilter, expiryFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const filters = {};
      if (categoryFilter !== "all") filters.category = categoryFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (expiryFilter !== "all") filters.expiry = expiryFilter;
      if (searchTerm) filters.search = searchTerm;

      const response = await agentDocumentService.getBusinessDocuments(
        relationId,
        filters
      );

      setDocuments(response.data.documents || []);
      setStats(response.data.stats || {});
      setPermissions(response.data.permissions || {});
      setBusiness(response.data.business || {});
    } catch (error) {
      console.error("Fetch documents error:", error);
      message.error(error.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDocuments();
  };

  const handleUploadSuccess = () => {
    setUploadModalVisible(false);
    fetchDocuments();
    message.success("Document uploaded successfully");
  };

  const handleView = (doc) => {
    const url = agentDocumentService.getDocumentUrl(doc?.file?.filePath);
    if (!url) return message.error("Unable to load the file");

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (doc) => {
    if (!doc?.file?.filePath) {
      message.error("File not available");
      return;
    }

    const link = document.createElement("a");
    link.href = doc.file.filePath;
    link.download = doc.file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (docId) => {
    Modal.confirm({
      title: "Delete document?",
      content: "This action will move the document to trash.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await agentDocumentService.deleteDocument(docId);
          message.success("Document deleted");
          fetchDocuments();
        } catch (err) {
          message.error(err.message || "Failed to delete document");
        }
      },
    });
  };

  const handleRename = async (docId, newName) => {
    try {
      await agentDocumentService.renameDocument(docId, {
        originalName: newName,
      });
      message.success("Document renamed");
      fetchDocuments();
    } catch (err) {
      message.error(err.message || "Failed to rename document");
    }
  };

  if (loading) {
    return (
      <div className="agent-business-doc-loading">
        <Spin size="large" tip="Loading documents..." />
      </div>
    );
  }

  return (
    <div className="agent-business-doc-container">
      {/* Header */}
      <div className="agent-business-doc-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTES.AGENT_DOCUMENT_VAULT)}
        />
        <div className="agent-business-doc-header-content">
          <h2>{business.name}'s Documents</h2>
          <p>Manage and review business documents</p>
        </div>
        {permissions.canUploadDocuments && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setUploadModalVisible(true)}
            className="agent-business-doc-upload-btn-desktop"
          >
            Upload Document
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <div className="agent-business-doc-filters">
        <Input
          placeholder="Search documents..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onPressEnter={handleSearch}
          className="agent-business-doc-search-input"
        />

        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          className="agent-business-doc-filter-select"
          suffixIcon={<FilterOutlined />}
        >
          <Option value="all">All Documents</Option>
          <Option value="kyc">KYC Documents</Option>
          <Option value="compliance">Compliance Documents</Option>
        </Select>

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          className="agent-business-doc-filter-select"
        >
          <Option value="all">All Status</Option>
          <Option value="pending">Pending</Option>
          <Option value="approved">Approved</Option>
          <Option value="rejected">Rejected</Option>
          <Option value="expired">Expired</Option>
        </Select>

        <Select
          value={expiryFilter}
          onChange={setExpiryFilter}
          className="agent-business-doc-filter-select"
        >
          <Option value="all">All Expiry</Option>
          <Option value="expiring_soon">Expiring Soon</Option>
          <Option value="expired">Expired</Option>
        </Select>
      </div>

      {/* Upload Button Mobile */}
      {permissions.canUploadDocuments && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setUploadModalVisible(true)}
          className="agent-business-doc-upload-btn-mobile"
          block
        >
          Upload Document
        </Button>
      )}

      {/* No Upload Permission Alert */}
      {!permissions.canUploadDocuments && (
        <Alert
          message="View Only Access"
          description="You don't have permission to upload documents for this business"
          type="info"
          showIcon
          className="agent-business-doc-permission-alert"
        />
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No documents found"
          className="agent-business-doc-empty-state"
        />
      ) : (
        <div className="agent-business-doc-documents-grid">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onView={() => handleView(doc)}
              onDownload={() => handleDownload(doc)}
              onDelete={() => handleDelete(doc._id)}
              onRename={handleRename}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalVisible && (
        <UploadDocumentModal
          visible={uploadModalVisible}
          onClose={() => setUploadModalVisible(false)}
          onSuccess={handleUploadSuccess}
          relationId={relationId}
        />
      )}
    </div>
  );
};

export default AgentBusinessDocuments;
