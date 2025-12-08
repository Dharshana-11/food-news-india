import React from "react";
import { Card, Avatar, Tag, Tooltip } from "antd";
import { CheckCircleFilled, UserOutlined } from "@ant-design/icons";
import avatar from "../../assets/avatar.png";
import { useNavigate } from "react-router-dom";

/**
 * Displays a hoverable user preview card inside a tooltip.
 *
 * - Shows avatar, name, role, and verification status.
 * - Clicking on the name or card navigates to the user's profile.
 * - Can be used for user listings, approvals, and quick info previews.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.user - User data object to display.
 * @param {string} [props.placement="right"] - Tooltip placement (e.g., "right", "top", "bottom").
 * @param {("small"|"large")} [props.size="small"] - Card size variant that changes width.
 * @returns {JSX.Element|null} A clickable hover card or `null` if no user is provided.
 */


 /**
   * Navigates to the user's profile page when the user name or card is clicked.
   *
   * @function navigate
   * @param {void}
   * @example
   * // Example navigation route:
   * navigate(`/super-admin/profile/${user.uid}`);
   */

const UserHoverCard = ({ user, placement = "right", size = "small" }) => {
  const navigate = useNavigate();

  if (!user) return null;

   /**
   * Converts a snake_case user role (e.g., "business_owner") into a readable format.
   *
   * @constant
   * @type {string}
   * @example
   * // "super_admin" → "Super Admin"
   */

  const formattedRole = user.role
    ? user.role
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "—";

  return (
    <Tooltip
      overlayInnerStyle={{ padding: 0, background: "transparent" }}
      placement={placement}
      color="transparent"
      title={
        <Card
          hoverable
          style={{
            width: size === "small" ? 220 : 260,
            borderRadius: 10,
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            textAlign: "center",
            background: "#fff",
          }}
          onClick={() => navigate(`/super-admin/profile/${user.uid}`)}
        >
          <Avatar size={64} src={avatar} icon={<UserOutlined />} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 ,flexDirection: 'row'}}>
            <h3 style={{ marginTop: 8, fontWeight: 600 }}>{user.name}</h3>
            {user.isVerified && (
              <CheckCircleFilled style={{ color: "#52c41a", fontSize: 16 }} />
            )}
          </div>
          <p style={{ color: "#888", marginBottom: 4 }}>{formattedRole}</p>
          <Tag
            color={user.isVerified ? "green" : "orange"}
            style={{ marginTop: 8 }}
          >
            {user.isVerified ? "Verified" : "Pending"}
          </Tag>
        </Card>
      }
    >
      <span
        style={{ cursor: "pointer", color: "#162247", fontWeight: 500 }}
        onClick={() => navigate(`/super-admin/profile/${user.uid}`)}
      >
        {user.name}
      </span>
    </Tooltip>
  );
};

export default UserHoverCard;

