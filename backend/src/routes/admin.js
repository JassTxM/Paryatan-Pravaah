const express = require('express');
const router = express.Router();
const {
  getTelemetry,
  getForecastCurve,
  throttleSlot,
  dispatchMarshals,
  deployOffPeak
} = require('../controllers/adminController');

router.get('/telemetry', getTelemetry);
router.get('/forecast-curve', getForecastCurve);
router.post('/throttle-slot', throttleSlot);
router.post('/dispatch-marshals', dispatchMarshals);
router.post('/deploy-offpeak', deployOffPeak);

module.exports = router;
