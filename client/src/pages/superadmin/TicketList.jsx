import React, { useEffect, useState } from "react";
import { Table, Button, Input, Tag, Modal, message } from "antd";
import axios from "axios";
import CreateTicketModal from "./CreateTicketModal";
import TicketDetails from "./TicketDetails";

/**
 * Displays a list of support tickets in a table view.
 *
 * Features:
 * - Fetches all tickets from backend
 * - Allows viewing details of a ticket
 * - Allows creating a new ticket
 * - Allows deleting/archiving a ticket
 *
 * @component
 * @returns {JSX.Element} Ticket listing UI with table, search input, and modals.
 */

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

    /**
   * Fetches all available tickets from the backend.
   * Ensures the backend response is an array before setting state.
   *
   * @async
   * @function fetchTickets
   * @returns {Promise<void>}
   */

  const fetchTickets = async () => {
  setLoading(true);
  try {
    const res = await axios.get("http://localhost:5000/api/tickets");
    setTickets(Array.isArray(res.data) ? res.data : []); // ✅ ensure array
  } catch (error) {
    console.error("Error fetching tickets:", error);
    setTickets([]); // fallback
  } finally {
    setLoading(false);
  }
};

/**
   * Deletes (archives) a ticket from the backend using its ID.
   * Refreshes the ticket list after deletion.
   *
   * @async
   * @function deleteTicket
   * @param {string} id - MongoDB `_id` of the ticket to delete.
   * @returns {Promise<void>}
   */

  const deleteTicket = async (id) => {
    await axios.delete(`http://localhost:5000/api/tickets/${id}`);
    message.success("Ticket archived");
    fetchTickets();
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  /**
   * Table column definitions for Ant Design Table.
   * Each column maps to a ticket property (ticketId, category, priority, etc.)
   * Includes action buttons for viewing and deleting tickets.
   *
   * @constant
   * @type {Array<Object>}
   */

  const columns = [
    { title: "Ticket ID", dataIndex: "ticketId" },
    { title: "Category", dataIndex: "category" },
    { title: "Priority", dataIndex: "priority" },
    { title: "Status", dataIndex: "status", render: (s) => <Tag>{s}</Tag> },
    { title: "Created At", dataIndex: "createdAt" },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button onClick={() => setSelectedTicket(record)}>View</Button>
          <Button danger onClick={() => deleteTicket(record._id)} style={{ marginLeft: 8 }}>Delete</Button>
        </>
      )
    }
  ];

  return (
    <>
      <div className="flex justify-between mb-3">
        <Input.Search placeholder="Search tickets..." style={{ width: 250 }} />
        <Button type="primary" onClick={() => setShowCreateModal(true)}>+ New Ticket</Button>
      </div>

      <Table
        columns={columns}
        dataSource={tickets}
        rowKey="_id"
        loading={loading}
      />

      {showCreateModal && (
        <CreateTicketModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} refresh={fetchTickets} />
      )}

      {selectedTicket && (
        <TicketDetails ticket={selectedTicket} onClose={() => setSelectedTicket(null)} refresh={fetchTickets} />
      )}
    </>
  );
};

export default TicketList;
