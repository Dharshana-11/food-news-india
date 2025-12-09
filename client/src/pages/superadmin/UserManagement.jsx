/**
 * @file UserManagement.jsx
 * @description User management interface for super admins to manage application users
 * @module pages/superadmin/UserManagement
 * @requires react
 * @requires antd
 * @requires @ant-design/icons
 * @requires ../../components/CustomTable
 * @requires ../../components/UserForm
 * @requires ../../services/userService
 * @requires ../../styles/global.css
 * @requires ../profile/UserHoverCard
 */

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Spin,
  Tag,
  message,
  Empty,
  Modal,
  Tooltip,
} from "antd";
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

/**
 * User Management Component
 * @function UserManagement
 * @description Provides interface for managing users with CRUD operations, verification, and filtering
 * @returns {JSX.Element} The user management interface
 * @example
 * <UserManagement />
 */
const UserManagement = () => {
  /**
   * @type {Array} data - List of users to be displayed
   */
  const [data, setData] = useState([]);

  /**
   * @type {number} total - Total number of users matching current filters
   */
  const [total, setTotal] = useState(0);

  /**
   * @type {boolean} loading - Loading state for async operations
   */
  const [loading, setLoading] = useState(false);

  /**
   * @type {number} page - Current pagination page
   */
  const [page, setPage] = useState(1);

  /**
   * @constant {number} limit - Number of items per page
   */
  const [limit] = useState(10);

  /**
   * @type {string} sortBy - Field to sort by
   */
  const [sortBy, setSortBy] = useState("createdAt");

  /**
   * @type {string} order - Sort order ('asc' or 'desc')
   */
  const [order, setOrder] = useState("desc");

  /**
   * @type {string} search - Search query string
   */
  const [search, setSearch] = useState("");

  /**
   * @type {Object} filters - Active filters for role and verification status
   */
  const [filters, setFilters] = useState({ role: "", isVerified: "" });

  // Modal states
  /**
   * @type {boolean} isAddModalOpen - Controls visibility of add user modal
   */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  /**
   * @type {Object|null} editingUser - Currently selected user for editing
   */
  const [editingUser, setEditingUser] = useState(null);

  // Rejection modal states
  /**
   * @type {boolean} showRejectModal - Controls visibility of rejection modal
   */
  const [showRejectModal, setShowRejectModal] = useState(false);

  /**
   * @type {string|null} rejectingUserId - ID of user being rejected
   */
  const [rejectingUserId, setRejectingUserId] = useState(null);

  /**
   * @type {string} rejectReason - Reason for user rejection
   */
  const [rejectReason, setRejectReason] = useState("");

  /**
   * Fetches users based on current filters, search, and pagination
   * @async
   * @function fetchUsers
   * @returns {Promise<void>}
   */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        order,
        name: search,
        role: filters.role,
        status: filters.status || undefined,
      };

      const res = await getAllUsers(params);
      setData(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, order, search, filters]);

  /**
   * Handles user creation
   * @async
   * @function handleAddUser
   * @param {Object} values - User data from form
   * @returns {Promise<void>}
   */
  const handleAddUser = async (values) => {
    try {
      setLoading(true);
      await createUser(values);
      message.success("User created successfully");
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user editing
   * @async
   * @function handleEditUser
   * @param {Object} values - User data from form
   * @returns {Promise<void>}
   */
  const handleEditUser = async (values) => {
    try {
      setLoading(true);
      await updateUserById(editingUser.uid, values);
      message.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user verification
   * @async
   * @function handleVerify
   * @param {string} userId - ID of user to verify
   * @returns {Promise<void>}
   */
  const handleVerify = async (userId) => {
    try {
      setLoading(true);
      await verifyUser(userId);
      message.success("User verified successfully");
      fetchUsers();
    } catch {
      message.error("Failed to verify user");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user rejection with optional reason
   * @async
   * @function handleReject
   * @param {string} userId - ID of user to reject
   * @returns {Promise<void>}
   */
  const handleReject = (userId) => {
    setRejectingUserId(userId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  /**
   * Handles user rejection with reason
   * @async
   * @function submitRejectUser
   * @returns {Promise<void>}
   */
  const submitRejectUser = async () => {
    if (!rejectReason.trim()) {
      message.warning("Please specify a reason");
      return;
    }

    try {
      setLoading(true);
      await rejectUser(rejectingUserId, { reason: rejectReason });
      message.success("User rejected");
      setShowRejectModal(false);
      fetchUsers();
    } catch {
      message.error("Failed to reject user");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user deletion with confirmation
   * @async
   * @function handleDelete
   * @param {string} userId - ID of user to delete
   * @returns {Promise<void>}
   */
  const handleDelete = async (userId) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteUser(userId);
          message.success("User deleted successfully");
          fetchUsers();
        } catch {
          message.error("Failed to delete user");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Table column configuration for the users table
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
      render: (_, record) => <UserHoverCard user={record} />,
    },
    {
      title: "Role",
      dataIndex: "role",
      filters: [
        { text: "All", value: "" },
        { text: "Super Admin", value: "super_admin" },
        { text: "Admin", value: "admin" },
        { text: "Agent", value: "agent" },
        { text: "Service Provider", value: "service_provider" },
        { text: "Business Owner", value: "business_owner" },
      ],
      render: (role) => {
      const formattedRole = role
        ? role
            .split("_") // split "super_admin" → ["super", "admin"]
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each
            .join(" ") // join → "Super Admin"
        : "—";
      return formattedRole;
    },
    },
    {
      title: "Email / Phone",
      render: (record) => record.email || record.phone || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "All", value: "" },
        { text: "Verified", value: "verified" },
        { text: "Pending", value: "pending" },
        { text: "Invalid", value: "invalid" },
      ],
      render: (_, record) => {
        if (record.status === "verified") return <Tag color="green">Verified</Tag>;
        if (record.status === "invalid")
          return (
            <Tooltip title={record.rejectionReason}>
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
      render: (val) => {
      if (!val) return "—";
      const date = new Date(val);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    },
    {
      title: "Actions",
      render: (record) => (
        <div className="action-icons">
          {!record.isVerified && (
            <>
              <Tooltip title="Accept">
                <CheckCircleFilled
                  className="action-icon accept"
                  onClick={() => handleVerify(record.uid)}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <CloseCircleFilled
                  className="action-icon reject"
                  onClick={() => handleReject(record.uid)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Edit">
            <EditOutlined
              className="action-icon edit"
              onClick={() => setEditingUser(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined
              className="action-icon delete"
              onClick={() => handleDelete(record.uid)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination, tableFilters, sorter) => {
    setPage(pagination.current);

    // Sorting — allow only one column
    if (sorter?.field && sorter?.order) {
      setSortBy(sorter.field);
      setOrder(sorter.order === "ascend" ? "asc" : "desc");
    }

    // Filters — merge role + status
    const newFilters = { ...filters };

    if (tableFilters.role) {
      newFilters.role = tableFilters.role[0] || "";
    }

    if (tableFilters.status) {
      newFilters.status = tableFilters.status[0] || "";
    }

    setFilters(newFilters);
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
            className="add-user-btn"
            icon={<PlusOutlined />}
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
          description={
            search || filters.role
              ? "No users match your filters"
              : "No users found yet"
          }
          style={{ marginTop: 40 }}
        />
      ) : (
        <CustomTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
        />
      )}

      {/* Add User */}
      <UserForm
        key="add-modal"
        mode="add"
        visible={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
        loading={loading}
      />

      {/* Edit User */}
      <UserForm
        key={editingUser ? `edit-${editingUser.uid}` : "edit-modal"}
        mode="edit"
        visible={!!editingUser}
        onCancel={() => setEditingUser(null)}
        onSubmit={handleEditUser}
        initialValues={editingUser}
        loading={loading}
      />

      <Modal
  title="Reject User"
  open={showRejectModal}
  okText="Reject"
  okType="danger"
  onOk={submitRejectUser}
  onCancel={() => setShowRejectModal(false)}
>
  <p>Please provide a reason for rejection:</p><br/>
  <Input.TextArea
    placeholder="Enter rejection reason"
    rows={4}
    value={rejectReason}
    onChange={(e) => setRejectReason(e.target.value)}
  />
</Modal>

    </div>
  );
};

export default UserManagement;

