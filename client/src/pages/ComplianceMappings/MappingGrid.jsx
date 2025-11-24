// pages/ComplianceMappings/MappingGrid.jsx
import { useState, useEffect } from "react";
import { Table, Select, message, Spin } from "antd";
import { getComplianceMappingGrid, createOrUpdateMapping } from "../../services/complianceMappingService";

const MappingGrid = ({ businessTypeId, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [gridData, setGridData] = useState([]);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (businessTypeId) {
      fetchGridData();
    }
  }, [businessTypeId]);

  const fetchGridData = async () => {
    setLoading(true);
    try {
      const response = await getComplianceMappingGrid(businessTypeId);
      setGridData(response.data.rules);
    } catch (error) {
      message.error("Failed to load grid data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicabilityChange = async (complianceItemId, newApplicability) => {
    setUpdating({ ...updating, [complianceItemId]: true });
    
    try {
      await createOrUpdateMapping({
        businessTypeId,
        complianceItemId,
        applicability: newApplicability,
        status: "active",
        sortOrder: 0,
        createdBy: "Super Admin",
        updatedBy: "Super Admin",
      });
      
      message.success("Mapping updated successfully");
      fetchGridData();
      onUpdate();
    } catch (error) {
      message.error("Failed to update mapping");
      console.error(error);
    } finally {
      setUpdating({ ...updating, [complianceItemId]: false });
    }
  };

  const columns = [
    {
      title: "Compliance Item",
      dataIndex: "complianceItemName",
      key: "complianceItemName",
      width: "40%",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{record.complianceItemCode}</div>
        </div>
      ),
    },
    {
      title: "Applicability",
      dataIndex: "applicability",
      key: "applicability",
      width: "40%",
      render: (applicability, record) => (
        <Select
          value={applicability}
          onChange={(value) => handleApplicabilityChange(record.complianceItemId, value)}
          style={{ width: "100%" }}
          loading={updating[record.complianceItemId]}
        >
          <Select.Option value="required">
            <span style={{ color: "#dc2626" }}>● Required</span>
          </Select.Option>
          <Select.Option value="optional">
            <span style={{ color: "#f59e0b" }}>● Optional</span>
          </Select.Option>
          <Select.Option value="not_applicable">
            <span style={{ color: "#6b7280" }}>● Not Applicable</span>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: "20%",
      render: (_, record) => {
        if (record.mappingId) {
          return <span className="status-badge status-active">Mapped</span>;
        }
        return <span className="status-badge status-inactive">Not Mapped</span>;
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mapping-grid">
      <Table
        columns={columns}
        dataSource={gridData}
        rowKey="complianceItemId"
        pagination={false}
        className="custom-table"
      />
    </div>
  );
};

export default MappingGrid;