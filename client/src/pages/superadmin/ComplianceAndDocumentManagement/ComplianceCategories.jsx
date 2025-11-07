import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Select,
  Popconfirm,
  Space,
  Tooltip,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import CustomTable from "../../../components/CustomTable";
import { getAllCategories } from "../../../services/complianceCategoryService";
import { useAuth } from "../../../context/AuthContext";
import SuperAdminLayout from "../../../layouts/SuperAdminLayout";

const { Option } = Select;

const ComplianceCategories = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchCategories = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getAllCategories(0, search.trim());
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentUser]);

  const handleSearch = () => fetchCategories();

  const handleRefresh = () => {
    setSearch("");
    setFilterStatus("");
    fetchCategories();
  };

  const filteredData = categories.filter((item) => {
    if (filterStatus === "active") return item.status === true;
    if (filterStatus === "inactive") return item.status === false;
    return true;
  });

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: "16%" },
    { title: "Code", dataIndex: "code", key: "code", width: "10%" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (text) => <span title={text}>{text || "-"}</span>,
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
      render: (val) => (
        <span className={val ? "status-active" : "status-inactive"}>
          {val ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Validity",
      dataIndex: "defaultValidityDays",
      key: "defaultValidityDays",
      width: "12%",
      align: "center",
      render: (val) => (val ? `${val} days` : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: "12%",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => console.log("Edit:", record._id)}
              className="edit-btn"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this category?"
            onConfirm={() => console.log("Delete:", record._id)}
          >
            <Tooltip title="Delete">
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="compliance-summary-section">
        {/* Header */}
        <div className="compliance-summary-header">
          <h3 className="compliance-summary-title">Compliance Categories</h3>
        </div>

        {/* Toolbar (now includes Add button) */}
        <div className="compliance-toolbar">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            className="compliance-search"
            prefix={<SearchOutlined />}
            allowClear
          />

          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={setFilterStatus}
            className="compliance-filter"
          >
            <Option value="">All</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>

          <Button icon={<ReloadOutlined />} onClick={handleRefresh} className="refresh-btn" />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="add-category-btn"
            onClick={() => console.log("Open Add Category Modal")}
          >
            Add Category
          </Button>
        </div>

        {/* Table */}
        <CustomTable columns={columns} data={filteredData} loading={loading} />
      </div>
    </SuperAdminLayout>
  );
};

export default ComplianceCategories;
