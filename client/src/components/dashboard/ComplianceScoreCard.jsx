import { Progress, Tag, Button } from "antd";
import "./ComplianceScoreCard.css";

/**
 * ComplianceScoreCard
 * -------------------
 * Reusable compliance score display with progress, status, and missing items.
 *
 * @param {number} score
 * @param {number} totalRequired
 * @param {number} fulfilled
 * @param {number} missing
 * @param {Array} missingItems
 * @param {Function} onFixIssues
 * @param {string} title
 */
const ComplianceScoreCard = ({
  title = "Compliance Score",
  score = 0,
  totalRequired = 0,
  fulfilled = 0,
  missing = 0,
  missingItems = [],
  onFixIssues,
}) => {
  return (
    <div className="panel-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>

        {onFixIssues && (
          <Button type="link" onClick={onFixIssues}>
            Fix Issues
          </Button>
        )}
      </div>

      <div className="compliance-score">
        <Progress
          type="circle"
          percent={score}
          strokeColor={
            score >= 80 ? "#52c41a" : score >= 50 ? "#faad14" : "#ff4d4f"
          }
        />

        <div className="compliance-meta">
          <p>
            <strong>{fulfilled}</strong> / <strong>{totalRequired}</strong>{" "}
            mandatory documents
          </p>

          {missing > 0 ? (
            <Tag color="red" className="compliance-tag">
              {missing} mandatory document
              {missing > 1 ? "s" : ""} missing
            </Tag>
          ) : (
            <Tag color="green" className="compliance-tag">
              Fully Compliant
            </Tag>
          )}
        </div>

        {missing > 0 && (
          <div className="missing-compliance">
            <p className="missing-title">Missing mandatory documents:</p>

            <ul className="missing-list">
              {missingItems.map((item) => (
                <li key={item._id}>{item.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceScoreCard;
