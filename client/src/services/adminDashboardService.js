/**
 * @file dashboardService.js
 * @description All API calls for the Super Admin Dashboard.
 *
 * Uses a single Promise.all to fetch all sections in parallel,
 * plus individual helpers for targeted refreshes.
 *
 * Usage:
 *   import { fetchAllDashboardData } from "../../services/dashboardService";
 *   const data = await fetchAllDashboardData();
 */

import api from "../api/axios"; // your existing axios instance

const BASE = "/admin/dashboard";

/* ─────────────────────────────────────────────────────────────────────────────
   Individual fetchers (also exported for targeted use / manual refresh)
───────────────────────────────────────────────────────────────────────────── */

export const fetchDashboardStats = async () => {
  const { data } = await api.get(`${BASE}/stats`);
  return data.data; // { totalBusinesses, agents, serviceProviders, openTickets }
};

export const fetchComplianceOverview = async () => {
  const { data } = await api.get(`${BASE}/compliance`);
  return data.data; // [{ name, value }, ...]
};

export const fetchActivityData = async () => {
  const { data } = await api.get(`${BASE}/activity`);
  return data.data; // [{ name, logins, tickets }, ...]   (7 days)
};

export const fetchPendingVerifications = async () => {
  const { data } = await api.get(`${BASE}/verifications`);
  return data.data; // [{ key, entityType, name, category, submittedBy, dateSubmitted, status }, ...]
};

export const fetchServicesSummary = async () => {
  const { data } = await api.get(`${BASE}/services`);
  return data.data; // { total, approved, underReview, inactive, rejected }
};

export const fetchTicketsSummary = async () => {
  const { data } = await api.get(`${BASE}/tickets`);
  return data.data; // [{ type, count }, ...]
};

export const fetchDashboardNotifications = async () => {
  const { data } = await api.get(`${BASE}/notifications`);
  return data.data; // [{ type, message, time, tag, tagColor }, ...]
};

/* ─────────────────────────────────────────────────────────────────────────────
   Bulk loader — fetches everything in parallel
───────────────────────────────────────────────────────────────────────────── */

/**
 * Fetch all dashboard sections concurrently.
 *
 * Returns a structured object ready for the component's state setters.
 * Individual failures are caught and replaced with `null` so the rest
 * of the dashboard still renders.
 *
 * @returns {Promise<{
 *   stats: object|null,
 *   compliance: Array|null,
 *   activity: Array|null,
 *   verifications: Array|null,
 *   services: object|null,
 *   tickets: Array|null,
 *   notifications: Array|null,
 * }>}
 */
export const fetchAllDashboardData = async () => {
  const safeCall = (fn) =>
    fn().catch((err) => {
      console.warn(`[Dashboard] ${fn.name} failed:`, err?.message);
      return null;
    });

  const [
    stats,
    compliance,
    activity,
    verifications,
    services,
    tickets,
    notifications,
  ] = await Promise.all([
    safeCall(fetchDashboardStats),
    safeCall(fetchComplianceOverview),
    safeCall(fetchActivityData),
    safeCall(fetchPendingVerifications),
    safeCall(fetchServicesSummary),
    safeCall(fetchTicketsSummary),
    safeCall(fetchDashboardNotifications),
  ]);

  return {
    stats,
    compliance,
    activity,
    verifications,
    services,
    tickets,
    notifications,
  };
};
