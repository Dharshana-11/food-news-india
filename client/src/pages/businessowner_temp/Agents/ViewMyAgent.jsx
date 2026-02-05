/**
 * ViewMyAgent.jsx
 * ============================================================================
 * Displays detailed information about the currently assigned agent
 * for a business owner, including profile, activity, and actions.
 *
 * Features:
 * - View agent profile & commission
 * - View recent activity timeline
 * - Remove agent with confirmation
 *
 * @component
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Timeline, Spin, message, Modal, Input } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  StarFilled,
  FileTextOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import agentService from "../../../services/myAgentService";
import "./ViewMyAgent.css";

const ViewMyAgent = ({ onBack }) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [removalReason, setRemovalReason] = useState("");

  const { relationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgentDetails();
  }, [relationId]);

  /**
   * Fetch agent details for the given relation ID
   */
  const fetchAgentDetails = async () => {
    if (!relationId) return;

    try {
      setLoading(true);
      const response = await agentService.getAgentDetails(relationId);
      setAgent(response.data);
    } catch (error) {
      console.error("Fetch agent error:", error);
      message.error("Failed to load agent details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle agent removal with confirmation
   */
  const handleRemoveAgent = () => {
    Modal.confirm({
      title: "Remove Agent?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          <p>Are you sure you want to remove this agent?</p>
          <Input.TextArea
            placeholder="Reason for removal (optional)"
            rows={3}
            style={{ marginTop: 12 }}
            value={removalReason}
            onChange={(e) => setRemovalReason(e.target.value)}
          />
        </>
      ),
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setRemoving(true);
          await agentService.removeAgent(relationId, removalReason);
          message.success("Agent removed successfully");
          if (onBack) onBack();
        } catch (error) {
          message.error("Failed to remove agent");
        } finally {
          setRemoving(false);
          setRemovalReason("");
        }
      },
    });
  };

  /**
   * Get activity icon based on action type
   */
  const getActivityIcon = (action) => {
    const iconMap = {
      document_uploaded: <FileTextOutlined style={{ color: "#1890ff" }} />,
      application_submitted: (
        <CheckCircleOutlined style={{ color: "#52c41a" }} />
      ),
      renewal_requested: <SyncOutlined style={{ color: "#faad14" }} />,
      profile_updated: <UserOutlined style={{ color: "#722ed1" }} />,
    };

    return iconMap[action] || <FileTextOutlined />;
  };

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <p>Agent not found</p>
      </div>
    );
  }

  return (
    <div className="view-agent-page">
      <div className="view-agent-container">
        {/* Header */}
        <div className="view-agent-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => (onBack ? onBack() : navigate(-1))}
          />
          <h2 className="view-agent-title">View My Agent</h2>
        </div>

        {/* Profile */}
        <Card className="view-agent-section-card agent-profile-card">
          <div className="view-agent-profile">
            <div className="view-agent-avatar">
              {agent.agent.name?.charAt(0).toUpperCase()}
            </div>

            <div className="view-agent-info">
              <div className="view-agent-name">{agent.agent.name}</div>

              <div className="view-agent-meta">
                Managing <span>{agent.businessesManaged}+ businesses</span>
              </div>

              <div className="view-agent-price">
                ₹{agent.agreedCommission} <span>per month</span>
              </div>
            </div>

            <div className="view-agent-rating">
              <span>{agent.rating?.toFixed(1) || "0.0"}</span>
              <StarFilled style={{ color: "#faad14", fontSize: 18 }} />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card title="Quick Actions" className="view-agent-section-card">
          <div className="view-agent-actions">
            <Button
              icon={<DeleteOutlined />}
              danger
              size="large"
              block
              onClick={handleRemoveAgent}
              loading={removing}
            >
              Remove Agent
            </Button>

            <Button icon={<ExclamationCircleOutlined />} size="large" block>
              Raise Ticket
            </Button>
          </div>
        </Card>

        {/* Activity */}
        <Card
          title="Recent Activity"
          className="view-agent-activity-section-card"
        >
          {agent.activityLog?.length ? (
            <Timeline
              items={agent.activityLog.slice(0, 5).map((activity) => ({
                dot: getActivityIcon(activity.action),
                children: (
                  <>
                    <div style={{ fontWeight: 500 }}>
                      {activity.description ||
                        activity.action.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      {formatDate(activity.timestamp)}
                    </div>
                  </>
                ),
              }))}
            />
          ) : (
            <div className="view-agent-activity-empty">No recent activity</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ViewMyAgent;
