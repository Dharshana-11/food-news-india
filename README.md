# Food Compliance & Services Platform

A web platform that connects **food businesses** with **service providers** for compliance management.  
Food businesses can manage their documents, submit compliance requests, and interact with service providers.

---

## Features

### User Roles

- **Super Admin** – manages platform and monitors users.
- **Admin** – manages service providers and food business accounts.
- **Service Providers** – register and provide compliance services.
- **Food Businesses** – register, upload documents, and request services.

### Authentication & Authorization

- Firebase authentication for secure login.
- Role-based access control using middleware.

### Dashboard

- Super Admin & Admin dashboards for user management.
- Food business dashboard to manage documents and requests.
- Service provider dashboard to track requests.

### Compliance Requests

- Food businesses can request services from registered service providers.
- Providers can respond and update the status of requests.

### Document Management

- Secure document uploads for food businesses.
- Admin can review submitted documents.

---

## Tech Stack

- **Frontend:** ReactJS, Ant Design, Tailwind CSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Firebase Auth
- **Hosting/Deployment:** Vite (frontend), Node server for backend

---

## Installation

### Backend

```bash
cd server
npm install
cp .env.example .env
# Add your MongoDB URI and Firebase key path to .env
node seedSuperAdmin.js  # optional: seed super-admin user
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Project Structure

client/ # React frontend
├─ components/
├─ context/
├─ pages/
├─ assets/
└─ AppRoutes.jsx

server/ # Node + Express backend
├─ controllers/
├─ middleware/
├─ models/
├─ routes/
└─ config/db.js

---

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push to branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Create a pull request.

---

## License

© 2025 Your Company / Your Name. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, in whole or in part, is strictly prohibited. See [LICENSE](LICENSE) for details.
