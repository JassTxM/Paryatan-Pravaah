const express = require('express');
const router = express.Router();
const { getSlots } = require('../controllers/slotController');

router.get('/', getSlots);

module.exports = router;
