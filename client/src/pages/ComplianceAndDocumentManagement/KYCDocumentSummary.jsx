import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import CustomTable from "../../components/CustomTable";
import { getAllKYCDocuments } from "../../services/kycDocumentService";
import { ROUTES } from "../../routes";

/**
 * Displays a summary table of KYC Documents with a link to the full list.
 */
const KYCDocumentSummary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /** Table columns configuration */
  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: "25%" },
    { title: "Code", dataIndex: "code", key: "code", width: "15%" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text) => text || "-",
    },
    {
      title: "Roles",
      dataIndex: "applicableRoles",
      key: "roles",
      width: "25%",
      render: (roles) => {
        const flatRoles = roles.flat().slice(0, 2);
        return flatRoles.map((role, i) => (
          <Tag key={i} style={{ fontSize: 10 }}>
            {role.replace(/_/g, " ")}
          </Tag>
        ));
      },
    },
  ];

  /**
   * Fetches a limited number of KYC documents for summary display.
   */
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getAllKYCDocuments(1, 5); // fetch first 5 documents
      setItems(response.data);
    } catch (err) {
      console.error("Failed to fetch KYC documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="compliance-item-summary-section">
      {/* Header */}
      <div className="compliance-item-summary-header">
        <h3 className="compliance-item-summary-title">KYC Documents Summary</h3>
        <a
          onClick={() => navigate(ROUTES.SUPER_ADMIN_KYC_DOCUMENTS)}
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

export default KYCDocumentSummary;
