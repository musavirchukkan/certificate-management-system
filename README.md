# Certificate Management System

A comprehensive Node.js application for generating, issuing, and validating digital certificates with customizable validity periods.

## Features

- RSA public/private key pair generation
- Certificate issuance with configurable validity periods
- Certificate validation and expiration checking
- PostgreSQL database integration for certificate storage
- RESTful API for programmatic access
- Browser-based user interface
- Demonstration mode to showcase certificate expiration

## Prerequisites

- Node.js 14.x or higher
- PostgreSQL 12.x or higher
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/musavirchukkan/certificate-management-system.git
   cd certificate-management-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following configuration:

   ```
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=certificate_system

   # Application Configuration
   PORT=3000
   KEY_DIR=./keys
   CERT_DIR=./certificates
   ```

4. Set up the PostgreSQL database:

   ```bash
   psql -U postgres -c "CREATE DATABASE certificate_system;"
   ```

5. Initialize the database tables:

   ```sql
   CREATE TABLE key_pairs (
     id SERIAL PRIMARY KEY,
     private_key_path VARCHAR(255) NOT NULL,
     public_key_path VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE certificates (
     id SERIAL PRIMARY KEY,
     subject VARCHAR(255) NOT NULL,
     issuer VARCHAR(255) NOT NULL,
     issued_at TIMESTAMP NOT NULL,
     expires_at TIMESTAMP NOT NULL,
     validity_minutes INTEGER NOT NULL,
     certificate_path VARCHAR(255) NOT NULL,
     key_pair_id INTEGER REFERENCES key_pairs(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on port 3000 (or the port specified in your `.env` file). You can access the web interface at http://localhost:3000.

### Running the Demonstration

```bash
npm run demo
```

The demonstration will:

- Generate a new key pair
- Issue three certificates with different validity periods (1, 3, and 10 minutes)
- Validate all certificates immediately
- Wait 2 minutes and validate again (1-minute certificate should expire)
- Wait 2 more minutes and validate again (3-minute certificate should expire)

## API Endpoints

The system provides a RESTful API:
use: `certificate-managment.postman_collection.json`

### Key Pairs

- **POST /api/key-pairs** - Generate a new key pair

### Certificates

- **POST /api/certificates** - Issue a new certificate

  ```json
  {
    "subject": "example.com",
    "validityMinutes": 60,
    "privateKeyPath": "/path/to/private_key.pem" // Optional
  }
  ```

- **GET /api/certificates** - List all certificates

- **POST /api/certificates/validate** - Validate a certificate

  ```json
  {
    "certificatePath": "/path/to/certificate.json",
    "publicKeyPath": "/path/to/public_key.pem"
  }
  ```

- **GET /api/certificates/validate/:subject** - Validate a certificate by subject

## Web Interface

The web interface provides an easy way to interact with the system:

- **Generate Key Pair**: Create new public/private key pairs
- **Issue Certificate**: Issue certificates with custom validity periods
- **Validate Certificate**: Validate certificates using file paths
- **Validate by Subject**: Validate the most recent certificate for a given subject

## Certificate Structure

Certificates are stored as JSON files with the following structure:

```json
{
  "data": {
    "subject": "example.com",
    "issuedAt": "2025-05-19T12:00:00.000Z",
    "expiresAt": "2025-05-19T12:10:00.000Z",
    "issuer": "Certificate Authority Demo",
    "validityMinutes": 10
  },
  "signature": "base64_encoded_signature"
}
```

## Security Considerations

This system implements several security measures:

- RSA 2048-bit encryption for key pairs
- SHA-256 for certificate signatures
- Rate limiting to prevent API abuse
- Helmet.js for HTTP security headers

However, this is primarily a demonstration system and may require additional security enhancements for production use, such as:

- User authentication and authorization
- Certificate revocation
- Hardware security modules (HSM) for key storage
- Audit logging

## Directory Structure

```
certificate-management-system/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── models/       # Database models
│   ├── public/       # Static files (HTML, CSS, JS)
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── utils/        # Utility functions
├── keys/             # Storage for key pairs
├── certificates/     # Storage for certificates
├── .env              # Environment variables
├── index.js          # Application entry point
└── package.json      # Project metadata
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Node.js crypto module for cryptographic operations
- Express.js for the web framework
- PostgreSQL for database storage
