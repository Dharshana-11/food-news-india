import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import CustomTable from "../../components/CustomTable";
import { getAllDocuments } from "../../services/documentService";
import { ROUTES } from "../../routes";

const DocumentSummary = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: "File Name",
      key: "fileName",
      width: "30%",
      render: (_, record) => record.file?.originalName || "-",
    },
    {
      title: "Type",
      key: "type",
      width: "25%",
      render: (_, record) => {
        if (record.kycDocumentId) return "KYC";
        if (record.complianceItemId) return "Compliance";
        return "-";
      },
    },
    {
      title: "Uploaded By",
      key: "uploadedBy",
      width: "25%",
      render: (_, record) => record.uploadedByUser?.name || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status) => {
        const colors = {
          pending: "gold",
          approved: "blue",
          rejected: "red",
          expired: "volcano",
        };

        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getAllDocuments(1, 5);
      setItems(response.data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
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
          Uploaded Documents Summary
        </h3>
        <a
          onClick={() => navigate(ROUTES.SUPER_ADMIN_DOCUMENTS)}
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

export default DocumentSummary;