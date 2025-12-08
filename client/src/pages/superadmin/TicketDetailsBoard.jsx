import React, { useEffect, useState } from "react";
import { Card, Tag, message, Spin, Descriptions, Typography, Divider } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  FileTextOutlined,
  UserOutlined,
  FileImageOutlined
} from "@ant-design/icons";
import { BiDetail } from "react-icons/bi";
import axios from "axios";
import { useParams } from "react-router-dom";
import UserHoverCard from "../profile/UserHoverCard";

const { Title, Paragraph } = Typography;

/**
 * Returns a tag color based on ticket status.
 *
 * @function getStatusColor
 * @param {string} status - Current ticket status (New, In Progress, Resolved, Closed).
 * @returns {string} Ant Design color keyword.
 */


const getStatusColor = (status) => {
  switch (status) {
    case "New":
      return "blue";
    case "In Progress":
      return "orange";
    case "Resolved":
      return "green";
    case "Closed":
      return "gray";
    default:
      return "default";
  }
};

/**
 * Returns a color badge based on ticket priority.
 *
 * @function getPriorityColor
 * @param {string} priority - Ticket urgency level (High, Medium, Low).
 * @returns {string} Ant Design color keyword.
 */


const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "red";
    case "Medium":
      return "gold";
    case "Low":
      return "green";
    default:
      return "blue";
  }
};

/**
 * Displays complete details of a selected support ticket.
 *
 * Features:
 * - Shows ticket info: ID, category, priority, status, description, SLA, timestamps.
 * - Displays creator info using hover user card (`UserHoverCard`).
 * - Renders messages, attachments, and metadata if available.
 * - Fetches ticket details from backend using `id` from URL params.
 *
 * @component
 * @returns {JSX.Element} The ticket detail view UI.
 */


const TicketDetailsBoard = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

    /**
   * Fetches the ticket details from backend based on the ID from URL parameters.
   * Runs on component mount and when the ticket ID changes.
   *
   * @effect
   * @async
   */


  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/tickets/${id}`);
        setTicket(res.data);
      } catch (err) {
        console.error(err);
        message.error("Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <Spin spinning />;
  if (!ticket) return <p>No ticket found</p>;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={4} style={{ margin: 0 }}>
          {ticket.ticketId}
        </Title>
        <Tag color={getStatusColor(ticket.status)} style={{ fontSize: "0.9rem", padding: "4px 10px" }}>
          {ticket.status}
        </Tag>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <Descriptions bordered column={1} size="middle">

        {/* CATEGORY */}
        <Descriptions.Item label={<><FileTextOutlined /> Category</>}>
          {ticket.category}
        </Descriptions.Item>

        {/* PRIORITY */}
        <Descriptions.Item label={<><AlertOutlined /> Priority</>}>
          <Tag color={getPriorityColor(ticket.priority)}>{ticket.priority}</Tag>
        </Descriptions.Item>

        {/* CREATED BY (HOVER CARD) */}
        <Descriptions.Item label={<><UserOutlined /> Created By</>}>
          <UserHoverCard 
            user={{ 
              ...ticket.createdBy,
              uid: ticket.createdBy.userId
            }}
            placement="right"
          />
        </Descriptions.Item>

        {/* CREATED AT */}
        <Descriptions.Item label={<><CalendarOutlined /> Created At</>}>
          {new Date(ticket.createdAt).toLocaleString("en-IN")}
        </Descriptions.Item>

        {/* UPDATED AT — SHOW ONLY IF != CREATED */}
        {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
          <Descriptions.Item label="Last Updated">
            {new Date(ticket.updatedAt).toLocaleString("en-IN")}
          </Descriptions.Item>
        )}

        {/* SLA (OPTIONAL) */}
        {ticket.sla && (
          <Descriptions.Item label={<><ClockCircleOutlined /> SLA Deadline</>}>
            {new Date(ticket.sla).toLocaleDateString("en-IN")}
          </Descriptions.Item>
        )}

        {/* ATTACHMENTS (OPTIONAL) */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <Descriptions.Item label={<><FileImageOutlined /> Attachments</>}>
            {ticket.attachments.map((file, i) => (
              <Tag key={i} color="blue" style={{ marginBottom: 5 }}>{file}</Tag>
            ))}
          </Descriptions.Item>
        )}

        {/* DESCRIPTION */}
        <Descriptions.Item label={<><BiDetail/> Description</>}>
          <Paragraph style={{ marginBottom: 0 }}>
            {ticket.description || "No description provided"}
          </Paragraph>
        </Descriptions.Item>

        /**
         * Renders conversation messages within the ticket (optional).
         * Each message shows:
         * - Sender role and ID
         * - Message text
         * - Timestamp in localized format
         */


        {/* MESSAGES (OPTIONAL) */}
        {ticket.messages && ticket.messages.length > 0 && (
          <Descriptions.Item label="Messages">
            {ticket.messages.map((msg, index) => (
              <Card 
                key={index} 
                size="small" 
                style={{ marginBottom: 10, background: "#fafafa" }}
              >
                <div style={{ fontWeight: 600 }}>
                  {msg.senderRole} ({msg.senderId})
                </div>
                <div style={{ marginTop: 5 }}>{msg.message}</div>
                <small style={{ color: "#888" }}>
                  {new Date(msg.timestamp).toLocaleString("en-IN")}
                </small>
              </Card>
            ))}
          </Descriptions.Item>
        )}

      </Descriptions>

    </div>
  );
};

export default TicketDetailsBoard;
