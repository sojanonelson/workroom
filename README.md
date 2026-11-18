# Workroom — Client & Project Workspace Hub

Workroom is an agency-grade, bespoke client and project workspace management platform designed for modern product engineering studios. Built with **Vite (React + TypeScript)** on the frontend, **Node.js (Express)** on the backend, **Render PostgreSQL** for relational persistence, and **Cloudinary** for secure document storage.

Designed with an artisan, minimal aesthetic (**no AI-template look**)—featuring clean typography, high information density, crisp status badges, and smooth workflows.

---

## Architecture & Technology Stack

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS + Lucide Icons + Axios + React Router v7
- **Backend**: Node.js + Express + JWT Authentication + bcryptjs + Multer
- **Database**: PostgreSQL (native support for Render PostgreSQL with SSL)
- **Document & Media Storage**: Cloudinary (with automatic local disk fallback if credentials are unset)

---

## Key Features & Workflows

### 1. Role-Based Access (Admin & Customer)
- **Admin**: Full authority to create projects, configure workspaces, manually adjust development status, update dynamic build links, upload invoices and technical documents, and manage payment ledgers.
- **Customer / Client**: Dedicated portal to track project development in real-time, launch live preview builds, download invoices and technical specs, inspect receiving bank details/QR codes, and submit direct transfer proofs.

### 2. Project Workspace Creation (Admin)
When creating a project workspace, the admin specifies:
- **Project Name & Category** (Web Development, Mobile App, SaaS Architecture, UI/UX Design, E-Commerce, AI Integration)
- **Client Email, Phone Number & Company Name**
- **Estimated Duration / Timeline** (e.g. `6 Weeks`, `3 Months`)
- **Development Kickoff Date**
- **Initial Project Budget & Currency** (USD, EUR, GBP, INR, CAD, AUD)
- **Payment Receive QR Code** (uploaded to Cloudinary)
- **Bank Details to Receive Payment** (Bank Name, Beneficiary Name, Account Number, IFSC/SWIFT code, UPI ID / IBAN, Payment Notes)
- **Initial Development Status**
- **Dynamic Build Link** (optional initial deployment link)

### 3. Shareable Client Invite Link & Onboarding
- Each workspace generates a unique, secure invitation token (`/invite/:token`).
- **Client Journey**:
  1. Client clicks the link: if not logged in, prompted to **Create Account** or **Log In** with their pre-filled email.
  2. **Declaration Form**: Client is presented with formal terms & conditions and project scope. Client inputs their legal name and confirms acceptance.
  3. **Immediate Kickoff Notice**: Upon acceptance, the workspace immediately displays:
     > **"Declaration Accepted — Project Development Will Start ASAP"**
  4. Real-time development status window is displayed with milestone logs and documents.

### 4. Dynamic Live Development Build Link
- Admin can dynamically add or update a live staging/preview build link from the workspace header at any time.
- The link syncs instantly to the customer's status window with a prominent **"Launch Staging Preview"** action button.

### 5. Document Vault (Cloudinary Storage)
- Categorized document storage for:
  - **Invoices & Billing Statements**
  - **Project Budget & Cost Breakdowns**
  - **Technical Documents & Architecture Specs**
  - **Contracts, SOWs & NDAs**
- Uploaded files stream directly to Cloudinary and are timestamped and accessible to the client.

### 6. Payment Routing & Direct Payment Ledger
- Customers can view bank transfer details (with one-click account copying) and scan the payment QR code.
- **Offline / Direct Bank Transfer Support**: If a client pays via bank wire or direct cash, the admin can manually record the transaction details (Amount, Currency, Date, Reference/UTR ID, Cloudinary receipt upload, Notes).
- Clients can also submit payment proof / reference for admin verification.

### 7. Multi-Project Management for Clients
- Clients can log into their **Client Projects Portal** (`/portal`) to view and manage all projects created for their account.

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/sojanonelson/workroom.git
cd workroom

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

#### Backend (`server/.env`):
Create or edit `server/.env` (see `server/.env.example`):

```ini
PORT=5001
NODE_ENV=development

# Neon PostgreSQL connection string (Direct or Pooled)
# Example: postgresql://workroom_owner:npg_secret@ep-cool-fog-123456.us-east-2.aws.neon.tech/workroom?sslmode=require
DATABASE_URL=postgresql://workroom_owner:password@ep-xxxx.us-east-2.aws.neon.tech/workroom?sslmode=require
DB_SSL=true

# Authentication secret
JWT_SECRET=workroom_super_secure_enterprise_key_2026_change_me

# Default Admin credentials (auto-seeded on first run)
DEFAULT_ADMIN_NAME="Workroom Lead Admin"
DEFAULT_ADMIN_EMAIL="admin@workroom.io"
DEFAULT_ADMIN_PASSWORD="Admin@123"

# Admin registration secret
ADMIN_SIGNUP_SECRET="workroom_admin_2026"

# Cloudinary credentials (optional: falls back to local uploads if unset)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (`client/.env`):
Create or edit `client/.env` (see `client/.env.example`):

```ini
VITE_API_URL=http://localhost:5001/api
```

---

## Running the Application

### Start the Backend Server:
```bash
cd server
npm run dev
# Server listens on http://localhost:5001
```

### Start the Vite Frontend:
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5174 (or 5173)
```

---

## Default Seeded Admin Credentials

On first database connection, Workroom seeds the following default admin:
- **Email**: `admin@workroom.io`
- **Password**: `Admin@123`
- **Admin Passcode Secret (for registering new admins)**: `workroom_admin_2026`

---

## Database Schema (PostgreSQL)

- `users`: User profiles with roles (`admin`, `customer`), hashed passwords, company and phone details.
- `projects`: Workspace configurations, development status, dynamic build links, invite tokens, declaration records, budget, and bank details.
- `project_updates`: Chronological milestone updates and status snapshots.
- `project_documents`: File URLs (Cloudinary), categories (`invoice`, `budget`, `technical`, `contract`), and metadata.
- `transactions`: Payment ledger records, verification status (`verified`, `pending`, `rejected`), payment methods, and receipts.

---

## License
MIT © 2026 Workroom
