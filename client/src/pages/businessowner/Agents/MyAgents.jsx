import { useState, useEffect } from "react";
import { Card, Button, Input, Empty, message, Spin, Badge } from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import agentService from "../../../services/myAgentService";
import "./MyAgents.css";

const MyAgents = () => {
  const [myAgents, setMyAgents] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const [myData, availableData] = await Promise.all([
        agentService.getMyAgents(),
        agentService.getAvailableAgents(),
      ]);
      setMyAgents(myData.agents || []);
      setAvailableAgents(availableData.agents || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = (agentsArray) =>
    agentsArray.filter((agent) =>
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

  const renderAgentCard = (agent) => (
    <Card
      key={agent.relationId || agent.agentId || agent._id}
      hoverable
      className="my-agents-card"
      onClick={() =>
        agent.relationId
          ? navigate(`/business-owner/agents/${agent.relationId}`)
          : message.info("Agent details not available")
      }
    >
      <div className="my-agents-row">
        <div className="my-agents-avatar">
          {agent.name?.charAt(0).toUpperCase()}
        </div>

        <div className="my-agents-info">
          <div className="my-agents-name-row">
            <span className="my-agents-name">{agent.name}</span>
            {agent.status && getStatusBadge(agent.status)}
          </div>

          <div className="my-agents-meta">
            Managing{" "}
            <span className="highlight">
              {agent.businessesManaged || 0}+ businesses
            </span>
          </div>

          <div className="my-agents-price">
            ₹{agent.agreedCommission ?? agent.commissionRate ?? 0}
            <span className="per-month"> per month</span>
          </div>
        </div>

        <div className="my-agents-rating">
          <span>{agent.rating?.toFixed(1) || "0.0"}</span>
          <StarFilled />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="my-agents-loader-wrapper">
        <Spin size="large" />
      </div>
    );
  }

  const firstMyAgent = filteredAgents(myAgents)[0];

  return (
    <div className="my-agents-page">
      <div className="my-agents-container">
        {/* Header */}
        <div className="my-agents-page-header">
          <h2>My Agents</h2>
          <p>Manage your assigned and available agents</p>
        </div>

        <Input
          placeholder="Search agents here"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
          className="my-agents-search-input"
        />

        <Card title="Quick Actions" className="my-agents-quick-actions">
          <div className="my-agents-quick-actions-row">
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              className="add-my-agent"
              onClick={() => navigate("/business-owner/add-agent")}
              block
            >
              Add Agent
            </Button>

            <Button
              icon={<EyeOutlined />}
              onClick={() =>
                firstMyAgent
                  ? navigate(
                      `/business-owner/agents/${firstMyAgent.relationId}`
                    )
                  : message.info("No agents available")
              }
              block
            >
              View My Agent
            </Button>
          </div>
        </Card>

        <h3 className="my-agents-section-title">My Agents</h3>
        {filteredAgents(myAgents).length === 0 ? (
          <Empty
            description="No agents assigned"
            className="my-agents-empty-state"
          />
        ) : (
          <div className="my-agents-agent-list">
            {filteredAgents(myAgents).map(renderAgentCard)}
          </div>
        )}

        <h3 className="my-agents-section-title">Available Agents</h3>
        {filteredAgents(availableAgents).length === 0 ? (
          <Empty
            description="No available agents"
            className="my-agents-empty-state"
          />
        ) : (
          <div className="my-agents-list">
            {filteredAgents(availableAgents).map(renderAgentCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgents;
