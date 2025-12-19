// pages/Documents/Documents.jsx
import { useState, useEffect } from "react";
import { Input, Button, Tabs, Modal, Empty, message, Badge } from "antd";
import {
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

import AppLayout from "../../layouts/AppLayout";
import ROLES from "../../constants/roles";
import DocumentForm from "./DocumentForm";
import DocumentReviewModal from "./DocumentReviewModal";
import {
  getAllDocuments,
  deleteDocument,
} from "../../services/documentService";
import StatCard from "../../components/dashboard/StatCard";
import KanbanColumn from "./KanbanColumn";
import DocumentCard from "./DocumentCard";

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

  return (
    // <AppLayout role={ROLES.SUPER_ADMIN}>
    <div className="documents-page-new">
      {/* Header */}
      <div className="docs-header">
        <div className="docs-header-content">
          <div className="docs-title-section">
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
          icon={
            <ClockCircleOutlined
              style={{ color: "var(--color-icon-orange)" }}
            />
          }
          bgColor="var(--color-bg-orange)"
        />
        <StatCard
          title="Approved"
          value={groupedDocuments.approved.length}
          icon={
            <CheckCircleOutlined style={{ color: "var(--color-icon-green)" }} />
          }
          bgColor="var(--color-bg-green)"
        />
        <StatCard
          title="Rejected"
          value={groupedDocuments.rejected.length}
          icon={
            <CloseCircleOutlined style={{ color: "var(--color-icon-red)" }} />
          }
          bgColor="var(--color-bg-red)"
        />
        <StatCard
          title="Expired"
          value={groupedDocuments.expired.length}
          icon={<StopOutlined style={{ color: "var(--color-icon-yellow)" }} />}
          bgColor="var(--color-bg-yellow)"
        />
      </div>

      {/* Controls */}
      <div className="docs-controls">
        <Search
          placeholder="Search documents..."
          allowClear
          size="large"
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
            <KanbanColumn
              key={status}
              status={status}
              config={config}
              documents={groupedDocuments[status]}
              onView={handleViewFile}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReview={handleReview}
            />
          ))}
        </div>
      ) : (
        <div className="list-view">
          {filteredDocuments.length === 0 ? (
            <Empty description="No documents found" />
          ) : (
            <div className="docs-list-grid">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  doc={doc}
                  onView={handleViewFile}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReview={handleReview}
                />
              ))}
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
    // </AppLayout>
  );
};

export default Documents;
