import { useState, useEffect } from "react";
import CustomTable from "../../../components/CustomTable";
import { getAllCategories } from "../../../services/complianceCategoryService";
import { useAuth } from "../../../context/AuthContext";
import { RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes";

const ComplianceSummary = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ===================== TABLE COLUMNS =====================
  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: "20%" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text) => (
        <span className="compliance-summary-description" title={text}>
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Required",
      dataIndex: "required",
      key: "required",
      width: "10%",
      render: (val) => (val ? "Yes" : "No"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (val) => (val ? "Active" : "Inactive"),
    },
  ];

  // ===================== FETCH DATA =====================
  const fetchCategories = async (search = "") => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getAllCategories(5, search);
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentUser]);

  return (
    <div className="compliance-summary-section">
      <div className="compliance-summary-header">
        <h3 className="compliance-summary-title">Compliance Categories</h3>
        <a
          onClick={() => navigate(ROUTES.SUPER_ADMIN_COMPLIANCE_CATEGORIES)}
          className="compliance-summary-link"
        >
          <RightOutlined />
        </a>
      </div>

      <div className="custom-table-wrapper compliance-summary-table">
        <CustomTable columns={columns} data={categories} loading={loading} />
      </div>
    </div>
  );
};

export default ComplianceSummary;
