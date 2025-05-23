const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const KEY_DIR = process.env.KEY_DIR || './keys';
const CERT_DIR = process.env.CERT_DIR || './certificates';

// Ensure directories exist
if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true });
}
if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true });
}

// Helper function to format dates for certificates
function formatDate(date) {
    return date.toISOString().replace(/[:.]/g, '-');
}

function generateKeyPair() {
    console.log('Generating new key pair...');

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    const timestamp = formatDate(new Date());

    // Define key paths
    const privateKeyPath = path.join(KEY_DIR, `private_key_${timestamp}.pem`);
    const publicKeyPath = path.join(KEY_DIR, `public_key_${timestamp}.pem`);

    // Save keys to files
    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);

    console.log(`Key pair generated and saved in ${KEY_DIR}`);

    return {
        privateKey,
        publicKey,
        privateKeyPath,
        publicKeyPath,
        timestamp
    };
}

function signData(data, privateKey) {
    const dataString = JSON.stringify(data);
    const signer = crypto.createSign('SHA256');
    signer.update(dataString);
    signer.end();
    return signer.sign(privateKey, 'base64');
}

function verifySignature(data, signature, publicKey) {
    const dataString = JSON.stringify(data);
    const verifier = crypto.createVerify('SHA256');
    verifier.update(dataString);
    return verifier.verify(publicKey, signature, 'base64');
}

module.exports = {
    generateKeyPair,
    signData,
    verifySignature,
    formatDate,
    KEY_DIR,
    CERT_DIR
};