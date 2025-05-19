const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

router.post('/key-pairs', certificateController.generateKeyPair);

router.post('/certificates', certificateController.issueCertificate);
router.get('/certificates', certificateController.listCertificates);
router.post('/certificates/validate', certificateController.validateCertificate);
router.get('/certificates/validate/:subject', certificateController.validateCertificateBySubject);

module.exports = router;