/**
 * MyRequests.jsx
 * ============================================================================
 * Agent page to view and manage pending business owner invitations
 *
 * Responsibilities:
 * - Display pending invites
 * - Accept/reject invitations
 * - View business details
 * - Optimistic UI updates
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Empty,
  Spin,
  message,
  Modal,
  Input,
  Tag,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import agentInviteService from "../../services/agentInviteService";
import "./MyRequests.css";

const { TextArea } = Input;
const { confirm } = Modal;

const MyRequests = () => {
  /* =========================================================================
     State
     ========================================================================= */
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [detailsModal, setDetailsModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const navigate = useNavigate();

  /* =========================================================================
     Effects
     ========================================================================= */
  useEffect(() => {
    fetchInvites();
  }, []);

  /* =========================================================================
     API Calls
     ========================================================================= */
  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await agentInviteService.getMyInvites();
      setInvites(response.invites || []);
    } catch (error) {
      console.error("Fetch invites error:", error);
      message.error(error.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     Accept Invite
     ========================================================================= */
  const handleAccept = (invite) => {
    confirm({
      title: "Accept Invitation?",
      content: `Do you want to accept the invitation from ${invite.businessOwnerId?.name || "this business"}?`,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      okText: "Accept",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setActionLoading(invite._id);

          await agentInviteService.acceptInvite(invite._id);

          message.success("Invitation accepted successfully");

          // Optimistic UI update
          setInvites((prev) => prev.filter((inv) => inv._id !== invite._id));
        } catch (error) {
          console.error("Accept invite error:", error);
          message.error(error.message || "Failed to accept invitation");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  /* =========================================================================
     Reject Invite
     ========================================================================= */
  const handleReject = (invite) => {
    setRejectModal(invite);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectModal) return;

    try {
      setActionLoading(rejectModal._id);

      await agentInviteService.rejectInvite(rejectModal._id, rejectReason);

      message.success("Invitation rejected");

      // Optimistic UI update
      setInvites((prev) => prev.filter((inv) => inv._id !== rejectModal._id));

      setRejectModal(null);
      setRejectReason("");
    } catch (error) {
      console.error("Reject invite error:", error);
      message.error(error.message || "Failed to reject invitation");
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================================
     Details Modal
     ========================================================================= */
  const handleViewDetails = (invite) => {
    setDetailsModal(invite);
  };

  /* =========================================================================
     Helpers
     ========================================================================= */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <div className="my-requests-container">
      {/* Header */}
      <div className="my-requests-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <h2>My Requests</h2>
        <p>Manage your business invitations</p>
      </div>

      {/* Invites List */}
      {invites.length === 0 ? (
        <Empty
          description="No pending invitations"
          className="my-requests-empty"
        />
      ) : (
        <div className="invites-list">
          {invites.map((invite) => {
            const businessOwner = invite.businessOwnerId || {};
            const businessDetails = invite.businessDetails || {};
            const isActionLoading = actionLoading === invite._id;

            return (
              <Card key={invite._id} className="invite-card" hoverable>
                <div className="invite-card-body">
                  {/* Header */}
                  <div className="invite-header">
                    <div className="invite-avatar">
                      {businessDetails.businessName?.charAt(0).toUpperCase() ||
                        businessOwner.name?.charAt(0).toUpperCase() ||
                        "B"}
                    </div>

                    <div className="invite-info">
                      <div className="invite-business-name">
                        {businessDetails.businessName || "N/A"}
                      </div>
                      <div className="invite-owner-name">
                        Owner: {businessOwner.name || "N/A"}
                      </div>
                    </div>

                    <Tag color="orange" className="invite-status-tag">
                      Pending
                    </Tag>
                  </div>

                  {/* Details */}
                  <div className="invite-details">
                    {businessDetails.registeredAddress && (
                      <div className="invite-detail-item">
                        <EnvironmentOutlined />
                        <span>{businessDetails.registeredAddress}</span>
                      </div>
                    )}

                    {businessOwner.city && (
                      <div className="invite-detail-item">
                        <EnvironmentOutlined />
                        <span>
                          {businessOwner.city}
                          {businessOwner.state && `, ${businessOwner.state}`}
                        </span>
                      </div>
                    )}

                    <div className="invite-detail-item">
                      <CalendarOutlined />
                      <span>Sent on {formatDate(invite.invitedAt)}</span>
                    </div>

                    {invite.agreedCommission > 0 && (
                      <div className="invite-detail-item">
                        <DollarOutlined />
                        <span>₹{invite.agreedCommission}/month</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="invite-actions">
                    <Button
                      size="small"
                      icon={<InfoCircleOutlined />}
                      onClick={() => handleViewDetails(invite)}
                    >
                      Details
                    </Button>

                    <div className="invite-actions-right">
                      <Button
                        size="small"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleReject(invite)}
                        loading={isActionLoading}
                        disabled={isActionLoading}
                      >
                        Reject
                      </Button>

                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleAccept(invite)}
                        loading={isActionLoading}
                        disabled={isActionLoading}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <Modal
        title="Invitation Details"
        open={!!detailsModal}
        onCancel={() => setDetailsModal(null)}
        footer={[
          <Button key="close" onClick={() => setDetailsModal(null)}>
            Close
          </Button>,
        ]}
      >
        {detailsModal && (
          <div className="details-modal-content">
            <div className="details-section">
              <h4>Business Information</h4>
              <p>
                <strong>Business Name:</strong>{" "}
                {detailsModal.businessDetails?.businessName || "N/A"}
              </p>
              <p>
                <strong>Owner:</strong>{" "}
                {detailsModal.businessOwnerId?.name || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {detailsModal.businessOwnerId?.phone || "N/A"}
              </p>
            </div>

            <Divider />

            <div className="details-section">
              <h4>Location</h4>
              <p>
                <strong>Address:</strong>{" "}
                {detailsModal.businessDetails?.registeredAddress || "N/A"}
              </p>
              {detailsModal.businessOwnerId?.city && (
                <p>
                  <strong>City:</strong> {detailsModal.businessOwnerId.city}
                  {detailsModal.businessOwnerId?.state &&
                    `, ${detailsModal.businessOwnerId.state}`}
                </p>
              )}
            </div>

            <Divider />

            <div className="details-section">
              <h4>Commission & Permissions</h4>
              <p>
                <strong>Commission:</strong> ₹{detailsModal.agreedCommission}
                /month ({detailsModal.paymentFrequency || "monthly"})
              </p>

              <div className="details-permissions">
                <strong>Permissions:</strong>
                <ul>
                  {detailsModal.permissions?.canUploadDocuments && (
                    <li>Upload documents</li>
                  )}
                  {detailsModal.permissions?.canSubmitApplications && (
                    <li>Submit applications</li>
                  )}
                  {detailsModal.permissions?.canViewDashboard && (
                    <li>View dashboard</li>
                  )}
                  {detailsModal.permissions?.canReceiveUpdates && (
                    <li>Receive updates</li>
                  )}
                </ul>
              </div>
            </div>

            <Divider />

            <div className="details-section">
              <h4>Invitation Info</h4>
              <p>
                <strong>Sent on:</strong> {formatDate(detailsModal.invitedAt)}
              </p>
              <p>
                <strong>Expires on:</strong>{" "}
                {formatDate(detailsModal.pendingExpiresAt)}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Invitation"
        open={!!rejectModal}
        onCancel={() => {
          setRejectModal(null);
          setRejectReason("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setRejectModal(null);
              setRejectReason("");
            }}
          >
            Cancel
          </Button>,
          <Button
            key="reject"
            type="primary"
            danger
            onClick={confirmReject}
            loading={!!actionLoading}
          >
            Reject
          </Button>,
        ]}
      >
        {rejectModal && (
          <div className="reject-modal-content">
            <p>
              Are you sure you want to reject the invitation from{" "}
              <strong>
                {rejectModal.businessDetails?.businessName || "this business"}
              </strong>
              ?
            </p>

            <TextArea
              rows={4}
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={500}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyRequests;
