const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { helmet, apiLimiter } = require('./src/middleware/security');


const certificateRoutes = require('./src/routes/certificateRoutes');

const certificateService = require('./src/services/certificateService');



const app = express();
app.use(express.json());

app.use(helmet());
app.use('/api', apiLimiter);

app.use(express.static(path.join(__dirname, 'src/public')));

app.use('/api', certificateRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public/index.html'));
});






// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

async function demonstrateCertificateSystem() {
    console.log('=== CERTIFICATE SYSTEM DEMONSTRATION ===');

    try {
        // Generate a key pair for our demo CA
        const keyPair = await certificateService.generateAndSaveKeyPair();

        console.log('\n=== ISSUING CERTIFICATES ===');

        // Issue certificates with different validity periods
        const cert1 = await certificateService.issueCertificate('example.com', 10, keyPair.privateKeyPath);
        const cert2 = await certificateService.issueCertificate('short-lived-cert.com', 3, keyPair.privateKeyPath);
        const cert3 = await certificateService.issueCertificate('very-short-cert.com', 1, keyPair.privateKeyPath);

        console.log('\n=== VALIDATING CERTIFICATES IMMEDIATELY ===');

        // Validate certificates immediately (should all be valid)
        console.log('\nValidating normal certificate:');
        console.log(await certificateService.validateCertificate(cert1.path, keyPair.publicKeyPath));

        console.log('\nValidating short-lived certificate:');
        console.log(await certificateService.validateCertificate(cert2.path, keyPair.publicKeyPath));

        console.log('\nValidating very short-lived certificate:');
        console.log(await certificateService.validateCertificate(cert3.path, keyPair.publicKeyPath));

        console.log('\n=== WAITING FOR EXPIRATION ===');
        console.log('- Very short certificate will expire in 1 minute');
        console.log('- Short-lived certificate will expire in 3 minutes');
        console.log('- Normal certificate will expire in 10 minutes');

        // Now we'll set up a timer to check certificates after they expire
        setTimeout(async () => {
            console.log('\n=== VALIDATING CERTIFICATES AFTER 2 MINUTES ===');

            console.log('\nValidating very short-lived certificate (should be expired):');
            console.log(await certificateService.validateCertificate(cert3.path, keyPair.publicKeyPath));

            console.log('\nValidating short-lived certificate (should still be valid):');
            console.log(await certificateService.validateCertificate(cert2.path, keyPair.publicKeyPath));

            console.log('\nValidating normal certificate (should still be valid):');
            console.log(await certificateService.validateCertificate(cert1.path, keyPair.publicKeyPath));

            // Check again after 4 minutes total
            setTimeout(async () => {
                console.log('\n=== VALIDATING CERTIFICATES AFTER 4 MINUTES ===');

                console.log('\nValidating short-lived certificate (should now be expired):');
                console.log(await certificateService.validateCertificate(cert2.path, keyPair.publicKeyPath));

                console.log('\nValidating normal certificate (should still be valid):');
                console.log(await certificateService.validateCertificate(cert1.path, keyPair.publicKeyPath));

            }, 2 * 60 * 1000); // 2 more minutes
        }, 2 * 60 * 1000); // 2 minutes
    } catch (error) {
        console.error('Error in demonstration:', error);
    }
}

// Run the demonstration
if (process.env.RUN_DEMO === 'true') {
    demonstrateCertificateSystem();
}