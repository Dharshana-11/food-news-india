// pages/KYCDocuments/KYCDocumentCard.jsx
import { Card, Avatar, Tag, Button } from "antd";
import {
  IdcardOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

/** Default role configuration */
const defaultRoleConfig = {
  business_owner: {
    label: "Business Owner",
    color: "#4F46E5",
    bg: "#EEF2FF",
    icon: <IdcardOutlined />,
  },
  agent: {
    label: "Agent",
    color: "#059669",
    bg: "#ECFDF5",
    icon: <IdcardOutlined />,
  },
  service_provider: {
    label: "Service Provider",
    color: "#D97706",
    bg: "#FFFBEB",
    icon: <IdcardOutlined />,
  },
};

/**
 * Single KYC Document Card
 * @param {Object} props
 * @param {Object} props.doc - KYC document object
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Object} props.roleConfig - Optional custom role config
 */
const KYCDocumentCard = ({
  doc,
  onEdit,
  onDelete,
  roleConfig = defaultRoleConfig,
}) => {
  const flatRoles = doc.applicableRoles.flat();

  return (
    <Card key={doc._id} className="kyc-document-card-superadmin" hoverable>
      <div className="kyc-card-layout">
        {/* Left: basic info */}
        <div className="kyc-card-left">
          <Avatar
            size={64}
            icon={<IdcardOutlined />}
            className="kyc-card-avatar"
          />
          <div className="kyc-card-info">
            <h3 className="kyc-card-title">{doc.name}</h3>
            <div className="kyc-card-code">{doc.code}</div>
            <p className="kyc-card-description">{doc.description}</p>
          </div>
        </div>

        {/* Right: roles & actions */}
        <div className="kyc-card-right">
          <div className="kyc-card-roles">
            <div className="roles-label">Applicable For:</div>
            <div className="roles-tags">
              {flatRoles.map((role, index) => {
                const config = roleConfig[role];
                if (!config) return null; // skip unknown roles
                return (
                  <Tag
                    key={index}
                    className="role-tag"
                    style={{
                      color: config.color,
                      borderColor: config.color,
                      backgroundColor: config.bg,
                    }}
                    icon={config.icon}
                  >
                    {config.label}
                  </Tag>
                );
              })}
            </div>
          </div>

          <div className="kyc-card-actions">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(doc)}
            >
              Edit
            </Button>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(doc)}
              danger
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

KYCDocumentCard.propTypes = {
  doc: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  roleConfig: PropTypes.object,
};

export default KYCDocumentCard;
