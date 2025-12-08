import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Spin,
  Modal,
  message,
  Descriptions,
  Tooltip,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import {
  getUserProfile,
  deleteSelfProfile,
  updateSelfProfile,
  getUserById,
} from "../../services/userService";
import { useParams, useNavigate } from "react-router-dom";
import avatar from "../../assets/avatar.png";
import UserForm from "../../components/UserForm";
import "../../styles/global.css";

/**
 * Displays the logged-in user's own profile or another user's profile,
 * depending on whether a `uid` is present in the URL.
 *
 * - When no `uid` is present, it loads the current user's profile (`/profile`).
 * - When `uid` is present, it loads the target user's profile (`/profile/:uid`).
 *
 * Includes:
 * - Role-based access control when viewing other profiles
 * - Profile update (self only)
 * - Account deletion (self only)
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.currentUser - The currently logged-in user's data used for access control.
 * @returns {JSX.Element|null} The profile view UI.
 */

const ProfileSelf = ({ currentUser }) => {
  const { uid } = useParams(); // if present → viewing another user's profile
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isSelfProfile = !uid; // true → /profile, false → /profile/:uid

  // ✅ Fetch profile (self or other)

  /**
   * Fetches a profile based on the page context.
   * - If viewing own profile: calls `getUserProfile()`.
   * - If viewing another user: calls `getUserById(uid)`.
   *
   * Also applies role-based access control to prevent unauthorized users
   * from viewing restricted profiles.
   *
   * @async
   * @function fetchProfile
   * @returns {Promise<void>}
   */

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let res;

      if (isSelfProfile) {
        // self
        res = await getUserProfile();
      } else {
        // viewing another user
        res = await getUserById(uid);
      }

      const data = res.data;

      // Role-based access control for others
      if (!isSelfProfile && currentUser) {
        const viewerRole = currentUser.role;
        const targetRole = data.role;

        const isAdminViewable =
          viewerRole === "admin" || viewerRole === "super_admin";
        const isNonAdminViewable =
          ["agent", "business_owner", "service_provider"].includes(viewerRole) &&
          !["admin", "super_admin"].includes(targetRole);

        if (!isAdminViewable && !isNonAdminViewable) {
          message.error("You are not authorized to view this profile");
          return navigate(-1);
        }
      }

      setUser(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete own account

  /**
   * Displays a confirmation modal and, upon user approval,
   * deletes the currently logged-in account.
   *
   * @function handleDelete
   * @returns {void}
   */

  const handleDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete your account?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteSelfProfile();
          message.success("Account deleted successfully");
          // TODO: redirect to login or home
        } catch (err) {
          console.error(err);
          message.error("Failed to delete account");
        }
      },
    });
  };

  // ✅ Handle edit form submission

  /**
   * Submits updated profile data for the current user.
   * After a successful update, the profile is refreshed.
   *
   * @async
   * @function handleEditSubmit
   * @param {Object} values - Updated profile form values.
   * @returns {Promise<void>}
   */

  const handleEditSubmit = async (values) => {
    try {
      await updateSelfProfile(values);
      message.success("Profile updated successfully");
      setIsEditModalOpen(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      message.error("Failed to update profile");
    }
  };

  /**
   * Calls profile fetch whenever the URL `uid` parameter changes.
   * Ensures correct behavior when switching between self and another profile.
   *
   * @effect
   */

  useEffect(() => {
    fetchProfile();
  }, [uid]);

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );

  if (!user) return null;

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB")
    : "—";

  const formattedRole = user.role
    ? user.role
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "—";

  const isAdmin =
    user.role === "admin" || user.role === "super_admin";

  return (
    <div className="profile-page-container">
      <Card
        className="profile-card"
        bordered={false}
        actions={
          isSelfProfile
            ? [
                <Tooltip title="Edit Profile" key="edit">
                  <EditOutlined
                    onClick={() => setIsEditModalOpen(true)}
                    style={{ color: "#1890ff" }}
                  />
                </Tooltip>,
                <Tooltip title="Delete Account" key="delete">
                  <DeleteOutlined
                    onClick={handleDelete}
                    style={{ color: "#ff4d4f" }}
                  />
                </Tooltip>,
              ]
            : []
        }
      >
        {/* Profile Header */}
        <div className="profile-header">
          <Avatar size={96} src={avatar} icon={<UserOutlined />} />
          <div className="profile-info">
            <h2 className="profile-name">
              {user.name}
              {user.isVerified && (
                <CheckCircleFilled
                  style={{
                    color: "#52c41a",
                    marginLeft: "8px",
                    fontSize: "18px",
                  }}
                />
              )}
            </h2>
            <p className="profile-role">{formattedRole}</p>
          </div>
        </div>

        {/* Account Details */}
        <Descriptions
          title="Account Details"
          bordered
          column={1}
          size="middle"
          className="profile-details"
        >
          {isAdmin ? (
            <Descriptions.Item label="Email">
              {user.email || "—"}
            </Descriptions.Item>
          ) : (
            <Descriptions.Item label="Phone">
              {user.phone || "—"}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Status">
            {user.isVerified ? (
              <Tag color="green">Verified</Tag>
            ) : (
              <Tag color="orange">Pending</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Registered On">
            {formattedDate}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* ✏️ Edit Modal (only for self) */}
      {isSelfProfile && (
        <UserForm
          mode="edit"
          visible={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          initialValues={user}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ProfileSelf;

