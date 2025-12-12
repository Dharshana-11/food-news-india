import React, { useEffect, useState } from "react";
import { Tag, message, Spin, Button, Modal } from "antd";
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateTicketModal from "./CreateTicketModal";
import "../../styles/global.css";

/**
 * Ordered list of status columns for the ticket board UI.
 * @constant {string[]}
 */
const STATUS_COLUMNS = ["New", "In Progress", "Resolved", "Closed"];

/**
 * Returns a color value representing the given ticket priority.
 *
 * @function getPriorityColor
 * @param {string} priority - Priority value of the ticket ("High", "Medium", "Low").
 * @returns {string} Hex or Ant color string used by UI.
 */
const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "#ff4d4f";
    case "Medium":
      return "#faad14";
    case "Low":
      return "#52c41a";
    default:
      return "#1677ff";
  }
};

/**
 * 📌 Displays a Kanban-style drag-and-drop ticket board.
 *
 * Features:
 * - Fetches and groups tickets by status
 * - Allows drag & drop status updates with confirmation
 * - Opens modal to create new ticket
 * - Redirects to individual ticket view on card click
 *
 * @component
 * @returns {JSX.Element} Ticket board UI with draggable columns.
 */
const TicketBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetches the ticket list from the backend.
   * Ensures result is always an array, even if backend structure changes.
   *
   * @async
   * @function fetchTickets
   * @returns {Promise<void>}
   */
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/tickets");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : [];

      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      message.error("Failed to load tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load tickets on mount.
   * @effect
   */
  useEffect(() => {
    fetchTickets();
  }, []);

  /**
   * Groups tickets by status for column rendering.
   *
   * @constant
   * @type {Record<string, Array>}
   */
  const groupedTickets = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = tickets.filter((t) => t.status === status);
    return acc;
  }, {});

  /**
   * Handles drag & drop movement and confirms before updating ticket status in backend.
   *
   * @async
   * @function handleDragEnd
   * @param {object} result - DnD event result containing source and destination.
   */
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const from = source.droppableId;
    const to = destination.droppableId;
    if (from === to) return;

    const movedTicket = tickets.find((t) => t._id === draggableId);
    if (!movedTicket) return;

    Modal.confirm({
      title: "Confirm Status Change",
      content: `Are you sure you want to move ticket ${movedTicket.ticketId} from "${from}" to "${to}"?`,
      okText: "Yes, Move",
      cancelText: "Cancel",

      async onOk() {
        try {
          await axios.patch(
            `http://localhost:5000/api/tickets/${movedTicket._id}`,
            { status: to }
          );
          message.success(`Ticket moved to ${to}`);
          fetchTickets();
        } catch (err) {
          console.error("Status update failed:", err);
          message.error("Failed to update ticket status");
        }
      },
    });
  };

  /**
   * Renders a draggable ticket card.
   *
   * @function renderCard
   * @param {object} ticket - Ticket data object.
   * @param {number} index - Index within column.
   * @returns {JSX.Element} Draggable ticket card component.
   */
  const renderCard = (ticket, index) => (
    <Draggable draggableId={ticket._id} index={index} key={ticket._id}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="ticket-card"
          style={provided.draggableProps.style}
          onClick={() => navigate(`/tickets/${ticket._id}`)}
        >
          <div className="ticket-header">
            <span className="ticket-id">{ticket.ticketId}</span>
            <Tag className="ticket-status-tag">{ticket.status}</Tag>
          </div>

          <div className="ticket-body">
            <div className="ticket-row">
              <FileTextOutlined className="ticket-icon" />
              <span className="ticket-category">{ticket.category}</span>
            </div>

            <div className="ticket-meta">
              <div className="meta-left">
                <UserOutlined /> <span>{ticket.createdBy?.name || "User"}</span>
              </div>
              <div className="meta-right">
                <CalendarOutlined />{" "}
                <span>
                  {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            <div className="ticket-footer">
              <div className="meta-left">
                <AlertOutlined
                  style={{
                    color: getPriorityColor(ticket.priority),
                    marginRight: 5,
                  }}
                />
                <span>{ticket.priority} Priority</span>
              </div>
              {ticket.sla && (
                <div className="meta-right">
                  <ClockCircleOutlined />{" "}
                  <span>
                    SLA: {new Date(ticket.sla).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <Spin spinning={loading}>
      {/* Header */}
      <div className="ticket-header-bar">
        <h2 className="ticket-header-title">Tickets</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: "#162247", color: "#fff", border: "none" }}
        >
          Raise Ticket
        </Button>
      </div>

      {/* Ticket board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="ticket-board-container">
          {STATUS_COLUMNS.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="ticket-column"
                >
                  <h3>{status}</h3>

                  {groupedTickets[status]?.length ? (
                    groupedTickets[status].map(renderCard)
                  ) : (
                    <p className="ticket-empty">No tickets</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Ticket Create Modal */}
      <CreateTicketModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchTickets();
        }}
      />
    </Spin>
  );
};

export default TicketBoard;
