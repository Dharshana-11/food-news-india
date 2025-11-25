// src/pages/Documents/DocumentSummary.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import CustomTable from "../../components/CustomTable";
import { getAllDocuments } from "../../services/documentService";
import { ROUTES } from "../../routes";

/**
 * DocumentSummary component
 *
 * Displays a summarized table of the latest uploaded documents (limited to 5 items).
 * Allows navigating to the full document management page.
 */
const DocumentSummary = () => {
  const [items, setItems] = useState([]); // Holds the fetched documents
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Table columns configuration
  const columns = [
    {
      title: "File Name",
      key: "fileName",
      width: "30%",
      render: (_, record) => record.file?.originalName || "-", // fallback if missing
    },
    {
      title: "Type",
      key: "type",
      width: "25%",
      render: (_, record) => {
        if (record.kycDocumentId) return "KYC";
        if (record.complianceItemId) return "Compliance";
        return "-"; // fallback if both types are missing
      },
    },
    {
      title: "Uploaded By",
      key: "uploadedBy",
      width: "25%",
      render: (_, record) => record.uploadedByUser?.name || "-", // fallback if missing
    },
    {
      title: "Status",
      key: "status",
      width: "20%",
      render: (_, record) => {
        const colors = {
          pending: "gold",
          approved: "green",
          rejected: "red",
          expired: "volcano",
        };

        const status = record.status; // get actual status string
        const displayStatus =
          typeof status === "string" ? status.toUpperCase() : "UNKNOWN";

        return <Tag color={colors[status] || "gray"}>{displayStatus}</Tag>;
      },
    },
  ];

  /**
   * Fetch the latest documents (limited to 5) and update state.
   * Handles errors and provides safe fallback.
   */
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getAllDocuments(1, 5);
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="compliance-item-summary-section">
      {/* Header */}
      <div className="compliance-item-summary-header">
        <h3 className="compliance-item-summary-title">
          Uploaded Documents Summary
        </h3>
        <a
          onClick={() => navigate(ROUTES.SUPER_ADMIN_DOCUMENTS)}
          className="compliance-item-summary-link"
        >
          <RightOutlined />
        </a>
      </div>

      {/* Table */}
      <div className="custom-table-wrapper compliance-item-summary-table">
        <CustomTable columns={columns} data={items} loading={loading} />
      </div>
    </div>
  );
};

export default DocumentSummary;
