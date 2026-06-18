# ChatbotsHub — Multi-Tenant AI Chatbot SaaS

Production-ready multi-tenant AI knowledge chatbot platform.

## Architecture Overview

```
ChatbotsHub/
├── backend/          # Node.js + Express + TypeScript API
├── frontend/         # Next.js 14 App Router dashboard + chat widget
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, React Query, Zustand |
| Backend | Node.js, Express, TypeScript (strict), Clean Architecture |
| Database | MongoDB Atlas (free M0 tier) |
| Vector DB | Qdrant (self-hosted via Docker) |
| AI Chat | Groq API (Llama 3, free tier) |
| Embeddings | HuggingFace Inference API — `all-MiniLM-L6-v2` (free) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Hosting | Vercel (frontend) + Render/Railway (backend) |

---

## Quick Start (Development)

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- Free accounts: [MongoDB Atlas](https://cloud.mongodb.com), [Groq](https://console.groq.com), [HuggingFace](https://huggingface.co/settings/tokens)

### 1. Clone & configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in: MONGODB_URI, JWT secrets, GROQ_API_KEY, HUGGINGFACE_API_KEY

# Frontend
cp frontend/.env.local.example frontend/.env.local
```

### 2. Start Qdrant locally

```bash
docker-compose -f docker-compose.dev.yml up qdrant -d
```

### 3. Start Backend

```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000  
Backend API: http://localhost:5000  
Qdrant dashboard: http://localhost:6334/dashboard

---

## Production Deployment

### Backend (Render / Railway)

```bash
cd backend
npm run build
npm start 
```

Set all environment variables from `backend/.env.example` in your host dashboard properly .

### Frontend (Vercel)

```bash
cd frontend
# Deploy via Vercel CLI or GitHub integration
```

Set `NEXT_PUBLIC_API_URL` to your backend URL.

### Full stack with Docker

```bash
cp backend/.env.example backend/.env   # fill in values
docker-compose up -d
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register + create org |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh tokens |
| GET | `/api/auth/me` | Current user |

### Documents (requires Bearer token)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents` | List documents |
| POST | `/api/documents` | Upload document |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/documents/:id/reprocess` | Retry failed doc |

### Chat (requires `x-api-key` header)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat/query` | Ask a question |

---

## Widget Embed

Add to any website:

```html
<script
  src="https://yourdomain.com/widget.js"
  data-api-key="chk_YOUR_API_KEY"
  data-position="bottom-right"
  data-color="#6366f1">
</script>
```

---

## Plan Limits

| Plan | Documents | Monthly Queries | Max File Size |
|---|---|---|---|
| Free | 3 | 200 | 5 MB |
| Starter | 20 | 2,000 | 10 MB |
| Pro | 100 | 20,000 | 25 MB |

---

## Security Features

- Helmet security headers
- Rate limiting (global + per-endpoint)
- JWT with short-lived access tokens (15m) + refresh tokens (7d)
- API key validation for public widget
- Prompt injection guards
- File type + size validation
- Input sanitization
- CORS with allowlist
- Non-root Docker user
- Mongoose `passwordHash` field excluded from all queries by default
