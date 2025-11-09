import { useState, useEffect } from "react";
import {
  Input,
  Button,
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
import CategoryModal from "../../../components/CategoryModal";
import {
  getAllCategories,
  addComplianceCategory,
  updateComplianceCategory,
  deleteComplianceCategory,
} from "../../../services/complianceCategoryService";
import { useAuth } from "../../../context/AuthContext";
import SuperAdminLayout from "../../../layouts/SuperAdminLayout";

const ComplianceCategories = () => {
  const { currentUser } = useAuth();

  // ----------------- State -----------------
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [order, setOrder] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ----------------- Fetch categories -----------------
  const fetchCategories = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getAllCategories(0, search.trim());
      setCategories(data);
      setTotal(data.length);
    } catch (err) {
      console.error(err);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentUser]);

  // ----------------- Table change (sort/filter/paginate) -----------------
  const handleTableChange = (pagination, tableFilters, sorter) => {
    setPage(pagination.current);

    // Sorting
    if (sorter?.field && sorter?.order) {
      setSortBy(sorter.field);
      setOrder(sorter.order === "ascend" ? "asc" : "desc");
    } else {
      setSortBy(null);
      setOrder(null);
    }

    // Filters
    const newFilters = {};
    if (tableFilters.status) {
      newFilters.status = tableFilters.status[0];
    }
    setFilters(newFilters);
  };

  // ----------------- Handlers -----------------
  const handleRefresh = () => {
    setSearch("");
    fetchCategories();
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteComplianceCategory(id);
      message.success("Category deleted");
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete category");
    }
  };

  const handleModalSubmit = async (values) => {
    try {
      if (selectedCategory) {
        await updateComplianceCategory(selectedCategory._id, values);
        message.success("Category updated successfully");
      } else {
        await addComplianceCategory(values);
        message.success("Category added successfully");
      }
      setModalVisible(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Operation failed");
    }
  };

  // ----------------- Table Columns -----------------
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: "Required",
      dataIndex: "required",
      key: "required",
      filters: [
        { text: "Yes", value: true },
        { text: "No", value: false },
      ],
      onFilter: (value, record) => record.required === value,
      render: (val) => (val ? "Yes" : "No"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.status === value,
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
      sorter: true,
      align: "center",
      render: (val) => (val ? `${val} days` : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this category?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Tooltip title="Delete">
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ----------------- Render -----------------
  return (
    <SuperAdminLayout>
      <div className="compliance-categories-section">
        <div className="compliance-categories-header">
          <h3 className="compliance-categories-title">
            Compliance Categories
          </h3>
        </div>

        <div className="compliance-toolbar">
          <div className="compliance-categories-search-wrapper">
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchCategories}
              allowClear
            />
            <Button
              className="compliance-categories-search-icon"
              icon={<SearchOutlined />}
              onClick={fetchCategories}
            />
            <Button
              className="refresh-btn"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            />
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="add-category-btn"
          >
            Add Category
          </Button>
        </div>

        {/* Unified Table with AntD filter/sort/pagination */}
         <div className="custom-table-wrapper compliance-summary-table">
          <div className="custom-table-scroll">
            <CustomTable
              columns={columns}
              data={categories}
              loading={loading}
              pagination={{
                current: page,
                pageSize: limit,
                total,
                showSizeChanger: false,
              }}
              onChange={handleTableChange}
            />
          </div>
        </div>

        {/* Modal for Add/Edit */}
        <CategoryModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSubmit={handleModalSubmit}
          initialValues={selectedCategory}
        />
      </div>
    </SuperAdminLayout>
  );
};

export default ComplianceCategories;
