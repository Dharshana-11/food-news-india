import ComplianceItem from "../models/ComplianceItem.js";
import ServiceProvider from "../models/ServiceProvider.js";
import ServiceProviderService from "../models/ServiceProviderService.js";
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

    // 1️. Validate compliance item
    const complianceItem = await ComplianceItem.findById(id).lean();
    if (!complianceItem) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // 2️. Fetch only approved provider-services
    const approvedServices = await ServiceProviderService.find({
      complianceItemId: id,
      status: "approved",
    })
      .select("serviceProviderId price turnaroundDays")
      .lean();

    if (approvedServices.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const providerIds = approvedServices.map((s) => s.serviceProviderId);

    // 3️. Fetch ONLY active providers
    const providers = await ServiceProvider.find({
      _id: { $in: providerIds },
      status: "active",
    })
      .populate("userId", "name phone email")
      .lean();

    // 4️. Merge provider + approved service data
    const result = providers
      .map((provider) => {
        const service = approvedServices.find(
          (s) => s.serviceProviderId.toString() === provider._id.toString()
        );

        if (!service) return null;

        return {
          ...provider,
          priceForThisItem: service.price ?? 0,
          estimatedDaysForThisItem: service.turnaroundDays ?? 7,
        };
      })
      .filter(Boolean); // remove any accidental nulls

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("STRICT provider fetch failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service providers",
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
