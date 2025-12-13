import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Empty,
  Spin,
  message,
  Modal,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  ArrowLeftOutlined,
  StarFilled,
  SendOutlined,
} from "@ant-design/icons";
import agentService from "../../services/myAgentService";

const AddAgent = ({ onBack }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviting, setInviting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [commissionAmount, setCommissionAmount] = useState(0);

  useEffect(() => {
    fetchAvailableAgents();
  }, []);

  const fetchAvailableAgents = async () => {
    try {
      setLoading(true);
      const data = await agentService.getAvailableAgents();
      setAgents(data.agents || []);
    } catch (error) {
      console.error("Fetch agents error:", error);
      message.error("Failed to load available agents");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = (agent) => {
    setSelectedAgent(agent);
    setCommissionAmount(agent.commissionRate);
  };

  const handleSendInvite = async (values) => {
    try {
      setInviting(true);
      await agentService.inviteAgent({
        agentId: selectedAgent._id,
        agreedCommission: values.agreedCommission,
        permissions: {
          canUploadDocuments: true,
          canSubmitApplications: true,
          canViewDashboard: true,
          canReceiveUpdates: true,
        },
      });

      message.success("Invitation sent successfully!");
      setSelectedAgent(null);
      setCommissionAmount(0);
      if (onBack) onBack();
    } catch (error) {
      console.error("Invite error:", error);
      message.error(
        error.response?.data?.message || "Failed to send invitation"
      );
    } finally {
      setInviting(false);
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ marginBottom: 12 }}
        >
          Back
        </Button>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Add Agent
        </h2>
        <p style={{ color: "#888", fontSize: 14 }}>
          Browse and invite agents to manage your business
        </p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search agents by name"
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16 }}
        size="large"
      />

      {/* Agent List */}
      {filteredAgents.length === 0 ? (
        <Empty
          description="No agents available"
          style={{ padding: "60px 20px" }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredAgents.map((agent) => (
            <Card
              key={agent._id}
              hoverable
              style={{ borderRadius: 12 }}
              styles={{ body: { padding: 16 } }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      {agent.name}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <span>{agent.rating?.toFixed(1) || "0.0"}</span>
                      <StarFilled style={{ color: "#faad14" }} />
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                    {agent.experience || 0}+ years exp • Managing{" "}
                    {agent.businessesManaged || 0}+ businesses
                  </div>

                  {agent.city && (
                    <div
                      style={{ fontSize: 12, color: "#999", marginBottom: 8 }}
                    >
                      📍 {agent.city}
                      {agent.state && `, ${agent.state}`}
                    </div>
                  )}

                  {agent.specialization && agent.specialization.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 8,
                      }}
                    >
                      {agent.specialization.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            background: "#f0f0f0",
                            borderRadius: 12,
                            color: "#666",
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#ff6b35",
                      }}
                    >
                      ₹{agent.commissionRate}/month
                    </span>
                    <Button
                      type="primary"
                      size="small"
                      icon={<SendOutlined />}
                      onClick={() => handleInvite(agent)}
                    >
                      Invite
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        title="Send Invitation"
        open={!!selectedAgent}
        onCancel={() => {
          setSelectedAgent(null);
          setCommissionAmount(0);
        }}
        footer={null}
      >
        {selectedAgent && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
                padding: 12,
                background: "#f5f5f5",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#ff6b35",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {selectedAgent.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{selectedAgent.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {selectedAgent.rating?.toFixed(1)} ⭐ •{" "}
                  {selectedAgent.businessesManaged}+ businesses
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{ fontWeight: 500, marginBottom: 8, display: "block" }}
              >
                Agreed Commission (per month)
              </label>
              <InputNumber
                prefix="₹"
                style={{ width: "100%" }}
                size="large"
                placeholder="Enter amount"
                value={commissionAmount}
                onChange={(val) => setCommissionAmount(val)}
                min={0}
              />
            </div>

            <div
              style={{
                background: "#f9f9f9",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                color: "#666",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Default Permissions:
              </div>
              <div>✓ Upload documents</div>
              <div>✓ Submit applications</div>
              <div>✓ View dashboard</div>
              <div>✓ Receive updates</div>
            </div>

            <Button
              type="primary"
              loading={inviting}
              block
              size="large"
              onClick={() => {
                if (!commissionAmount || commissionAmount <= 0) {
                  message.error("Enter valid commission amount");
                  return;
                }
                handleSendInvite({ agreedCommission: commissionAmount });
              }}
            >
              Send Invitation
            </Button>
          </div>
          //   </div>
        )}
      </Modal>
    </div>
  );
};

export default AddAgent;
