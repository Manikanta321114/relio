# Relio Marketplace MVP 🚀

Relio is a premium, admin-controlled used-book marketplace. It enables sellers to upload used books, allows an admin to verify and approve listings, and lets buyers seamlessly express interest in purchasing.

![Relio Banner Placeholder](https://via.placeholder.com/1200x400?text=Relio+Marketplace+MVP)

## 🌟 Key Features

*   **Seller Upload Flow**: Multi-step wizard with live Cloudinary image uploading and progress states.
*   **Marketplace Browser**: Real-time searching, category filtering, and sorting of approved books.
*   **Admin Dashboard**: Dedicated control panel for approving/rejecting books and tracking order lifecycles.
*   **Optimized Performance**: Code-splitting, React Suspense, and debounced search APIs.
*   **Global Error Handling**: Fallback UI boundaries and network interceptors for a seamless user experience.

---

## 🛠 Tech Stack

**Frontend**
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Routing**: React Router DOM v6
*   **State / Network**: Axios, React Context

**Backend**
*   **Framework**: FastAPI (Python)
*   **Database**: MongoDB Atlas (Motor Asyncio)
*   **Auth**: JWT (JSON Web Tokens)
*   **Storage**: Cloudinary

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/relio.git
cd relio
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Copy `.env.example` to `.env` and fill in your MongoDB and Cloudinary credentials.
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Copy `.env.example` to `.env` and verify the `VITE_API_URL` points to your local backend.
```bash
npm run dev
```

---

## 🚀 Deployment Guide

### 1. MongoDB Atlas (Database)
1.  Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  In Network Access, allow access from anywhere (`0.0.0.0/0`) for production.
3.  Copy the connection string to your Backend `.env`.

### 2. Cloudinary (Storage)
1.  Sign up for [Cloudinary](https://cloudinary.com/).
2.  Enable "Unsigned Uploads" in your Upload Presets.
3.  Add the Cloud Name and Preset to your Frontend `.env`. Add API keys to your Backend `.env`.

### 3. Render (Backend Deployment)
1.  Connect your GitHub repository to [Render](https://render.com/).
2.  Create a new **Web Service**.
3.  **Build Command**: `pip install -r requirements.txt`
4.  **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
5.  Add all environment variables from your `backend/.env`.

### 4. Vercel (Frontend Deployment)
1.  Connect your GitHub repository to [Vercel](https://vercel.com/).
2.  Vercel automatically detects Vite.
3.  Add environment variables from `frontend/.env`.
4.  (Optional) Ensure `vercel.json` is at the root of `frontend/` to handle React Router rewrites.
5.  Deploy.

---

## ✅ Production Testing Checklist

**Auth & Security**
- [ ] User can register and login.
- [ ] JWT tokens expire and gracefully force re-login.
- [ ] Non-admin accounts cannot access `/admin` routes.

**Seller Flow**
- [ ] Seller can upload front and back images.
- [ ] Progress bar correctly simulates upload.
- [ ] Uploaded books appear in "My Uploads" with `Pending Review` status.

**Admin Flow**
- [ ] Admin dashboard displays correct metrics.
- [ ] Admin can approve a book; the card vanishes instantly (Optimistic UI).
- [ ] Admin can track orders and update lifecycle statuses.

**Marketplace & Buyer Flow**
- [ ] ONLY approved books appear publicly.
- [ ] Search input debounces properly.
- [ ] Buyer cannot click "Interested" on their own book.
- [ ] Prevent duplicate "Interested" clicks from the same buyer on the same book.

**Resilience**
- [ ] Turning off internet displays the "Connection Lost" screen.
- [ ] Invalid routes display the cinematic 404 Page.
- [ ] Mobile navigation works flawlessly.
