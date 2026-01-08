import ServiceBooking from "../models/ServiceBooking.js";

/**
 * Loads booking and attaches it to req.booking
 */
export const loadBooking = async (req, res, next) => {
  try {
    const booking = await ServiceBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    req.booking = booking;
    next();
  } catch (err) {
    next(err);
  }
};
