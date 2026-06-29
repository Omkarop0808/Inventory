<h1 align="center">Mezenga Inventory & Homestay Management</h1>

<p align="center">
  <strong>A premium, full-stack platform for managing properties, rooms, and guest bookings.</strong>
</p>

<p align="center">
  <a href="https://inventory-five-sigma.vercel.app/"><strong>View Live Demo</strong></a>
</p>

---

## 🚀 Overview

Mezenga Inventory is a modern web application designed to streamline homestay and property management. It provides a seamless experience for both guests (to view and book properties) and administrators (to manage inventory, track bookings, and oversee operations). 

The platform features a premium UI/UX redesign with smooth micro-animations, glassmorphism aesthetics, and a fully responsive layout.

## ✨ Key Features

- **Authentication:** Secure Google Sign-in powered by Firebase Authentication.
- **Role-Based Access:** Distinct experiences for Guests (browsing, booking) and Admins (dashboard, inventory management).
- **Property Management:** Complete CRUD operations for Properties and Rooms.
- **Booking Engine:** Real-time booking system with date validation and availability checking.
- **Premium Design:** Built with modern design principles utilizing Tailwind CSS, Framer Motion, and Magic UI.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion, Magic UI
- **Routing:** React Router v7
- **HTTP Client:** Axios (with automatic token interceptors)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ORM)
- **Security:** Firebase Admin SDK (JWT verification)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or MongoDB Atlas)
- Firebase Project (for Authentication)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Omkarop0808/Inventory.git
   cd Inventory
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="your_firebase_private_key"
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

- **Frontend:** Deployed on **Vercel** for global CDN edge delivery.
- **Backend:** Deployed on **Render** to maintain a persistent connection to MongoDB.

## 📄 License
This project is for assignment submission purposes.
