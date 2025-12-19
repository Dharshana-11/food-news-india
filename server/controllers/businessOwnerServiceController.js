import ComplianceItem from "../models/ComplianceItem.js";
import ServiceProvider from "../models/ServiceProvider.js";
import ServiceBooking from "../models/ServiceBooking.js";
import ComplianceRequirementMapping from "../models/ComplianceRequirementMapping.js";
import BusinessProfile from "../models/BusinessProfile.js";

/**
 * Get all active compliance items (services) with optional filters
 * GET /api/services
 * Query params: search, sortBy, sortOrder, limit, page
 */
export const getServices = async (req, res) => {
  try {
    const {
      search,
      sortBy = "name",
      sortOrder = "asc",
      limit = 50,
      page = 1,
    } = req.query;

    const query = { status: "active" };

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [services, total] = await Promise.all([
      ComplianceItem.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      ComplianceItem.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

/**
 * Get services applicable to current user's business type
 * GET /api/services/my-applicable
 */
export const getMyApplicableServices = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get business profile
    const businessProfile = await BusinessProfile.findOne({ userId }).lean();

    if (!businessProfile || !businessProfile.businessTypeId) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found or business type not set",
      });
    }

    // Get compliance requirements for this business type
    const mappings = await ComplianceRequirementMapping.find({
      businessTypeId: businessProfile.businessTypeId,
      status: "active",
    })
      .populate("complianceItemId")
      .lean();

    const applicableServices = mappings
      .filter(
        (m) => m.complianceItemId && m.complianceItemId.status === "active"
      )
      .map((m) => ({
        ...m.complianceItemId,
        applicability: m.applicability,
        isRequired: m.applicability === "required",
      }));

    res.status(200).json({
      success: true,
      data: applicableServices,
    });
  } catch (error) {
    console.error("Error fetching applicable services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applicable services",
      error: error.message,
    });
  }
};

/**
 * Get service details by ID
 * GET /api/services/:id
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ComplianceItem.findById(id).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

/**
 * Get service providers for a specific compliance item
 * GET /api/services/:id/providers
 * Query params: sortBy (rating, price, customers), search, limit, page
 */
export const getServiceProviders = async (req, res) => {
  try {
    const { id } = req.params;
    const { sortBy = "rating", search, limit = 20, page = 1 } = req.query;

    // Check if compliance item exists
    const complianceItem = await ComplianceItem.findById(id);
    if (!complianceItem) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const query = {
      status: "active",
      complianceItemsOffered: id,
    };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortOptions = {};
    if (sortBy === "rating") {
      sortOptions.rating = -1;
      sortOptions.completedBookings = -1;
    } else if (sortBy === "price") {
      sortOptions["pricingPerItem.price"] = 1;
    } else if (sortBy === "customers") {
      sortOptions.totalCustomers = -1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [providers, total] = await Promise.all([
      ServiceProvider.find(query)
        .populate("userId", "name phone email")
        .populate("complianceItemsOffered", "name code")
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      ServiceProvider.countDocuments(query),
    ]);

    // Add pricing info for this specific compliance item
    const providersWithPricing = providers.map((provider) => {
      const pricing = provider.pricingPerItem?.find(
        (p) => p.complianceItemId.toString() === id
      );
      return {
        ...provider,
        priceForThisItem: pricing?.price || 0,
        estimatedDaysForThisItem: pricing?.estimatedDays || 7,
      };
    });

    res.status(200).json({
      success: true,
      data: providersWithPricing,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service providers",
      error: error.message,
    });
  }
};

/**
 * Get provider details
 * GET /api/services/providers/:providerId
 */
export const getProviderById = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await ServiceProvider.findById(providerId)
      .populate("userId", "name phone email")
      .populate("complianceItemsOffered", "name code description validityDays")
      .lean();

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found",
      });
    }

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider",
      error: error.message,
    });
  }
};
