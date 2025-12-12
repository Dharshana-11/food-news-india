import React, { useState, useEffect } from "react";
import { Input, Button, Spin, Tag, message, Empty, Modal, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import CustomTable from "../../components/CustomTable";
import UserForm from "../../components/UserForm";
import {
  getAllUsers,
  createUser,
  verifyUser,
  rejectUser,
  deleteUser,
  updateUserById,
} from "../../services/userService";
import "../../styles/global.css";
import UserHoverCard from "../profile/UserHoverCard";

const ROLE_FILTERS = [
  { text: "All", value: "" },
  { text: "Super Admin", value: "super_admin" },
  { text: "Admin", value: "admin" },
  { text: "Agent", value: "agent" },
  { text: "Service Provider", value: "service_provider" },
  { text: "Business Owner", value: "business_owner" },
];

const STATUS_FILTERS = [
  { text: "All", value: "" },
  { text: "Verified", value: "verified" },
  { text: "Pending", value: "pending" },
  { text: "Invalid", value: "invalid" },
];

// Helpers
const formatRole = (role) =>
  role
    ? role
        .split("_")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
    : "—";

const formatDate = (val) =>
  val ? new Date(val).toLocaleDateString("en-GB").replace(/\//g, "-") : "—";

const UserManagement = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({ role: "", status: "" });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [rejectModal, setRejectModal] = useState({
    open: false,
    id: null,
    reason: "",
  });

  // Wrapper to reduce try/catch repetition
  const wrapAction = async (cb, successMsg) => {
    try {
      setLoading(true);
      await cb();
      if (successMsg) message.success(successMsg);
    } catch (e) {
      message.error(e?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Load users
  const fetchUsers = async () => {
    setLoading(true);
    await wrapAction(async () => {
      const res = await getAllUsers({
        page,
        limit,
        sortBy,
        order,
        name: search,
        role: filters.role,
        status: filters.status || undefined,
      });
      setData(res.data.users || []);
      setTotal(res.data.total || 0);
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, order, search, filters]);

  // CRUD handlers
  const handleAddUser = async (values) =>
    wrapAction(async () => {
      await createUser(values);
      setIsAddModalOpen(false);
      fetchUsers();
    }, "User created successfully");

  const handleEditUser = async (values) =>
    wrapAction(async () => {
      await updateUserById(editingUser.uid, values);
      setEditingUser(null);
      fetchUsers();
    }, "User updated successfully");

  const handleVerify = (id) =>
    wrapAction(async () => {
      await verifyUser(id);
      fetchUsers();
    }, "User verified successfully");

  const handleRejectOpen = (id) =>
    setRejectModal({ open: true, id, reason: "" });

  const submitRejectUser = () => {
    if (!rejectModal.reason.trim())
      return message.warning("Please specify a reason");

    wrapAction(async () => {
      await rejectUser(rejectModal.id, { reason: rejectModal.reason });
      setRejectModal({ open: false, id: null, reason: "" });
      fetchUsers();
    }, "User rejected");
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure?",
      okText: "Delete",
      okType: "danger",
      onOk: () =>
        wrapAction(async () => {
          await deleteUser(id);
          fetchUsers();
        }, "User deleted successfully"),
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
      render: (_, rec) => <UserHoverCard user={rec} />,
    },
    {
      title: "Role",
      dataIndex: "role",
      filters: ROLE_FILTERS,
      render: (role) => formatRole(role),
    },
    {
      title: "Email / Phone",
      render: (rec) => rec.email || rec.phone || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: STATUS_FILTERS,
      render: (_, rec) => {
        if (rec.status === "verified") return <Tag color="green">Verified</Tag>;
        if (rec.status === "invalid")
          return (
            <Tooltip title={rec.rejectionReason}>
              <Tag color="red">Invalid</Tag>
            </Tooltip>
          );
        return <Tag color="orange">Pending</Tag>;
      },
    },
    {
      title: "Registration Date",
      dataIndex: "createdAt",
      sorter: true,
      render: (val) => formatDate(val),
    },
    {
      title: "Actions",
      render: (rec) => (
        <div className="action-icons">
          {!rec.isVerified && (
            <>
              <Tooltip title="Accept">
                <CheckCircleFilled
                  className="action-icon accept"
                  onClick={() => handleVerify(rec.uid)}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <CloseCircleFilled
                  className="action-icon reject"
                  onClick={() => handleRejectOpen(rec.uid)}
                />
              </Tooltip>
            </>
          )}

          <Tooltip title="Edit">
            <EditOutlined
              className="action-icon edit"
              onClick={() => setEditingUser(rec)}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <DeleteOutlined
              className="action-icon delete"
              onClick={() => handleDelete(rec.uid)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination, tFilters, sorter) => {
    setPage(pagination.current);

    if (sorter?.field && sorter?.order) {
      setSortBy(sorter.field);
      setOrder(sorter.order === "ascend" ? "asc" : "desc");
    }

    setFilters({
      role: tFilters.role?.[0] || "",
      status: tFilters.status?.[0] || "",
    });
  };

  return (
    <div className="user-management-container">
      {/* Header */}
      <div className="header-bar">
        <h2 className="user-title">
          <span className="all-users">All Users</span>{" "}
          <span className="divider">|</span>{" "}
          <span className="count">{total}</span>
        </h2>

        <div className="header-actions">
          <Input.Search
            placeholder="Search by name"
            allowClear
            onSearch={(value) => {
              setPage(1);
              setSearch(value);
            }}
            style={{ width: 240 }}
          />
          <Button
            icon={<PlusOutlined />}
            className="add-user-btn"
            onClick={() => {
              setEditingUser(null);
              setIsAddModalOpen(true);
            }}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <Empty
          style={{ marginTop: 40 }}
          description={
            search || filters.role
              ? "No users match your filters"
              : "No users found yet"
          }
        />
      ) : (
        <CustomTable
          columns={columns}
          data={data}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
        />
      )}

      {/* Add User Modal */}
      <UserForm
        key="add-form"
        mode="add"
        visible={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
        loading={loading}
      />

      {/* Edit User Modal */}
      <UserForm
        key={editingUser ? `edit-${editingUser.uid}` : "edit-form"}
        mode="edit"
        visible={!!editingUser}
        initialValues={editingUser}
        onCancel={() => setEditingUser(null)}
        onSubmit={handleEditUser}
        loading={loading}
      />

      {/* Reject Modal */}
      <Modal
        title="Reject User"
        open={rejectModal.open}
        okText="Reject"
        okType="danger"
        onOk={submitRejectUser}
        onCancel={() => setRejectModal({ open: false, id: null, reason: "" })}
      >
        <Input.TextArea
          rows={4}
          placeholder="Enter rejection reason"
          value={rejectModal.reason}
          onChange={(e) =>
            setRejectModal({ ...rejectModal, reason: e.target.value })
          }
        />
      </Modal>
    </div>
  );
};

export default UserManagement;
