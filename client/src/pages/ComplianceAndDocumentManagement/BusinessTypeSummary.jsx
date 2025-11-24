// pages/ComplianceAndDocumentManagement/BusinessTypeSummary.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import CustomTable from "../../components/CustomTable";
import { getAllBusinessTypes } from "../../services/businessTypeService";
import { ROUTES } from "../../routes";

const BusinessTypeSummary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: "30%" },
    { title: "Code", dataIndex: "code", key: "code", width: "15%" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "45%",
      render: (text) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (val) => (val === "active" ? "Active" : "Inactive"),
    },
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getAllBusinessTypes(1, 5);
      setItems(response.data);
    } catch (err) {
      console.error("Failed to fetch business types:", err);
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
        <h3 className="compliance-item-summary-title">Business Types Summary</h3>
        <a
          onClick={() => navigate(ROUTES.SUPER_ADMIN_BUSINESS_TYPES)}
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

export default BusinessTypeSummary;