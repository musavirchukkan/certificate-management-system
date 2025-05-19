const certificateService = require('../services/certificateService');
const certificateModel = require('../models/certificateModel');

async function generateKeyPair(req, res) {
    try {
        const keyPair = await certificateService.generateAndSaveKeyPair();

        res.status(201).json({
            success: true,
            message: 'Key pair generated successfully',
            data: {
                id: keyPair.id,
                privateKeyPath: keyPair.privateKeyPath,
                publicKeyPath: keyPair.publicKeyPath,
                timestamp: keyPair.timestamp
            }
        });
    } catch (error) {
        console.error('Error generating key pair:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate key pair',
            error: error.message
        });
    }
}

async function issueCertificate(req, res) {
    try {
        const { subject, validityMinutes, privateKeyPath } = req.body;

        if (!subject || !validityMinutes) {
            return res.status(400).json({
                success: false,
                message: 'Subject and validityMinutes are required'
            });
        }

        const result = await certificateService.issueCertificate(
            subject,
            parseInt(validityMinutes),
            privateKeyPath || null
        );

        res.status(201).json({
            success: true,
            message: 'Certificate issued successfully',
            data: {
                id: result.id,
                subject: result.certificate.data.subject,
                issuedAt: result.certificate.data.issuedAt,
                expiresAt: result.certificate.data.expiresAt,
                path: result.path
            }
        });
    } catch (error) {
        console.error('Error issuing certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to issue certificate',
            error: error.message
        });
    }
}

async function validateCertificate(req, res) {
    try {
        const { certificatePath, publicKeyPath } = req.body;

        if (!certificatePath || !publicKeyPath) {
            return res.status(400).json({
                success: false,
                message: 'Certificate path and public key path are required'
            });
        }

        const result = await certificateService.validateCertificate(certificatePath, publicKeyPath);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error validating certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate certificate',
            error: error.message
        });
    }
}

async function validateCertificateBySubject(req, res) {
    try {
        const { subject } = req.params;

        if (!subject) {
            return res.status(400).json({
                success: false,
                message: 'Subject is required'
            });
        }

        const result = await certificateService.validateCertificateBySubject(subject);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error validating certificate by subject:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate certificate',
            error: error.message
        });
    }
}

async function listCertificates(req, res) {
    try {
        const certificates = await certificateModel.listCertificates();

        res.status(200).json({
            success: true,
            data: certificates
        });
    } catch (error) {
        console.error('Error listing certificates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list certificates',
            error: error.message
        });
    }
}

module.exports = {
    generateKeyPair,
    issueCertificate,
    validateCertificate,
    validateCertificateBySubject,
    listCertificates
};