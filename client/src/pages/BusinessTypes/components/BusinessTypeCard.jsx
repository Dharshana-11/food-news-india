import { Card, Badge, Button, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getBusinessIcon } from "../utils/getBusinessIcon";

/**
 * BusinessTypeCard Component
 *
 * Displays a card with business type details including name, code,
 * description, sort order, status, and action buttons.
 *
 * @param {Object} props
 * @param {Object} props.businessType - Business type data
 * @param {function} props.onEdit - Callback when edit button is clicked
 * @param {function} props.onDelete - Callback when delete button is clicked
 */
const BusinessTypeCard = ({ businessType, onEdit, onDelete }) => {
  const isActive = businessType.status === "active";

  return (
    <Card
      className={`business-type-card ${isActive ? "active" : "inactive"}`}
      hoverable
    >
      {/* Header with icon and status */}
      <div className="card-header">
        <div className="card-icon-wrapper">
          <div className="card-icon">{getBusinessIcon(businessType.code)}</div>
        </div>
        <Badge
          status={isActive ? "success" : "default"}
          text={isActive ? "Active" : "Inactive"}
          className="status-badge"
        />
      </div>

      {/* Body with name, code, description, and sort order */}
      <div className="card-body">
        <h3 className="card-title">{businessType.name}</h3>
        <div className="card-code">
          <span className="code-badge">{businessType.code}</span>
        </div>
        <p className="card-description">{businessType.description}</p>
        <div className="card-footer">
          <span className="sort-label">Sort Order:</span>
          <span className="sort-value">{businessType.sortOrder}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="card-actions">
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(businessType)}
            className="action-button edit-button"
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(businessType)}
            className="action-button delete-button"
            danger
          />
        </Tooltip>
      </div>
    </Card>
  );
};

export default BusinessTypeCard;
