/**
 * @file TicketDetails.jsx
 * @description Component for displaying and editing ticket details in a drawer
 * @module pages/superadmin/TicketDetails
 * @requires react
 * @requires antd
 * @requires axios
 * 
 * @example
 * // Basic usage
 * <TicketDetails 
 *   ticket={ticketData} 
 *   onClose={handleClose} 
 *   refresh={refreshTickets} 
 * />
 */

import React, { useState } from "react";
import { Drawer, Tag, Select, message } from "antd";
import axios from "axios";

/**
 * TicketDetails Component
 * 
 * @description
 * Displays detailed information about a ticket in a drawer and allows editing
 * the ticket's status and priority.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.ticket - The ticket object containing ticket details
 * @param {string} props.ticket._id - Unique identifier for the ticket
 * @param {string} props.ticket.ticketId - Display ID of the ticket
 * @param {string} props.ticket.status - Current status of the ticket
 * @param {string} props.ticket.priority - Priority level of the ticket
 * @param {string} props.ticket.category - Category of the ticket
 * @param {string} props.ticket.description - Detailed description of the ticket
 * @param {Function} props.onClose - Callback function when the drawer is closed
 * @param {Function} props.refresh - Callback function to refresh the ticket list
 * @returns {JSX.Element} A drawer component with ticket details and edit options
 */
const TicketDetails = ({ ticket, onClose, refresh }) => {
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);

  /**
   * Updates the ticket with the current status and priority values
   * @async
   * @function updateTicket
   * @returns {Promise<void>}
   * @throws {Error} If the update fails
   */
  const updateTicket = async () => {
    await axios.patch(`/api/tickets/${ticket._id}`, { status, priority });
    message.success("Ticket updated successfully");
    refresh();
  };

  return (
    <Drawer
      title={`Ticket ${ticket.ticketId}`}
      open
      onClose={onClose}
      width={500}
      extra={<Tag color="blue">{ticket.status}</Tag>}
    >
      <p><strong>Category:</strong> {ticket.category}</p>
      <p><strong>Description:</strong> {ticket.description}</p>
      <div className="flex gap-4 mt-4">
        <Select 
          value={status} 
          onChange={setStatus}
          style={{ width: 150 }}
          placeholder="Select status"
        >
          <Select.Option value="New">New</Select.Option>
          <Select.Option value="In Progress">In Progress</Select.Option>
          <Select.Option value="Resolved">Resolved</Select.Option>
          <Select.Option value="Closed">Closed</Select.Option>
        </Select>
        <Select 
          value={priority} 
          onChange={setPriority}
          style={{ width: 150 }}
          placeholder="Select priority"
        >
          <Select.Option value="Low">Low</Select.Option>
          <Select.Option value="Medium">Medium</Select.Option>
          <Select.Option value="High">High</Select.Option>
        </Select>
        <button className="btn btn-primary" onClick={updateTicket}>Save</button>
      </div>
    </Drawer>
  );
};

export default TicketDetails;
