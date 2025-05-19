
// Helper function to display results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.textContent = typeof data === 'object' ?
        JSON.stringify(data, null, 2) : data.toString();
}

// Generate Key Pair
document.getElementById('generateKeyBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/key-pairs', {
            method: 'POST'
        });
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        displayResults(`Error: ${error.message}`);
    }
});

// Issue Certificate
document.getElementById('issueCertBtn').addEventListener('click', async () => {
    try {
        const subject = document.getElementById('subject').value;
        const validityMinutes = document.getElementById('validity').value;
        const privateKeyPath = document.getElementById('privateKeyPath').value;

        if (!subject || !validityMinutes) {
            return displayResults('Error: Subject and validity are required');
        }

        const response = await fetch('/api/certificates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject,
                validityMinutes,
                privateKeyPath: privateKeyPath || null
            })
        });

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        displayResults(`Error: ${error.message}`);
    }
});

// Validate Certificate
document.getElementById('validateCertBtn').addEventListener('click', async () => {
    try {
        const certificatePath = document.getElementById('certificatePath').value;
        const publicKeyPath = document.getElementById('publicKeyPath').value;

        if (!certificatePath || !publicKeyPath) {
            return displayResults('Error: Certificate path and public key path are required');
        }

        const response = await fetch('/api/certificates/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                certificatePath,
                publicKeyPath
            })
        });

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        displayResults(`Error: ${error.message}`);
    }
});

// Validate by Subject
document.getElementById('validateSubjectBtn').addEventListener('click', async () => {
    try {
        const subject = document.getElementById('validateSubject').value;

        if (!subject) {
            return displayResults('Error: Subject is required');
        }

        const response = await fetch(`/api/certificates/validate/${encodeURIComponent(subject)}`);
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        displayResults(`Error: ${error.message}`);
    }
});
