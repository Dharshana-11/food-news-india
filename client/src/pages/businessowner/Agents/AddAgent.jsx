/**
 * AddAgent.jsx
 * ============================================================================
 * Business Owner page to browse, invite, and manage agents.
 *
 * Responsibilities:
 * - Fetch available agents
 * - Search and display agents
 * - Send / cancel invitations
 * - Handle invite confirmation modal
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Empty,
  Spin,
  message,
  Modal,
  InputNumber,
  Checkbox,
} from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  StarFilled,
  SendOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import agentService from "../../../services/myAgentService";
import "./AddAgent.css";

const AddAgent = ({ onBack }) => {
  /* =========================================================================
     State
     ========================================================================= */
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviting, setInviting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [inviteError, setInviteError] = useState("");
  const [agreePermissions, setAgreePermissions] = useState(false);

  const navigate = useNavigate();
  const { confirm } = Modal;

  /* =========================================================================
     Effects
     ========================================================================= */
  useEffect(() => {
    fetchAvailableAgents();
  }, []);

  /* =========================================================================
     API Calls
     ========================================================================= */
  const fetchAvailableAgents = async () => {
    try {
      setLoading(true);
      const response = await agentService.getAvailableAgents();
      setAgents(response.agents || []);
    } catch (error) {
      console.error("Fetch agents error:", error);
      message.error("Failed to load available agents");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     Invite Flow
     ========================================================================= */
  const handleInvite = (agent) => {
    setSelectedAgent(agent);
    setCommissionAmount(agent.monthlyCommission);
    setInviteError("");
    setAgreePermissions(false);
  };

  const handleSendInvite = async () => {
    if (!selectedAgent) return;

    try {
      setInviting(true);

      await agentService.inviteAgent({
        agentId: selectedAgent._id,
        permissions: {
          canUploadDocuments: true,
          canSubmitApplications: true,
          canViewDashboard: true,
          canReceiveUpdates: true,
        },
      });

      message.success("Invitation sent successfully");
      resetInviteState();
      fetchAvailableAgents();

      if (onBack) onBack();
    } catch (error) {
      console.error("Invite error:", error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send invitation";

      message.error(backendMessage);
      setInviteError(backendMessage);
    } finally {
      setInviting(false);
    }
  };

  const cancelInvite = (relationId) => {
    confirm({
      title: "Cancel Invitation?",
      content: "Are you sure you want to cancel this invitation?",
      okText: "Yes, cancel",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await agentService.removeAgent(relationId, "Invitation cancelled");
          message.success("Invitation cancelled");
          fetchAvailableAgents();
        } catch (error) {
          console.error("Cancel invite error:", error);
          message.error("Failed to cancel invitation");
        }
      },
    });
  };

  const resetInviteState = () => {
    setSelectedAgent(null);
    setCommissionAmount(0);
    setInviteError("");
    setAgreePermissions(false);
  };

  /* =========================================================================
     Helpers
     ========================================================================= */
  const filteredAgents = agents.filter((agent) =>
    agent.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* =========================================================================
     Loading State
     ========================================================================= */
  if (loading) {
    return (
      <div className="add-agent-loading">
        <Spin size="large" />
      </div>
    );
  }

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <div className="add-agent-container">
      {/* Header */}
      <div className="add-agent-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => (onBack ? onBack() : navigate(-1))}
        />
        <h2>Add Agent</h2>
        <p>Browse and invite agents to manage your business</p>
      </div>

      {/* Search */}
      <Input
        className="add-agent-search"
        placeholder="Search agents by name"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="large"
      />

      {/* Agent List */}
      {filteredAgents.length === 0 ? (
        <Empty description="No agents available" className="add-agent-empty" />
      ) : (
        <div className="agent-list">
          {filteredAgents.map((agent) => {
            const isActive = agent.inviteStatus === "active";
            const isPending = agent.inviteStatus === "pending";

            return (
              <Card
                key={agent._id}
                hoverable={!isActive}
                className={`agent-card ${isActive ? "disabled" : ""}`}
              >
                <div className="agent-card-body">
                  {/* Header */}
                  <div className="agent-avatar-section">
                    <div
                      className={`agent-avatar ${isActive ? "disabled" : ""}`}
                    >
                      {agent.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="agent-info">
                      <div className="agent-name-rating">
                        <span>{agent.name}</span>
                        <div className="agent-rating-badge">
                          <span>{agent.rating?.toFixed(1) || "0.0"}</span>
                          <StarFilled style={{ color: "#faad14" }} />
                          <span>({agent.totalReviews || 0})</span>
                        </div>
                      </div>

                      <div className="agent-exp-businesses">
                        {agent.experience || 0}+ years exp • Managing{" "}
                        {agent.businessesManaged || 0}+ businesses
                      </div>

                      {agent.city && (
                        <div className="agent-city-state">
                          <EnvironmentOutlined /> {agent.city}
                          {agent.state && `, ${agent.state}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio & Phone */}
                  {(agent.bio || agent.phone) && (
                    <div className="agent-details-section">
                      {agent.bio && (
                        <div className="agent-bio">{agent.bio}</div>
                      )}
                      {agent.phone && (
                        <div className="agent-phone">
                          <PhoneOutlined /> {agent.phone}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specialization */}
                  {agent.specialization?.length > 0 && (
                    <div className="agent-specialization">
                      {agent.specialization.map((spec) => (
                        <span key={spec}>{spec}</span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="agent-footer">
                    <span className="agent-commission">
                      ₹{agent.monthlyCommission}
                    </span>

                    <div className="add-agent-footer-actions">
                      <Button
                        type="primary"
                        size="small"
                        icon={<SendOutlined />}
                        onClick={() => handleInvite(agent)}
                        disabled={isPending}
                      >
                        {isActive ? "Active" : isPending ? "Pending" : "Invite"}
                      </Button>

                      {isPending && (
                        <Button
                          size="small"
                          danger
                          onClick={() => cancelInvite(agent.relationId)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        title="Send Invitation"
        open={!!selectedAgent}
        onCancel={resetInviteState}
        footer={null}
      >
        {selectedAgent && (
          <div>
            <div className="invite-modal-header">
              <div className="invite-modal-avatar">
                {selectedAgent.name?.charAt(0).toUpperCase()}
              </div>
              <div className="invite-modal-info">
                <div>{selectedAgent.name}</div>
                <div>
                  {selectedAgent.rating?.toFixed(1)}{" "}
                  <StarFilled style={{ color: "#faad14" }} /> •{" "}
                  {selectedAgent.totalReviews || 0} reviews
                </div>
                {selectedAgent.city && (
                  <div>
                    <EnvironmentOutlined /> {selectedAgent.city}
                    {selectedAgent.state && `, ${selectedAgent.state}`}
                  </div>
                )}
              </div>
            </div>

            {selectedAgent.bio && (
              <div className="invite-modal-bio">{selectedAgent.bio}</div>
            )}

            <div className="invite-modal-commission">
              <label>Agreed Commission (per month)</label>
              <InputNumber
                prefix="₹"
                size="large"
                value={commissionAmount}
                disabled
                style={{ width: "100%" }}
              />
              <small>
                Commission is fixed by the agent and cannot be changed
              </small>
            </div>

            <div className="invite-modal-permissions">
              <div>Permissions Granted</div>

              <Checkbox checked disabled>
                Upload documents
              </Checkbox>
              <Checkbox checked disabled>
                Submit applications
              </Checkbox>
              <Checkbox checked disabled>
                View dashboard
              </Checkbox>
              <Checkbox checked disabled>
                Receive updates
              </Checkbox>

              <Checkbox
                checked={agreePermissions}
                onChange={(e) => setAgreePermissions(e.target.checked)}
              >
                I understand and agree to grant these permissions
              </Checkbox>
            </div>

            {inviteError && (
              <div className="invite-error-message">{inviteError}</div>
            )}

            <Button
              type="primary"
              block
              size="large"
              loading={inviting}
              disabled={!agreePermissions}
              onClick={handleSendInvite}
              className="invite-submit-button"
            >
              Send Invitation
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AddAgent;
