// src/pages/ComplianceAndDocumentManagement/ComplianceMappingSummary.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import CustomTable from "../../components/CustomTable";
import { getAllComplianceMappings } from "../../services/complianceMappingService";
import { ROUTES } from "../../routes";

/**
 * ComplianceMappingSummary component
 *
 * Displays a summarized table of the latest compliance mappings (limited to 5 items).
 * Provides a link to navigate to the full Compliance Mappings page.
 */
const ComplianceMappingSummary = () => {
  const [items, setItems] = useState([]); // Holds the fetched compliance mappings
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  // Table columns configuration
  const columns = [
    {
      title: "Business Type",
      key: "businessType",
      width: "30%",
      render: (_, record) => record.businessTypeId?.name || "-", // fallback
    },
    {
      title: "Compliance Item",
      key: "complianceItem",
      width: "30%",
      render: (_, record) => record.complianceItemId?.name || "-", // fallback
    },
    {
      title: "Applicability",
      dataIndex: "applicability",
      key: "applicability",
      width: "25%",
      render: (val) => (val ? val.replace(/_/g, " ") : "-"), // fallback
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (val) => (val === "active" ? "Active" : "Inactive"), // default
    },
  ];

  /**
   * Fetch latest compliance mappings (limited to 5) and update state.
   * Handles errors and provides safe fallback.
   */
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getAllComplianceMappings(1, 5);
      const results = Array.isArray(response.data?.results)
        ? response.data.results
        : [];
      setItems(results);
    } catch (err) {
      console.error("Failed to fetch compliance mappings:", err);
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
          Compliance Mappings Summary
        </h3>
        <a
          onClick={() => navigate(ROUTES.SUPER_ADMIN_COMPLIANCE_MAPPINGS)}
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

export default ComplianceMappingSummary;
