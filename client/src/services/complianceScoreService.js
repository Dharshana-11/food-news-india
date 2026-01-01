/**
 * @file complianceScoreService.js
 * -----------------------------------------------------------------------------
 * Service for fetching compliance score data for the logged-in business owner.
 *
 * Notes:
 * - Cleanup & documentation only
 * - No logic changes
 * -----------------------------------------------------------------------------
 */

import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Compliance Score Service
 */
const complianceScoreService = {
  /**
   * Fetch compliance score for the current user
   *
   * @returns {Promise<import("axios").AxiosResponse>}
   */
  getMyComplianceScore: () => api.get(ENDPOINTS.MY_COMPLIANCE_SCORE),
};

export default complianceScoreService;
