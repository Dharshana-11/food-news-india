import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Timeline,
  Spin,
  message,
  Badge,
  Modal,
  Input,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  StarFilled,
  FileTextOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import agentService from "../../../services/myAgentService";

const ViewMyAgent = ({ relationId, onBack }) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchAgentDetails();
  }, [relationId]);

  const fetchAgentDetails = async () => {
    try {
      setLoading(true);
      const data = await agentService.getAgentDetails(relationId);
      setAgent(data.data);
    } catch (error) {
      console.error("Fetch agent error:", error);
      message.error("Failed to load agent details");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAgent = () => {
    Modal.confirm({
      title: "Remove Agent?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to remove this agent?</p>
          <Input.TextArea
            placeholder="Reason for removal (optional)"
            id="removal-reason"
            rows={3}
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const reason = document.getElementById("removal-reason")?.value || "";
        try {
          setRemoving(true);
          await agentService.removeAgent(relationId, reason);
          message.success("Agent removed successfully");
          if (onBack) onBack();
        } catch (error) {
          message.error("Failed to remove agent");
        } finally {
          setRemoving(false);
        }
      },
    });
  };

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
    <div style={{ padding: "16px", maxWidth: 600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ marginBottom: 12 }}
        >
          Back
        </Button>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>View My Agent</h2>
      </div>

      {/* Agent Profile Card */}
      <Card
        style={{ marginBottom: 24, borderRadius: 12 }}
        styles={{ body: { padding: 16 } }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#ff6b35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {agent.agent.name?.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {agent.agent.name}
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              Managing{" "}
              <span style={{ fontWeight: 600, color: "#ff6b35" }}>
                {agent.businessesManaged}+ businesses
              </span>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#ff6b35",
                marginTop: 4,
              }}
            >
              ₹{agent.agreedCommission}{" "}
              <span style={{ fontSize: 12, color: "#999" }}>per month</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>{agent.rating?.toFixed(1) || "0.0"}</span>
            <StarFilled style={{ color: "#faad14", fontSize: 18 }} />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card
        title="Quick Actions"
        style={{ marginBottom: 24 }}
        styles={{ body: { padding: 16 } }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button
            icon={<EyeOutlined />}
            size="large"
            block
            onClick={() => message.info("View activity feature coming soon")}
          >
            View Activity
          </Button>
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
          <Button
            icon={<ExclamationCircleOutlined />}
            size="large"
            block
            onClick={() => message.info("Raise ticket feature coming soon")}
          >
            Raise Ticket
          </Button>
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card
        title="View Activity"
        style={{ marginBottom: 24 }}
        styles={{ body: { padding: "20px 16px" } }}
      >
        {agent.activityLog && agent.activityLog.length > 0 ? (
          <Timeline
            items={agent.activityLog.slice(0, 5).map((activity) => ({
              dot: getActivityIcon(activity.action),
              children: (
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>
                    {activity.description ||
                      activity.action.replace(/_/g, " ").toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                    {formatDate(activity.timestamp)}
                  </div>
                </div>
              ),
            }))}
          />
        ) : (
          <p style={{ textAlign: "center", color: "#999" }}>
            No recent activity
          </p>
        )}
      </Card>
    </div>
  );
};

export default ViewMyAgent;
