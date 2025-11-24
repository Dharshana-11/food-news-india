import { Card, Badge, Button, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getBusinessIcon } from "../utils/getBusinessIcon";

const BusinessTypeCard = ({ businessType, onEdit, onDelete }) => {
  return (
    <Card
      className={`business-type-card ${
        businessType.status === "active" ? "active" : "inactive"
      }`}
      hoverable
    >
      <div className="card-header">
        <div className="card-icon-wrapper">
          <div className="card-icon">
            {getBusinessIcon(businessType.code)}
          </div>
        </div>
        <Badge
          status={businessType.status === "active" ? "success" : "default"}
          text={businessType.status === "active" ? "Active" : "Inactive"}
          className="status-badge"
        />
      </div>

      <div className="card-body">
        <h3 className="card-title">{businessType.name}</h3>
        <div className="card-code">
          <span className="code-badge">{businessType.code}</span>
        </div>
        <p className="card-description">{businessType.description}</p>

        <div className="card-footer">
          <div className="sort-order">
            <span className="sort-label">Sort Order:</span>
            <span className="sort-value">{businessType.sortOrder}</span>
          </div>
        </div>
      </div>

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
