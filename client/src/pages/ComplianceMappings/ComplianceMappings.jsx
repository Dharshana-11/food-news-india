// pages/ComplianceMappings/index.jsx
import { useState, useEffect } from "react";
import { Input, Button, Modal, message, Select, Tabs } from "antd";
import { SearchOutlined, PlusOutlined, DeleteOutlined, AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import CustomTable from "../../components/CustomTable";
import MappingForm from "./MappingForm";
import MappingGrid from "./MappingGrid";
import { getAllComplianceMappings, deleteMapping, getBusinessTypesForDropdown } from "../../services/complianceMappingService";

const { Search } = Input;
const { confirm } = Modal;

const ComplianceMappings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ===================== FETCH BUSINESS TYPES =====================
  const fetchBusinessTypes = async () => {
    try {
      const types = await getBusinessTypesForDropdown();
      setBusinessTypes(types);
      if (types.length > 0) {
        setSelectedBusinessType(types[0]._id);
      }
    } catch (error) {
      message.error("Failed to load business types");
    }
  };

  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  // ===================== FETCH DATA =====================
  const fetchData = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const response = await getAllComplianceMappings(page, limit, search);
      setData(response.data.results);
      setPagination({
        current: response.data.page,
        pageSize: response.data.limit,
        total: response.data.total,
      });
    } catch (error) {
      message.error("Failed to load mappings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchData(pagination.current, pagination.pageSize, searchText);
    }
  }, [activeTab]);

  // ===================== SEARCH =====================
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
    fetchData(1, pagination.pageSize, value);
  };

  // ===================== TABLE CHANGE =====================
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchData(newPagination.current, newPagination.pageSize, searchText);
  };

  // ===================== ADD NEW =====================
  const handleAdd = () => {
    setIsModalOpen(true);
  };

  // ===================== DELETE =====================
  const handleDelete = (record) => {
    confirm({
      title: "Are you sure you want to delete this mapping?",
      content: `${record.businessTypeId?.name} - ${record.complianceItemId?.name}`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteMapping(record._id);
          message.success("Mapping deleted successfully");
          fetchData(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
          message.error("Failed to delete mapping");
          console.error(error);
        }
      },
    });
  };

  // ===================== FORM SUCCESS =====================
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchData(pagination.current, pagination.pageSize, searchText);
  };

  // ===================== TABLE COLUMNS =====================
  const columns = [
    {
      title: "Business Type",
      dataIndex: ["businessTypeId", "name"],
      key: "businessType",
      width: "25%",
      render: (_, record) => record.businessTypeId?.name || "-",
    },
    {
      title: "Compliance Item",
      dataIndex: ["complianceItemId", "name"],
      key: "complianceItem",
      width: "25%",
      render: (_, record) => record.complianceItemId?.name || "-",
    },
    {
      title: "Code",
      dataIndex: ["complianceItemId", "code"],
      key: "code",
      width: "10%",
      render: (_, record) => record.complianceItemId?.code || "-",
    },
    {
      title: "Applicability",
      dataIndex: "applicability",
      key: "applicability",
      width: "15%",
      render: (applicability) => (
        <span className={`applicability-badge applicability-${applicability}`}>
          {applicability?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => (
        <span className={`status-badge status-${status}`}>
          {status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
          className="action-btn delete-btn"
          danger
        />
      ),
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="compliance-mappings-page">
        <div className="page-header-section">
          <div className="header-content">
            <h2 className="page-main-title">Compliance Requirement Mappings</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="add-button"
            >
              Add Mapping
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "list",
              label: (
                <span>
                  <TableOutlined /> List View
                </span>
              ),
              children: (
                <>
                  <div className="filter-section">
                    <Search
                      placeholder="Search by business type or compliance item..."
                      allowClear
                      enterButton={<SearchOutlined />}
                      onSearch={handleSearch}
                      className="search-input"
                      style={{ width: 400 }}
                    />
                  </div>

                  <CustomTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                  />
                </>
              ),
            },
            {
              key: "grid",
              label: (
                <span>
                  <AppstoreOutlined /> Grid View
                </span>
              ),
              children: (
                <>
                  <div className="filter-section">
                    <Select
                      placeholder="Select Business Type"
                      value={selectedBusinessType}
                      onChange={setSelectedBusinessType}
                      className="business-type-selector"
                      style={{ width: 300 }}
                    >
                      {businessTypes.map((type) => (
                        <Select.Option key={type._id} value={type._id}>
                          {type.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {selectedBusinessType && (
                    <MappingGrid
                      businessTypeId={selectedBusinessType}
                      onUpdate={() => fetchData(pagination.current, pagination.pageSize, searchText)}
                    />
                  )}
                </>
              ),
            },
          ]}
        />

        <Modal
          title="Add Compliance Mapping"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={600}
          className="mapping-modal"
        >
          <MappingForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </SuperAdminLayout>
  );
};

export default ComplianceMappings;