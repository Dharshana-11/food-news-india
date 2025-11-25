/**
 * ComplianceItemSummary Component
 * ---------------------------------------------------------
 * Shows a small summary table of compliance items
 * on the Super Admin dashboard.
 *
 * Fetches first 5 items and links to full list page.
 */

import { useState, useEffect } from "react";
import CustomTable from "../../components/CustomTable";
import { getAllComplianceItems } from "../../services/complianceItemService";
import { useAuth } from "../../context/AuthContext";
import { RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";

const ComplianceItemSummary = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /** Max rows shown in summary table */
  const LIMIT = 5;

  /** ===================== TABLE COLUMNS ===================== */
  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: "20%" },

    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
      render: (text) => (
        <span className="compliance-item-summary-description" title={text}>
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

  /** ===================== FETCH DATA ===================== */
  const fetchItems = async (search = "") => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const data = await getAllComplianceItems(LIMIT, search);
      setItems(data || []);
    } catch (err) {
      console.error("Failed to fetch compliance items:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch items when user is available */
  useEffect(() => {
    if (currentUser) fetchItems();
  }, [currentUser]);

  /** ===================== RENDER ===================== */
  return (
    <div className="compliance-item-summary-section">
      <div className="compliance-item-summary-header">
        <h3 className="compliance-item-summary-title">
          Compliance Items Summary
        </h3>

        <a
          role="button"
          onClick={() => navigate(ROUTES.SUPER_ADMIN_COMPLIANCE_ITEMS)}
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

export default ComplianceItemSummary;
