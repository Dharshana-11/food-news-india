import ServiceProviderService from "../models/ServiceProviderService.js";
import ComplianceItem from "../models/ComplianceItem.js";
import Document from "../models/Document.js";
import ServiceProvider from "../models/ServiceProvider.js";

/**
 * ============================================================
 * SERVICE PROVIDER SIDE - MY SERVICES
 * ============================================================
 */

/**
 * Get all services for the logged-in service provider
 * GET /api/service-provider/my-services
 */
export const getMyServices = async (req, res) => {
  try {
    const { search, status } = req.query;

    // Get service provider ID from logged-in user
    const serviceProvider = await ServiceProvider.findOne({
      userId: req.user._id,
    });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    // Build query
    const query = { serviceProviderId: serviceProvider._id };

    if (status) {
      query.status = status;
    }

    // Get services
    let services = await ServiceProviderService.find(query)
      .populate(
        "complianceItemId",
        "name code validityDays serviceProviderRequirements"
      )
      .sort({ createdAt: -1 });

    // Search filter (in-memory for simplicity)
    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter((s) =>
        s.complianceItemId.name.toLowerCase().includes(searchLower)
      );
    }

    // For each service, get document stats
    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const docs = await Document.find({
          serviceProviderServiceId: service._id,
        });

        const docStats = {
          total: docs.length,
          pending: docs.filter((d) => d.status === "pending").length,
          approved: docs.filter((d) => d.status === "approved").length,
          rejected: docs.filter((d) => d.status === "rejected").length,
        };

        return {
          _id: service._id,
          complianceItem: {
            _id: service.complianceItemId._id,
            name: service.complianceItemId.name,
            code: service.complianceItemId.code,
          },
          price: service.price,
          turnaroundDays: service.turnaroundDays,
          status: service.status,
          adminNotes: service.adminNotes,
          reviewedAt: service.reviewedAt,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          documentStats: docStats,
        };
      })
    );

    return res.json({
      success: true,
      data: servicesWithStats,
    });
  } catch (error) {
    console.error("Get my services error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single service details
 * GET /api/service-provider/my-services/:id
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceProvider = await ServiceProvider.findOne({
      userId: req.user._id,
    });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const service = await ServiceProviderService.findOne({
      _id: id,
      serviceProviderId: serviceProvider._id,
    }).populate(
      "complianceItemId reviewedBy",
      "name code validityDays serviceProviderRequirements name email"
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Get authorization documents
    const documents = await Document.find({
      serviceProviderServiceId: service._id,
    }).populate("uploadedByUser", "name email");

    return res.json({
      success: true,
      data: {
        service,
        documents,
      },
    });
  } catch (error) {
    console.error("Get service by ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Create a new service
 * POST /api/service-provider/my-services
 *
 * Business Rules:
 * - Service is created with status = "pending_approval"
 * - Required authorization documents must be uploaded
 * - Documents are validated against compliance item requirements
 */
export const createService = async (req, res) => {
  try {
    const { complianceItemId, price, turnaroundDays } = req.body;

    if (!complianceItemId || price == null || turnaroundDays == null) {
      return res.status(400).json({
        success: false,
        message: "Compliance item, price, and turnaround days are required",
      });
    }

    const serviceProvider = await ServiceProvider.findOne({
      userId: req.user._id,
    });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const complianceItem = await ComplianceItem.findOne({
      _id: complianceItemId,
      status: "active",
    });

    if (!complianceItem) {
      return res.status(404).json({
        success: false,
        message: "Compliance item not found or inactive",
      });
    }

    const existing = await ServiceProviderService.findOne({
      serviceProviderId: serviceProvider._id,
      complianceItemId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Service already exists for this compliance item",
      });
    }

    // CREATE DRAFT SERVICE ONLY
    const service = await ServiceProviderService.create({
      serviceProviderId: serviceProvider._id,
      complianceItemId,
      price,
      turnaroundDays,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      data: service,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update service (allowed fields only)
 * PUT /api/service-provider/my-services/:id
 *
 * Business Rules:
 * - Only price and turnaroundDays can be edited
 * - Compliance item cannot be changed
 * - If service was rejected, editing resets status to pending_approval
 * - Active/approved services can be edited (will remain active)
 */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, turnaroundDays } = req.body;

    const serviceProvider = await ServiceProvider.findOne({
      userId: req.user._id,
    });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const service = await ServiceProviderService.findOne({
      _id: id,
      serviceProviderId: serviceProvider._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Update allowed fields
    if (price !== undefined) service.price = price;
    if (turnaroundDays !== undefined) service.turnaroundDays = turnaroundDays;

    // If service was rejected, reset to pending approval
    if (service.status === "rejected") {
      service.status = "pending_approval";
      service.adminNotes = "";
      service.reviewedAt = null;
      service.reviewedBy = null;
    }

    await service.save();

    const updatedService = await ServiceProviderService.findById(
      service._id
    ).populate("complianceItemId", "name code");

    return res.json({
      success: true,
      message:
        service.status === "pending_approval"
          ? "Service updated and resubmitted for approval"
          : "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error("Update service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Deactivate service
 * PATCH /api/service-provider/my-services/:id/deactivate
 *
 * Business Rules:
 * - Only active services can be deactivated
 * - No admin approval needed
 */
export const deactivateService = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceProvider = await ServiceProvider.findOne({
      userId: req.user._id,
    });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const service = await ServiceProviderService.findOne({
      _id: id,
      serviceProviderId: serviceProvider._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved services can be deactivated",
      });
    }

    service.status = "inactive";
    await service.save();

    return res.json({
      success: true,
      message: "Service deactivated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Deactivate service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Activate service
 * PATCH /api/service-provider/my-services/:id/activate
 *
 * Business Rules:
 * - Only inactive services can be reactivated
 * - Service must have been previously approved
 */
export const activateService = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceProvider = await ServiceProvider.findOne({
      userId: req.user._id,
    });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const service = await ServiceProviderService.findOne({
      _id: id,
      serviceProviderId: serviceProvider._id,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.status !== "inactive") {
      return res.status(400).json({
        success: false,
        message: "Only inactive services can be activated",
      });
    }

    // Check if service was ever approved
    if (!service.reviewedAt) {
      return res.status(400).json({
        success: false,
        message: "Service must be approved by admin first",
      });
    }

    service.status = "approved";
    await service.save();

    return res.json({
      success: true,
      message: "Service activated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Activate service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitServiceForApproval = async (req, res) => {
  const { id } = req.params;

  const service =
    await ServiceProviderService.findById(id).populate("complianceItemId");

  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  if (service.status !== "draft") {
    return res.status(400).json({ message: "Service already submitted" });
  }

  const required =
    service.complianceItemId.serviceProviderRequirements?.filter(
      (r) => r.required
    ) || [];

  const uploadedDocs = await Document.find({
    serviceProviderServiceId: service._id,
  });

  if (uploadedDocs.length < required.length) {
    return res.status(400).json({
      message: "Please upload all required documents before submitting",
    });
  }

  service.status = "pending_approval";
  await service.save();

  res.json({ success: true });
};

/**
 * ============================================================
 * ADMIN SIDE - SERVICE APPROVAL
 * ============================================================
 */

/**
 * Get services pending admin approval
 * GET /api/admin/services/pending
 */
export const getPendingServices = async (req, res) => {
  try {
    const services = await ServiceProviderService.find({
      status: "pending_approval",
    })
      .populate("serviceProviderId", "companyName contactEmail contactPhone")
      .populate("complianceItemId", "name code serviceProviderRequirements")
      .sort({ createdAt: 1 });

    // For each service, get document stats
    const servicesWithDocs = await Promise.all(
      services.map(async (service) => {
        const serviceProvider = await ServiceProvider.findById(
          service.serviceProviderId
        ).populate("userId", "name email");

        const documents = await Document.find({
          uploadedForUser: serviceProvider.userId._id,
          complianceItemId: service.complianceItemId._id,
        });

        const docStats = {
          total: documents.length,
          pending: documents.filter((d) => d.status === "pending").length,
          approved: documents.filter((d) => d.status === "approved").length,
          rejected: documents.filter((d) => d.status === "rejected").length,
        };

        return {
          ...service.toObject(),
          documentStats: docStats,
          providerUser: serviceProvider.userId,
        };
      })
    );

    return res.json({
      success: true,
      data: servicesWithDocs,
    });
  } catch (error) {
    console.error("Get pending services error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Approve a service
 * PATCH /api/admin/services/:id/approve
 *
 * Business Rules:
 * - ALL required authorization documents must be approved
 * - Service status changes to "approved"
 */
export const approveService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ServiceProviderService.findById(id)
      .populate("serviceProviderId")
      .populate("complianceItemId");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.status !== "pending_approval") {
      return res.status(400).json({
        success: false,
        message: "Service is not pending approval",
      });
    }

    // Get service provider user
    const serviceProvider = await ServiceProvider.findById(
      service.serviceProviderId._id
    ).populate("userId");

    // Check if all required documents are approved
    const requirements =
      service.complianceItemId.serviceProviderRequirements || [];
    const requiredDocs = requirements.filter((req) => req.required);

    if (requiredDocs.length > 0) {
      const documents = await Document.find({
        serviceProviderServiceId: service._id,
      });

      const approvedDocs = documents.filter((d) => d.status === "approved");

      if (approvedDocs.length < requiredDocs.length) {
        return res.status(400).json({
          success: false,
          message: `All required authorization documents must be approved first (${approvedDocs.length}/${requiredDocs.length} approved)`,
        });
      }
    }

    // Approve service
    service.status = "approved";
    service.reviewedAt = new Date();
    service.reviewedBy = req.user._id;
    service.adminNotes = "";
    await service.save();

    return res.json({
      success: true,
      message: "Service approved successfully",
      data: service,
    });
  } catch (error) {
    console.error("Approve service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reject a service
 * PATCH /api/admin/services/:id/reject
 */
export const rejectService = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!adminNotes || adminNotes.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const service = await ServiceProviderService.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.status !== "pending_approval") {
      return res.status(400).json({
        success: false,
        message: "Service is not pending approval",
      });
    }

    service.status = "rejected";
    service.adminNotes = adminNotes;
    service.reviewedAt = new Date();
    service.reviewedBy = req.user._id;
    await service.save();

    return res.json({
      success: true,
      message: "Service rejected",
      data: service,
    });
  } catch (error) {
    console.error("Reject service error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
