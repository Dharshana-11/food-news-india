import { useState, useEffect } from "react";
import { Card, Button, Input, Empty, message, Spin, Badge } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
  StarFilled,
} from "@ant-design/icons";
import agentService from "../../services/myAgentService";

const MyAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMyAgents();
  }, []);

  const fetchMyAgents = async () => {
    try {
      setLoading(true);
      const data = await agentService.getMyAgents();
      setAgents(data.agents || []);
    } catch (error) {
      console.error("Fetch agents error:", error);
      message.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { color: "green", text: "Active" },
      pending: { color: "orange", text: "Pending" },
      rejected: { color: "red", text: "Rejected" },
    };
    const config = statusMap[status] || { color: "default", text: status };
    return <Badge color={config.color} text={config.text} />;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", maxWidth: 600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          My Agents
        </h2>
        <p style={{ color: "#888", fontSize: 14 }}>
          Manage your assigned agents
        </p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search agents here"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16 }}
        size="large"
      />

      {/* Quick Actions */}
      <Card
        title="Quick Actions"
        style={{ marginBottom: 24 }}
        styles={{ body: { padding: 16 } }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => (window.location.href = "/business-owner/add-agent")}
            style={{ flex: 1 }}
          >
            Add Agent
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() =>
              filteredAgents[0]
                ? (window.location.href = `/business-owner/agents/${filteredAgents[0].relationId}`)
                : message.info("No agents available")
            }
            style={{ flex: 1 }}
          >
            View My Agent
          </Button>
        </div>
      </Card>

      {/* Agents List */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        Available Agents
      </h3>

      {filteredAgents.length === 0 ? (
        <Empty description="No agents found" style={{ padding: "60px 20px" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredAgents.map((agent) => (
            <Card
              key={agent.relationId}
              hoverable
              onClick={() =>
                (window.location.href = `/business-owner/agents/${agent.relationId}`)
              }
              style={{ borderRadius: 12 }}
              styles={{ body: { padding: 16 } }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Avatar */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#ff6b35",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 18,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {agent.name?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      {agent.name}
                    </span>
                    {getStatusBadge(agent.status)}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#666",
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Managing{" "}
                    <span style={{ fontWeight: 600, color: "#ff6b35" }}>
                      {agent.businessesManaged || 0}+ businesses
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
                    <span style={{ fontSize: 12, color: "#999" }}>
                      per month
                    </span>
                  </div>
                </div>

                {/* Rating */}
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
                  <StarFilled style={{ color: "#faad14", fontSize: 16 }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAgents;
