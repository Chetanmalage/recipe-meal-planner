# 🍲 Arshiya's Recipe Sharing & Meal Planning Platform

A full-stack MERN application for discovering, sharing, and planning recipes.

## ✨ Features

- 🔐 **Authentication** — JWT-based register/login with bcrypt hashing
- 📖 **Recipe CRUD** — Create, read, update, delete recipes with image uploads
- 🔍 **Search & Filter** — Real-time search + category filters with pagination
- ❤️ **Favourites** — Save and manage favourite recipes
- 📅 **Weekly Meal Planner** — Plan meals for all 7 days
- 👑 **Admin Dashboard** — Manage users and recipes with stats
- 🌗 **Dark/Light Theme** — Toggle with persistence
- 📱 **Fully Responsive** — Mobile-first design with Bootstrap 5
- ⚡ **Lazy Loading** — Code-split routes for fast initial load
- 🛡️ **Security** — Helmet, rate limiting, sanitization, XSS protection

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, React Router, Bootstrap 5, Axios, React Toastify
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Multer, Cloudinary
**Deployment:** Vercel (frontend), Render/Railway (backend), MongoDB Atlas (database)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (optional, for image uploads)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/recipe-meal-planner.git
cd recipe-meal-planner

# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
