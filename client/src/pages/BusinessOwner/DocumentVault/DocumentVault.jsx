// pages/BusinessOwner/DocumentVault/index.jsx

/**
 * Document Vault page for Business Owner role.
 * Allows users to upload, view, filter, download and manage documents.
 * Includes KYC and compliance filtering, search, stats and more.
 */

import { useState, useEffect } from "react";
import { Input, Button, Empty, Spin, message, Modal, Select } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

import ROLES from "../../../constants/roles.js";
import KYCGuard from "../../../components/KYCGuard/KYCGuard.jsx";
import DocumentCard from "./DocumentCard.jsx";
import UploadDocumentModal from "./UploadDocumentModal.jsx";
import FilterDrawer from "./FilterDrawer.jsx";
import StatsCards from "./StatsCards.jsx";

import {
  getMyDocuments,
  getDocumentStats,
  deleteMyDocument,
  getDocumentViewUrl,
  getDocumentDownloadUrl,
  renameDocument,
} from "../../../services/documentVaultService.js";

import "./DocumentVault.css";

const { Search } = Input;

const DocumentVault = () => {
  // ===================== STATES =====================
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

  const [viewMode, setViewMode] = useState("all"); // all | kyc | compliance

  // ===================== FETCH DOCUMENTS =====================

  /**
   * Fetches all documents and statistics for the user.
   * Applies filters on backend request.
   */
  const fetchDocuments = async () => {
    setLoading(true);

    try {
      const [docsRes, statsRes] = await Promise.all([
        getMyDocuments(filters),
        getDocumentStats(),
      ]);

      const allDocs = docsRes?.data?.all || [];

      setDocuments(allDocs);
      setFilteredDocuments(allDocs);
      setStats(statsRes?.data || null);
    } catch (error) {
      console.error("Error fetching documents:", error);
      message.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  // ===================== SEARCH HANDLER =====================

  /**
   * Filters documents based on search text.
   */
  useEffect(() => {
    if (searchText.trim().length > 0) {
      const query = searchText.toLowerCase();
      const filtered = documents.filter((doc) =>
        doc?.file?.originalName?.toLowerCase().includes(query),
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchText, documents]);

  // ===================== VIEW MODE FILTER =====================

  /**
   * Returns documents based on active view mode.
   * @returns {Array}
   */
  const getDisplayDocuments = () => {
    if (viewMode === "kyc")
      return filteredDocuments.filter((d) => d.kycDocumentId);
    if (viewMode === "compliance")
      return filteredDocuments.filter((d) => d.complianceItemId);

    return filteredDocuments;
  };

  // ===================== ACTION HANDLERS =====================

  /**
   * Deletes a document after user confirmation.
   * @param {string} docId
   */
  const handleDelete = (docId) => {
    Modal.confirm({
      title: "Delete Document?",
      content: "Are you sure you want to delete this document?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await deleteMyDocument(docId);
          message.success("Document deleted successfully");
          fetchDocuments();
        } catch (error) {
          console.error("Delete error:", error);
          message.error("Failed to delete document");
        }
      },
    });
  };

  /**
   * Opens document in a new tab.
   * @param {object} doc
   */
  const handleView = (doc) => {
    window.open(getDocumentViewUrl(doc._id), "_blank", "noopener,noreferrer");
  };

  /**
   * Downloads a document with fallback method.
   * @param {object} doc
   */
  const handleDownload = (doc) => {
    window.open(getDocumentDownloadUrl(doc._id), "_blank");
  };

  /**
   * Rename a document
   * @param {string} docId
   * @param {string} newName
   */
  const handleRename = async (docId, newName) => {
    try {
      await renameDocument(docId, newName);
      message.success("Document renamed successfully");
      fetchDocuments();
    } catch (error) {
      console.error("Rename error:", error);
      message.error("Failed to rename document");
    }
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

  // ===================== RENDER =====================
  return (
    <KYCGuard userRole={ROLES.BUSINESS_OWNER}>
      <div className="document-vault-page">
        {/* Header */}
        <div className="vault-header">
          <div className="vault-header-content">
            <div className="docs-title-section">
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
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setIsUploadModalOpen(true)}
              className="document-vault-upload-btn"
            >
              Upload Document
            </Button>
          </div>
        </div>

        {/* Stats */}
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
              size="large"
              value={viewMode}
              onChange={setViewMode}
              className="view-mode-select"
            >
              <Select.Option value="all">All Documents</Select.Option>
              <Select.Option value="kyc">KYC Documents</Select.Option>
              <Select.Option value="compliance">
                Compliance Documents
              </Select.Option>
            </Select>

            <Button
              size="large"
              icon={<FilterOutlined />}
              className="filter-btn"
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              Filter
            </Button>
          </div>
        </div>

        {/* Documents Section */}
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
                  onRename={handleRename}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
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
  );
};

export default DocumentVault;
