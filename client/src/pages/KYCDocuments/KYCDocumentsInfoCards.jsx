// pages/KYCDocuments/KYCDocumentInfoCard.jsx
import { Card } from "antd";
import PropTypes from "prop-types";

/**
 * Info card showing number of KYC documents for a role
 * @param {Object} props
 * @param {string} props.title - Card title (e.g., "Business Owners")
 * @param {number} props.count - Number of documents
 * @param {React.ReactNode} props.icon - Icon for the card
 * @param {string} props.className - Additional CSS class for styling
 */
const KYCDocumentInfoCard = ({ title, count, icon, className = "" }) => (
  <Card className={`kyc-info-card ${className}`}>
    <div className="info-card-content">
      {icon}
      <div className="info-card-text">
        <h4>{title}</h4>
        <p>{count} documents</p>
      </div>
    </div>
  </Card>
);

KYCDocumentInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default KYCDocumentInfoCard;
