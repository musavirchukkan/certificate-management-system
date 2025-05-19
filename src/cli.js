// src/cli.js
const fs = require('fs');
const path = require('path');
const certificateService = require('./services/certificateService');

async function displayHelp() {
    console.log(`
Certificate Management System CLI

Usage:
  node cli.js generate-key          Generate a new key pair
  node cli.js issue <subject> <mins> [privateKeyPath]  Issue a certificate
  node cli.js validate <certPath> <pubKeyPath>         Validate a certificate
  node cli.js validate-subject <subject>               Validate by subject
  node cli.js demo                  Run the demonstration
  `);
}

async function run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        switch (command) {
            case 'generate-key':
                const keyPair = await certificateService.generateAndSaveKeyPair();
                console.log('Key pair generated successfully:');
                console.log(`Private key: ${keyPair.privateKeyPath}`);
                console.log(`Public key: ${keyPair.publicKeyPath}`);
                break;

            case 'issue':
                if (args.length < 3) {
                    console.error('Missing arguments. Usage: node cli.js issue <subject> <validityMinutes> [privateKeyPath]');
                    process.exit(1);
                }

                const subject = args[1];
                const validityMinutes = parseInt(args[2]);
                const privateKeyPath = args[3] || null;

                const cert = await certificateService.issueCertificate(subject, validityMinutes, privateKeyPath);
                console.log(`Certificate issued successfully: ${cert.path}`);
                break;

            case 'validate':
                if (args.length < 3) {
                    console.error('Missing arguments. Usage: node cli.js validate <certificatePath> <publicKeyPath>');
                    process.exit(1);
                }

                const certPath = args[1];
                const pubKeyPath = args[2];

                const validation = await certificateService.validateCertificate(certPath, pubKeyPath);
                console.log('Validation result:');
                console.log(validation);
                break;

            case 'validate-subject':
                if (args.length < 2) {
                    console.error('Missing arguments. Usage: node cli.js validate-subject <subject>');
                    process.exit(1);
                }

                const subjectToValidate = args[1];
                const subjectValidation = await certificateService.validateCertificateBySubject(subjectToValidate);
                console.log('Validation result:');
                console.log(subjectValidation);
                break;

            case 'demo':
                // This is imported from index.js
                require('../index').demonstrateCertificateSystem();
                break;

            case 'help':
            default:
                await displayHelp();
                break;
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    run();
}

module.exports = { run };