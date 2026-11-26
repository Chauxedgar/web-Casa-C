const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/ask', verifyToken, aiController.askAdvisor);
router.get('/history', verifyToken, aiController.getAdvisorHistory);

module.exports = router;