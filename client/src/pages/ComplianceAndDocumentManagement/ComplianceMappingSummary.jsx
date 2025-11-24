// pages/ComplianceAndDocumentManagement/ComplianceMappingSummary.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import CustomTable from "../../components/CustomTable";
import { getAllComplianceMappings } from "../../services/complianceMappingService";
import { ROUTES } from "../../routes";

const ComplianceMappingSummary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: "Business Type",
      key: "businessType",
      width: "30%",
      render: (_, record) => record.businessTypeId?.name || "-",
    },
    {
      title: "Compliance Item",
      key: "complianceItem",
      width: "30%",
      render: (_, record) => record.complianceItemId?.name || "-",
    },
    {
      title: "Applicability",
      dataIndex: "applicability",
      key: "applicability",
      width: "25%",
      render: (val) => val?.replace(/_/g, " "),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (val) => (val === "active" ? "Active" : "Inactive"),
    },
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getAllComplianceMappings(1, 5);
      setItems(response.data.results);
    } catch (err) {
      console.error("Failed to fetch mappings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="compliance-item-summary-section">
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
      <div className="custom-table-wrapper compliance-item-summary-table">
        <CustomTable columns={columns} data={items} loading={loading} />
      </div>
    </div>
  );
};

export default ComplianceMappingSummary;