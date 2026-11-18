const express = require('express');
const router = express.Router();
const { getProjectByInviteToken, acceptDeclarationByToken } = require('../controllers/publicController');

// Public route to view project preview from invite token
router.get('/invite/:token', getProjectByInviteToken);

// Public route to accept declaration form
router.post('/invite/:token/accept-declaration', acceptDeclarationByToken);

module.exports = router;
