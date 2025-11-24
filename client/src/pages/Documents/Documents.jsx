// pages/Documents/index.jsx
import { useState, useEffect } from "react";
import { Input, Button, Modal, message, Card, Tag, Empty, Tabs, Badge } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import DocumentForm from "./DocumentForm";
import DocumentReviewModal from "./DocumentReviewModal";
import { getAllDocuments, deleteDocument } from "../../services/documentService";
import { formatDate } from "../../utils/dateFormatter";
import StatCard from "../../components/dashboard/StatCard";

const { Search } = Input;
const { confirm } = Modal;

const statusConfig = {
  pending: {
    label: "Pending Review",
    icon: <ClockCircleOutlined />,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircleOutlined />,
    color: "#10b981",
    bgColor: "#d1fae5",
  },
  rejected: {
    label: "Rejected",
    icon: <CloseCircleOutlined />,
    color: "#ef4444",
    bgColor: "#fee2e2",
  },
  expired: {
    label: "Expired",
    icon: <StopOutlined />,
    color: "#6b7280",
    bgColor: "#f3f4f6",
  },
};

const Documents = () => {
  const [allDocuments, setAllDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [reviewingRecord, setReviewingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("kanban");

  // ===================== FETCH DATA =====================
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllDocuments(1, 100);
      setAllDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch (error) {
      message.error("Failed to load documents");
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
      const filtered = allDocuments.filter((doc) =>
        doc.file?.originalName.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(allDocuments);
    }
  }, [searchText, allDocuments]);

  // ===================== HANDLERS =====================
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleReview = (record) => {
    setReviewingRecord(record);
    setIsReviewModalOpen(true);
  };

  const handleDelete = (record) => {
    confirm({
      title: "Delete Document?",
      content: `Are you sure you want to delete "${record.file?.originalName}"?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteDocument(record._id);
          message.success("Document deleted successfully");
          fetchData();
        } catch (error) {
          message.error("Failed to delete document");
        }
      },
    });
  };

  const handleViewFile = (record) => {
    if (record.file?.filePath) {
      const fileUrl = `http://localhost:5000${record.file.filePath}`;
      window.open(fileUrl, "_blank");
    } else {
      message.warning("File not available");
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    fetchData();
  };

  const handleReviewSuccess = () => {
    setIsReviewModalOpen(false);
    setReviewingRecord(null);
    fetchData();
  };

  // ===================== GROUP BY STATUS =====================
  const groupedDocuments = {
    pending: filteredDocuments.filter((doc) => doc.status === "pending"),
    approved: filteredDocuments.filter((doc) => doc.status === "approved"),
    rejected: filteredDocuments.filter((doc) => doc.status === "rejected"),
    expired: filteredDocuments.filter((doc) => doc.status === "expired"),
  };

  // ===================== RENDER DOCUMENT CARD =====================
  const renderDocumentCard = (doc) => (
    <Card key={doc._id} className="doc-card" hoverable>
      <div className="doc-card-header">
        <div className="doc-icon-wrapper">
          <FileOutlined />
        </div>
        <div className="doc-type-badge">
          {doc.kycDocumentId ? (
            <Tag color="blue">KYC</Tag>
          ) : (
            <Tag color="purple">Compliance</Tag>
          )}
        </div>
      </div>

      <div className="doc-card-body">
        <h4 className="doc-filename" title={doc.file?.originalName}>
          {doc.file?.originalName}
        </h4>
        <div className="doc-meta">
          <span className="doc-type">
            {doc.file?.fileType?.toUpperCase()}
          </span>
          <span className="doc-size">
            {(doc.file?.fileSize / 1024).toFixed(1)} KB
          </span>
        </div>
        {doc.uploadedByUser && (
          <p className="doc-uploader">
            By: <strong>{doc.uploadedByUser.name}</strong>
          </p>
        )}
        {doc.validUntil && (
          <p className="doc-validity">
            Valid until: {formatDate(doc.validUntil)}
          </p>
        )}
      </div>

      <div className="doc-card-actions">
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewFile(doc)}
          className="doc-action-btn"
        >
          View
        </Button>
        {doc.status === "pending" && (
          <Button
            type="text"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleReview(doc)}
            className="doc-action-btn review-action"
          >
            Review
          </Button>
        )}
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(doc)}
          className="doc-action-btn"
        >
          Edit
        </Button>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(doc)}
          className="doc-action-btn delete-action"
          danger
        >
          Delete
        </Button>
      </div>
    </Card>
  );

  return (
    <SuperAdminLayout>
      <div className="documents-page-new">
        {/* Header */}
        <div className="docs-header">
          <div className="docs-header-content">
            <div className="docs-title-section">
              {/* <FileOutlined className="docs-title-icon" /> */}
              <div>
                <h1 className="docs-title">Document Management</h1>
                <p className="docs-subtitle">
                  Upload, review, and manage compliance documents
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
              className="docs-add-btn"
            >
              Upload Document
            </Button>
          </div>
        </div>
        
        {/* STAT CARDS */}
       <div className="stats-cards">
 <StatCard
  title="Pending"
  value={groupedDocuments.pending.length}
  icon={<ClockCircleOutlined style={{ color: 'var(--color-icon-orange)' }} />}
  bgColor="var(--color-bg-orange)"
/>

<StatCard
  title="Approved"
  value={groupedDocuments.approved.length}
  icon={<CheckCircleOutlined style={{ color: 'var(--color-icon-green)' }} />}
  bgColor="var(--color-bg-green)"
/>

<StatCard
  title="Rejected"
  value={groupedDocuments.rejected.length}
  icon={<CloseCircleOutlined style={{ color: 'var(--color-icon-red)' }} />}
  bgColor="var(--color-bg-red)"
/>

<StatCard
  title="Expired"
  value={groupedDocuments.expired.length}
  icon={<StopOutlined style={{ color: 'var(--color-icon-yellow)' }} />}
  bgColor="var(--color-bg-yellow)"
/>

</div>





        {/* Controls */}
        <div className="docs-controls">
          <Search
            placeholder="Search documents..."
            allowClear
            size="large"
            // prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            className="docs-search"
          />
          <Tabs
            activeKey={viewMode}
            onChange={setViewMode}
            items={[
              {
                key: "kanban",
                label: (
                  <span>
                    <AppstoreOutlined /> Kanban View
                  </span>
                ),
              },
              {
                key: "list",
                label: (
                  <span>
                    <UnorderedListOutlined /> List View
                  </span>
                ),
              },
            ]}
            className="view-toggle"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="docs-loading">
            <div className="docs-spinner"></div>
          </div>
        ) : viewMode === "kanban" ? (
          <div className="kanban-board">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="kanban-column">
                <div
                  className="kanban-header"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <div className="kanban-title">
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                  <Badge
                    count={groupedDocuments[status].length}
                    style={{ backgroundColor: config.color }}
                  />
                </div>
                <div className="kanban-body">
                  {groupedDocuments[status].length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No documents"
                      className="kanban-empty"
                    />
                  ) : (
                    groupedDocuments[status].map(renderDocumentCard)
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="list-view">
            {filteredDocuments.length === 0 ? (
              <Empty description="No documents found" />
            ) : (
              <div className="docs-list-grid">
                {filteredDocuments.map(renderDocumentCard)}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <Modal
          title="Upload Document"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
          footer={null}
          width={700}
        >
          <DocumentForm
            editingRecord={editingRecord}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingRecord(null);
            }}
          />
        </Modal>

        <DocumentReviewModal
          visible={isReviewModalOpen}
          document={reviewingRecord}
          onSuccess={handleReviewSuccess}
          onCancel={() => {
            setIsReviewModalOpen(false);
            setReviewingRecord(null);
          }}
        />
      </div>
    </SuperAdminLayout>
  );
};

export default Documents;