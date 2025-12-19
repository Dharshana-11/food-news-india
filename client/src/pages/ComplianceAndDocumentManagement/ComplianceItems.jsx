import { useState, useEffect } from "react";
import { Input, Button, Popconfirm, Space, Tooltip, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import CustomTable from "../../components/CustomTable";
import ComplianceItemModal from "../../components/ComplianceItemModal";
import {
  getAllComplianceItems,
  addComplianceItem,
  updateComplianceItem,
  deleteComplianceItem,
} from "../../services/complianceItemService";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../layouts/AppLayout";
import ROLES from "../../constants/roles";

const ComplianceItems = () => {
  const { currentUser } = useAuth();

  // ----------------- State -----------------
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [order, setOrder] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // ----------------- Fetch items -----------------
  const fetchItems = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // TODO: extend getAllComplianceItems to accept page, limit, filters, sortBy, order
      const data = await getAllComplianceItems(0, search.trim());
      setItems(data);
      setTotal(data.length);
    } catch (err) {
      console.error(err);
      message.error("Failed to load compliance items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
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
    fetchItems();
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteComplianceItem(id);
      message.success("Item deleted");
      fetchItems();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete item");
    }
  };

  const handleModalSubmit = async (values) => {
    try {
      if (selectedItem) {
        await updateComplianceItem(selectedItem._id, values);
        message.success("Item updated successfully");
      } else {
        await addComplianceItem(values);
        message.success("Item added successfully");
      }
      setModalVisible(false);
      fetchItems();
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
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Trash", value: "trash" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (val) => (
        <span className={`status-${val}`}>
          {val.charAt(0).toUpperCase() + val.slice(1)}
        </span>
      ),
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
            title="Delete this item?"
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
    // <AppLayout role={ROLES.SUPER_ADMIN}>
    <div className="compliance-items-section">
      {/* Header */}
      <div className="compliance-items-header">
        <h3 className="compliance-items-title">Compliance Items</h3>
      </div>

      {/* Toolbar */}
      <div className="compliance-toolbar">
        <div className="compliance-items-search-wrapper">
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchItems}
            allowClear
          />
          <Button
            className="compliance-items-search-icon"
            icon={<SearchOutlined />}
            onClick={fetchItems}
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
          className="add-item-btn"
        >
          Add Item
        </Button>
      </div>

      {/* Table */}
      <div className="custom-table-wrapper compliance-items-table">
        <div className="custom-table-scroll">
          <CustomTable
            columns={columns}
            data={items}
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

      {/* Add/Edit Modal */}
      <ComplianceItemModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
        initialValues={selectedItem}
      />
    </div>
    // </AppLayout>
  );
};

export default ComplianceItems;
