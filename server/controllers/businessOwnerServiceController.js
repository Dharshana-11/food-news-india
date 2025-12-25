import ComplianceItem from "../models/ComplianceItem.js";
import ServiceProvider from "../models/ServiceProvider.js";
import ServiceBooking from "../models/ServiceBooking.js";
import ComplianceRequirementMapping from "../models/ComplianceRequirementMapping.js";
import BusinessProfile from "../models/BusinessProfile.js";

/**
 * Get all active compliance items (services)
 *
 * @route   GET /api/services
 * @query   {string} search      Optional text search
 * @query   {string} sortBy      Field to sort by (default: name)
 * @query   {string} sortOrder   asc | desc (default: asc)
 * @query   {number} limit       Results per page (default: 50)
 * @query   {number} page        Page number (default: 1)
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
    const sortOptions = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Pagination
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const [services, total] = await Promise.all([
      ComplianceItem.find(query)
        .sort(sortOptions)
        .limit(parsedLimit)
        .skip(skip)
        .lean(),
      ComplianceItem.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
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
 * Get compliance services applicable to the current user's business type
 *
 * @route   GET /api/services/my-applicable
 * @access  Authenticated (Business Owner)
 */
export const getMyApplicableServices = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch business profile
    const businessProfile = await BusinessProfile.findOne({ userId }).lean();

    if (!businessProfile || !businessProfile.businessTypeId) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found or business type not set",
      });
    }

    // Fetch compliance mappings for the business type
    const mappings = await ComplianceRequirementMapping.find({
      businessTypeId: businessProfile.businessTypeId,
      status: "active",
    })
      .populate("complianceItemId")
      .lean();

    const applicableServices = mappings
      .filter(
        (mapping) =>
          mapping.complianceItemId &&
          mapping.complianceItemId.status === "active"
      )
      .map((mapping) => ({
        ...mapping.complianceItemId,
        applicability: mapping.applicability,
        isRequired: mapping.applicability === "required",
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
 * Get service (compliance item) details by ID
 *
 * @route   GET /api/services/:id
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
 * Get service providers offering a specific compliance item
 *
 * @route   GET /api/services/:id/providers
 * @query   {string} sortBy   rating | price | customers
 * @query   {string} search   Text search
 * @query   {number} limit    Results per page (default: 20)
 * @query   {number} page     Page number (default: 1)
 */
export const getServiceProviders = async (req, res) => {
  try {
    const { id } = req.params;
    const { sortBy = "rating", search, limit = 20, page = 1 } = req.query;

    // Validate compliance item
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
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const [providers, total] = await Promise.all([
      ServiceProvider.find(query)
        .populate("userId", "name phone email")
        .populate("complianceItemsOffered", "name code")
        .sort(sortOptions)
        .limit(parsedLimit)
        .skip(skip)
        .lean(),
      ServiceProvider.countDocuments(query),
    ]);

    // Attach pricing for this compliance item
    const providersWithPricing = providers.map((provider) => {
      const pricing = provider.pricingPerItem?.find(
        (item) => item.complianceItemId.toString() === id
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
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
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
 * Get service provider details by ID
 *
 * @route   GET /api/services/providers/:providerId
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
