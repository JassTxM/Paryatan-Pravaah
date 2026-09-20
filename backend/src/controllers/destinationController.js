const Destination = require('../models/Destination');

const getDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find({ status: { $ne: 'OFFLINE' } })
      .select('-__v')
      .lean();
    res.json({ success: true, data: destinations });
  } catch (err) {
    next(err);
  }
};

const getDestinationById = async (req, res, next) => {
  try {
    const dest = await Destination.findById(req.params.id).lean();
    if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
    res.json({ success: true, data: dest });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDestinations, getDestinationById };
