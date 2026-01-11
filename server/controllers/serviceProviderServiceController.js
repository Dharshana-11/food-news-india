import ServiceProviderService from "../models/ServiceProviderService.js";
import Document from "../models/Document.js";

/**
 * ============================================================
 * SERVICE PROVIDER SIDE
 * ============================================================
 */

/**
 * Create a service (DRAFT)
 * Provider selects a compliance item and fills basic info
 */
export const createServiceProviderService = async (req, res) => {
  try {
    const { complianceItemId, price, turnaroundDays } = req.body;

    const service = await ServiceProviderService.create({
      serviceProviderId: req.user.serviceProviderId, // derived from logged-in user
      complianceItemId,
      price,
      turnaroundDays,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Service created",
      data: service,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Submit service for admin approval
 * (documents should already be uploaded)
 */
export const submitServiceForApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ServiceProviderService.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.status !== "draft") {
      return res.status(400).json({
        message: "Service already submitted or reviewed",
      });
    }

    service.status = "pending_approval";
    await service.save();

    return res.json({
      success: true,
      message: "Service submitted for approval",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * ============================================================
 * ADMIN SIDE
 * ============================================================
 */

/**
 * Get services pending admin approval
 */
export const getPendingServices = async (req, res) => {
  try {
    const services = await ServiceProviderService.find({
      status: "pending_approval",
    })
      .populate("serviceProviderId", "companyName")
      .populate("complianceItemId", "name code");

    return res.json({
      success: true,
      data: services,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Approve a service
 * Ensures ALL service authorization documents are approved
 */
export const approveService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ServiceProviderService.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check pending / rejected documents
    const pendingDocs = await Document.find({
      serviceProviderServiceId: id,
      status: { $ne: "approved" },
    });

    if (pendingDocs.length > 0) {
      return res.status(400).json({
        message: "All service authorization documents must be approved",
      });
    }

    service.status = "approved";
    service.reviewedAt = new Date();
    service.reviewedBy = req.user._id;
    await service.save();

    return res.json({
      success: true,
      message: "Service approved",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Reject a service
 */
export const rejectService = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const service = await ServiceProviderService.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.status = "rejected";
    service.adminNotes = adminNotes || "";
    service.reviewedAt = new Date();
    service.reviewedBy = req.user._id;
    await service.save();

    return res.json({
      success: true,
      message: "Service rejected",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
