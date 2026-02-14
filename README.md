# 🎨 DAILY DOODLES  
### A Full-Stack Creative Tracking Application

> A production-ready web application built with TypeScript, SQL, and Supabase, designed to help users upload and manage daily creative doodles.

🌐 **Live Demo:** daily-doodles.netlify.app 


---

## 📌 Project Overview

**DAILY DOODLES** is a full-stack web application that enables users to upload, store, and manage daily artwork entries.

This project demonstrates:

- Strong frontend fundamentals using **TypeScript & HTML**
- Backend integration using **Supabase**
- SQL database design & management
- Environment variable configuration
- Cloud deployment via Netlify
- API integration & asynchronous data handling

---

## 🏗 System Architecture

```
Frontend (TypeScript + HTML)
        │
        │ REST API Calls
        ▼
Supabase Backend
        │
        ▼
PostgreSQL (SQL Database)
```

---

## 🛠 Tech Stack

### 🔹 Frontend
- **TypeScript** (Strong typing, scalable structure)
- **HTML5**
- UI structured with assistance from Google Studio

### 🔹 Backend
- **Supabase** (Authentication, database, API layer)
- **PostgreSQL (SQL)**

### 🔹 Deployment
- **Netlify**
- CI/CD via GitHub integration

---

## ✨ Key Features

- Upload and store doodle entries
- SQL-powered data persistence
- Supabase client integration
- Secure environment variable handling
- Fully deployed production build
- Clean and modular TypeScript structure

---

## 🧠 Technical Highlights (What This Demonstrates)

- Writing type-safe frontend logic with TypeScript
- Handling asynchronous API calls
- Designing relational database tables
- Integrating third-party backend services
- Managing environment variables securely
- Deploying full-stack apps to production
- Structuring maintainable project architecture

---

## 🗄 Sample Database Schema

```sql
CREATE TABLE doodles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/your-username/daily-doodles.git
cd daily-doodles
npm install
npm run dev
```

Create a `.env` file:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📈 Future Improvements

- User authentication & authorization
- Image storage optimization
- Search & filter functionality
- Pagination for scalability
- Responsive UI improvements
- Unit & integration testing

---

## 💼 Why This Project Matters

This project showcases my ability to:

- Build and deploy a complete full-stack application
- Work with real databases (SQL/PostgreSQL)
- Integrate backend-as-a-service platforms
- Structure scalable frontend code
- Move from idea → development → deployment

---


