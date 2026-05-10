import { useState, useEffect } from "react";
import { Card, Button, Input, Empty, message, Spin, Badge } from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
  StarFilled,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import agentService from "../../../services/myAgentService";
import "./MyAgents.css";

/**
 * MyAgents
 * ------------------------------------------------------------------
 * Displays:
 * - Assigned agents for the business owner
 * - Available agents that can be added
 *
 * Features:
 * - Search agents by name
 * - View active/pending agents
 * - Navigate to agent details or add agent page
 *
 * NOTE:
 * Business logic is intentionally kept minimal here.
 * All data fetching is handled via agentService.
 */
const MyAgents = () => {
  const [myAgents, setMyAgents] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  /**
   * Fetch assigned and available agents on mount
   */
  useEffect(() => {
    fetchAgents();
  }, []);

  /**
   * Fetch agents from backend
   */
  const fetchAgents = async () => {
    try {
      setLoading(true);

      const [myData, availableData] = await Promise.all([
        agentService.getMyAgents(),
        agentService.getAvailableAgents(),
      ]);

      setMyAgents(myData?.agents || []);
      setAvailableAgents(availableData?.agents || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter agents by search term (case-insensitive)
   *
   * @param {Array<Object>} agents
   * @returns {Array<Object>}
   */
  const filterAgentsBySearch = (agents) =>
    agents.filter((agent) =>
      agent.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  /**
   * Render status badge based on agent status
   *
   * @param {string} status
   * @returns {JSX.Element}
   */
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { color: "green", text: "Active" },
      pending: { color: "orange", text: "Pending" },
      rejected: { color: "red", text: "Rejected" },
    };

    const config = statusMap[status] || {
      color: "default",
      text: status,
    };

    return <Badge color={config.color} text={config.text} />;
  };

  /**
   * Render single agent card
   *
   * @param {Object} agent
   * @returns {JSX.Element}
   */
  const renderAgentCard = (agent) => (
    <Card
      key={agent.relationId || agent.agentId || agent._id}
      className="my-agents-card"
    >
      <div className="my-agents-row">
        <div className="my-agents-avatar">
          {agent.name?.charAt(0)?.toUpperCase()}
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

          {/* <div className="my-agents-price">
            ₹{agent.agreedCommission ?? agent.monthlyCommission ?? 0}
            <span className="per-month"> per month</span>
          </div> */}
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

  // Pre-filtered lists (avoid repeating logic)
  const filteredMyAgents = filterAgentsBySearch(myAgents);
  const filteredAvailableAgents = filterAgentsBySearch(availableAgents);

  const activeAgents = filteredMyAgents.filter(
    (agent) => agent.status === "active",
  );

  const pendingAgents = filteredMyAgents.filter(
    (agent) => agent.status === "pending",
  );

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

        {/* Quick Actions */}
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
              onClick={() => {
                if (activeAgents.length > 0) {
                  navigate(
                    `/business-owner/agents/${activeAgents[0].relationId}`,
                  );
                } else if (pendingAgents.length > 0) {
                  message.info("Your agent is still pending");
                } else {
                  message.info("No agents available");
                }
              }}
              block
            >
              View My Agent
            </Button>
          </div>
        </Card>

        {/* My Agents */}
        <h3 className="my-agents-section-title">My Agents</h3>
        {filteredMyAgents.length === 0 ? (
          <Empty
            description="No agents assigned"
            className="my-agents-empty-state"
          />
        ) : (
          <div className="my-agents-list">
            {filteredMyAgents.map(renderAgentCard)}
          </div>
        )}

        {/* Available Agents */}
        <div className="my-agents-section-header">
          <h3 className="my-agents-section-title">Available Agents</h3>
          <ArrowRightOutlined
            className="my-agents-forward-arrow"
            onClick={() => navigate("/business-owner/add-agent")}
          />
        </div>

        {filteredAvailableAgents.length === 0 ? (
          <Empty
            description="No available agents"
            className="my-agents-empty-state"
          />
        ) : (
          <div className="my-agents-list">
            {filteredAvailableAgents.map(renderAgentCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgents;
