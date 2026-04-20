/**
 * @file dashboardController.js
 * @description Super Admin Dashboard — aggregated statistics endpoints.
 *
 * Routes mounted at:  GET /api/admin/dashboard/*
 *
 * Endpoints
 * ─────────
 *  GET /stats           → user-role counts + open ticket count
 *  GET /compliance      → document status breakdown (compliant / pending / non-compliant)
 *  GET /activity        → real login sessions + tickets created per day (last 7 days)
 *  GET /verifications   → pending KYC document submissions per user
 *  GET /services        → service APPROVAL summary (pending / approved / rejected counts)
 *  GET /tickets         → ticket breakdown by status
 *  GET /notifications   → latest 6 notification log entries shaped for the UI widget
 */

import User from "../models/User.js";
import Document from "../models/Document.js";
import Ticket from "../models/Ticket.js";
import NotificationLog from "../models/NotificationLog.js";
import ServiceProviderService from "../models/ServiceProviderService.js";
import UserSession from "../models/UserSession.js";
import ROLES from "../utils/constants/roles.js";

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toDateKey = (date) => date.toISOString().slice(0, 10);

const relativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

/* ─────────────────────────────────────────────────────────
   1. STATS  →  GET /api/admin/dashboard/stats
───────────────────────────────────────────────────────── */

export const getDashboardStats = async (req, res) => {
  try {
    const [roleCounts, openTickets] = await Promise.all([
      User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Ticket.countDocuments({
        isDeleted: false,
        status: { $in: ["New", "open"] },
      }),
    ]);

    const byRole = Object.fromEntries(roleCounts.map((r) => [r._id, r.count]));

    return res.status(200).json({
      success: true,
      data: {
        totalBusinesses: byRole[ROLES.BUSINESS_OWNER] || 0,
        agents: byRole[ROLES.AGENT] || 0,
        serviceProviders: byRole[ROLES.SERVICE_PROVIDER] || 0,
        openTickets,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ─────────────────────────────────────────────────────────
   2. COMPLIANCE  →  GET /api/admin/dashboard/compliance
───────────────────────────────────────────────────────── */

export const getComplianceOverview = async (req, res) => {
  try {
    const now = new Date();

    const [compliant, pending, nonCompliant] = await Promise.all([
      Document.countDocuments({
        complianceItemId: { $ne: null },
        status: "approved",
        $or: [{ validUntil: null }, { validUntil: { $gt: now } }],
      }),
      Document.countDocuments({
        complianceItemId: { $ne: null },
        status: "pending",
      }),
      Document.countDocuments({
        complianceItemId: { $ne: null },
        $or: [{ status: "rejected" }, { status: "expired" }],
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: [
        { name: "Compliant", value: compliant },
        { name: "Pending Review", value: pending },
        { name: "Non-Compliant", value: nonCompliant },
      ],
    });
  } catch (err) {
    console.error("getComplianceOverview error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ─────────────────────────────────────────────────────────
   3. ACTIVITY  →  GET /api/admin/dashboard/activity
───────────────────────────────────────────────────────── */

export const getActivityData = async (req, res) => {
  try {
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const windowStart = daysAgo(6);
    const windowEnd = new Date();
    windowEnd.setHours(23, 59, 59, 999);

    const [sessionsByDay, ticketsByDay] = await Promise.all([
      UserSession.aggregate([
        { $match: { loginTime: { $gte: windowStart, $lte: windowEnd } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$loginTime",
                timezone: "Asia/Kolkata",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Ticket.aggregate([
        {
          $match: {
            createdAt: { $gte: windowStart, $lte: windowEnd },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const sessionMap = Object.fromEntries(
      sessionsByDay.map((d) => [d._id, d.count]),
    );
    const ticketMap = Object.fromEntries(
      ticketsByDay.map((d) => [d._id, d.count]),
    );

    const data = Array.from({ length: 7 }, (_, i) => {
      const date = daysAgo(6 - i);
      const key = toDateKey(date);
      return {
        name: DAY_NAMES[date.getDay()],
        logins: sessionMap[key] || 0,
        tickets: ticketMap[key] || 0,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("getActivityData error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ─────────────────────────────────────────────────────────
   4. VERIFICATIONS  →  GET /api/admin/dashboard/verifications
───────────────────────────────────────────────────────── */

export const getPendingVerifications = async (req, res) => {
  try {
    const pendingDocs = await Document.find({
      kycDocumentId: { $ne: null },
      status: "pending",
    })
      .populate("uploadedForUser", "name role _id")
      .populate("uploadedByUser", "name _id")
      .populate("kycDocumentId", "name")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const roleToLabel = {
      [ROLES.BUSINESS_OWNER]: "Business Owner",
      [ROLES.AGENT]: "Agent",
      [ROLES.SERVICE_PROVIDER]: "Service Provider",
    };

    const data = pendingDocs.map((doc) => {
      const isSelf =
        doc.uploadedByUser?._id?.toString() ===
        doc.uploadedForUser?._id?.toString();

      return {
        key: doc._id,
        entityType:
          roleToLabel[doc.uploadedForUser?.role] ||
          doc.uploadedForUser?.role ||
          "Unknown",
        name: doc.uploadedForUser?.name || "—",
        category: doc.kycDocumentId?.name || "KYC Document",
        submittedBy: isSelf ? "Self" : doc.uploadedByUser?.name || "—",
        dateSubmitted: new Date(doc.createdAt).toISOString().slice(0, 10),
        status: "Pending",
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("getPendingVerifications error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ─────────────────────────────────────────────────────────
   5. SERVICES  →  GET /api/admin/dashboard/services
   
   This powers the "Service Summary" widget on the dashboard.
   
   It shows SERVICE APPROVAL STATUS — exactly what the
   ServiceApprovalSummary component manages:
     • Pending Approval  → status "pending_approval"  (waiting for admin action)
     • Approved          → status "approved"           (live / active services)
     • Rejected          → status "rejected"           (needs provider attention)
     • Draft             → status "draft"              (not yet submitted)
     • Inactive          → status "inactive"           (manually deactivated)
   
   The three widget rows map to:
     - Pending Approval  (primary action item for admin)
     - Approved (Active) 
     - Rejected / Inactive (needs attention)
───────────────────────────────────────────────────────── */

export const getServicesSummary = async (req, res) => {
  try {
    const groups = await ServiceProviderService.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byStatus = Object.fromEntries(groups.map((g) => [g._id, g.count]));

    const pendingApproval = byStatus["pending_approval"] || 0;
    const approved = byStatus["approved"] || 0;
    const rejected = byStatus["rejected"] || 0;
    const inactive = byStatus["inactive"] || 0;
    const draft = byStatus["draft"] || 0;
    const total = pendingApproval + approved + rejected + inactive + draft;

    return res.status(200).json({
      success: true,
      data: {
        total,
        pendingApproval, // → "Pending Approval" widget row (primary CTA)
        approved, // → "Approved Services" widget row
        needsAttention: rejected + inactive, // → "Rejected / Inactive" widget row
        // Granular breakdown also available if needed
        rejected,
        inactive,
        draft,
      },
    });
  } catch (err) {
    console.error("getServicesSummary error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ─────────────────────────────────────────────────────────
   6. TICKETS  →  GET /api/admin/dashboard/tickets
───────────────────────────────────────────────────────── */

export const getTicketsSummary = async (req, res) => {
  try {
    const groups = await Ticket.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Ticket.status has no strict enum — normalise all known variants
    const labelMap = {
      New: "Open",
      open: "Open",
      "In Progress": "In Progress",
      in_progress: "In Progress",
      Resolved: "Resolved",
      resolved: "Resolved",
      Closed: "Resolved",
      closed: "Resolved",
      Escalated: "Escalated",
      escalated: "Escalated",
      Pending: "Pending Customer",
      pending: "Pending Customer",
    };

    const accumulated = {};
    groups.forEach(({ _id, count }) => {
      const label = labelMap[_id] ?? _id;
      accumulated[label] = (accumulated[label] || 0) + count;
    });

    const data = Object.entries(accumulated).map(([type, count]) => ({
      type,
      count,
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("getTicketsSummary error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ─────────────────────────────────────────────────────────
   7. NOTIFICATIONS  →  GET /api/admin/dashboard/notifications
───────────────────────────────────────────────────────── */

export const getDashboardNotifications = async (req, res) => {
  try {
    const logs = await NotificationLog.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const eventMeta = {
      user_created: { type: "info", tag: "User", tagColor: "blue" },
      user_verified: {
        type: "success",
        tag: "Verification",
        tagColor: "green",
      },
      user_rejected: {
        type: "alert",
        tag: "Verification",
        tagColor: "volcano",
      },
      ticket_created: { type: "warning", tag: "Tickets", tagColor: "orange" },
      ticket_updated: { type: "info", tag: "Tickets", tagColor: "blue" },
      ticket_archived: { type: "update", tag: "Tickets", tagColor: "purple" },
      document_approved: {
        type: "success",
        tag: "Document",
        tagColor: "green",
      },
      document_rejected: { type: "alert", tag: "Document", tagColor: "red" },
      service_approved: { type: "success", tag: "Service", tagColor: "green" },
      service_rejected: { type: "alert", tag: "Service", tagColor: "red" },
    };

    const data = logs.map((log) => {
      const meta = eventMeta[log.event] ?? {
        type: "info",
        tag: "System",
        tagColor: "gold",
      };
      const message =
        log.title || (log.event ?? "system_event").replace(/_/g, " ");
      return {
        type: meta.type,
        message,
        time: relativeTime(log.createdAt),
        tag: meta.tag,
        tagColor: meta.tagColor,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("getDashboardNotifications error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
