const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { formatDate, CERT_DIR } = require('../utils/cryptoUtils');

async function saveKeyPair(privateKeyPath, publicKeyPath) {
    const query = {
        text: 'INSERT INTO key_pairs(private_key_path, public_key_path) VALUES($1, $2) RETURNING *',
        values: [privateKeyPath, publicKeyPath],
    };

    const result = await db.query(query);
    return result.rows[0];
}

async function saveCertificate(certificate, certificatePath, keyPairId) {
    const query = {
        text: `INSERT INTO certificates(
      subject, issuer, issued_at, expires_at, validity_minutes, certificate_path, key_pair_id
    ) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        values: [
            certificate.subject,
            certificate.issuer,
            certificate.issuedAt,
            certificate.expiresAt,
            certificate.validityMinutes,
            certificatePath,
            keyPairId
        ],
    };

    const result = await db.query(query);
    return result.rows[0];
}

async function findCertificateBySubject(subject) {
    const query = {
        text: 'SELECT * FROM certificates WHERE subject = $1 ORDER BY created_at DESC LIMIT 1',
        values: [subject],
    };

    const result = await db.query(query);
    return result.rows[0] || null;
}

async function getKeyPairById(id) {
    const query = {
        text: 'SELECT * FROM key_pairs WHERE id = $1',
        values: [id],
    };

    const result = await db.query(query);
    return result.rows[0] || null;
}

async function listCertificates() {
    const query = 'SELECT * FROM certificates ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
}

async function query(text, params) {
    return await db.query(text, params);
}

module.exports = {
    saveKeyPair,
    saveCertificate,
    findCertificateBySubject,
    getKeyPairById,
    listCertificates,
    query
};