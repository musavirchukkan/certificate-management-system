const fs = require('fs');
const path = require('path');
const cryptoUtils = require('../utils/cryptoUtils');
const certificateModel = require('../models/certificateModel');

async function generateAndSaveKeyPair() {
    const keyPair = cryptoUtils.generateKeyPair();

    // Save to database
    const savedKeyPair = await certificateModel.saveKeyPair(
        keyPair.privateKeyPath,
        keyPair.publicKeyPath
    );

    return {
        ...keyPair,
        id: savedKeyPair.id
    };
}

async function issueCertificate(subject, validityMinutes, privateKeyPath = null) {
    let privateKey;
    let keyPairId;

    if (privateKeyPath) {
        privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        console.log(`Using existing private key from: ${privateKeyPath}`);

        // Find key pair ID from path
        const keyPairQuery = await certificateModel.query(
            'SELECT id FROM key_pairs WHERE private_key_path = $1',
            [privateKeyPath]
        );

        if (keyPairQuery.rows.length > 0) {
            keyPairId = keyPairQuery.rows[0].id;
        } else {
            // Create a new entry if key pair not found in DB
            const publicKeyPath = privateKeyPath.replace('private_key', 'public_key');
            const savedKeyPair = await certificateModel.saveKeyPair(privateKeyPath, publicKeyPath);
            keyPairId = savedKeyPair.id;
        }
    } else {
        // Generate a new key pair
        const keyPair = await generateAndSaveKeyPair();
        privateKey = keyPair.privateKey;
        keyPairId = keyPair.id;
        privateKeyPath = keyPair.privateKeyPath;
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + validityMinutes * 60000);

    // Create certificate details
    const certificate = {
        subject,
        issuedAt: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
        issuer: 'Certificate Authority Demo',
        validityMinutes,
    };

    // Sign the certificate
    const signature = cryptoUtils.signData(certificate, privateKey);

    // Create the final certificate structure
    const signedCertificate = {
        data: certificate,
        signature
    };

    // Save certificate
    const certFileName = `cert_${subject}_${cryptoUtils.formatDate(now)}.json`;
    const certFilePath = path.join(cryptoUtils.CERT_DIR, certFileName);

    fs.writeFileSync(certFilePath, JSON.stringify(signedCertificate, null, 2));

    // Save to database
    const savedCert = await certificateModel.saveCertificate(
        certificate,
        certFilePath,
        keyPairId
    );

    console.log(`Certificate issued for "${subject}" with validity of ${validityMinutes} minutes`);
    console.log(`Certificate expires at: ${expiryDate.toISOString()}`);
    console.log(`Certificate saved to: ${certFilePath}`);

    return {
        certificate: signedCertificate,
        path: certFilePath,
        id: savedCert.id
    };
}

async function validateCertificate(certificatePath, publicKeyPath) {
    console.log(`Validating certificate: ${certificatePath}`);

    try {
        // Read the certificate and public key
        const signedCertificate = JSON.parse(fs.readFileSync(certificatePath, 'utf8'));
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

        // Extract certificate data and signature
        const { data: certificate, signature } = signedCertificate;

        // Verify the certificate's signature
        const isSignatureValid = cryptoUtils.verifySignature(certificate, signature, publicKey);

        if (!isSignatureValid) {
            return {
                valid: false,
                reason: 'Invalid signature. The certificate may have been tampered with.'
            };
        }

        // Check expiration
        const currentTime = new Date();
        const expiryTime = new Date(certificate.expiresAt);

        if (currentTime > expiryTime) {
            return {
                valid: false,
                reason: 'Certificate has expired.',
                expiryTime: certificate.expiresAt,
                currentTime: currentTime.toISOString()
            };
        }

        // Certificate is valid
        return {
            valid: true,
            subject: certificate.subject,
            issuer: certificate.issuer,
            issuedAt: certificate.issuedAt,
            expiresAt: certificate.expiresAt,
            remainingMinutes: Math.round((expiryTime - currentTime) / 60000)
        };
    } catch (error) {
        return {
            valid: false,
            reason: `Error during validation: ${error.message}`
        };
    }
}

async function validateCertificateBySubject(subject) {
    // Find the certificate
    const certificate = await certificateModel.findCertificateBySubject(subject);

    if (!certificate) {
        return {
            valid: false,
            reason: `No certificate found for subject: ${subject}`
        };
    }

    // Get the key pair
    const keyPair = await certificateModel.getKeyPairById(certificate.key_pair_id);

    if (!keyPair) {
        return {
            valid: false,
            reason: 'Associated key pair not found'
        };
    }

    // Validate the certificate
    return await validateCertificate(certificate.certificate_path, keyPair.public_key_path);
}

module.exports = {
    generateAndSaveKeyPair,
    issueCertificate,
    validateCertificate,
    validateCertificateBySubject
};