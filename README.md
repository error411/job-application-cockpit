# ApplyEngine 🚀  
A full-stack job application tracking platform designed to help users stay organized, follow up consistently, and improve their chances of landing interviews.

🔗 Live: https://apply-engine.com

---

## 🧠 Why This Exists

Most job trackers are glorified spreadsheets.

ApplyEngine is built to:
- Guide users through the application process
- Encourage consistent follow-up
- Provide visibility into what’s working (and what’s not)

The goal is simple: **help users convert more applications into interviews.**

---

## ⚙️ Core Features

### 📌 Structured Onboarding
- Step-by-step setup for new users
- Reduces friction and improves activation

### 📊 Job Tracking + Scoring
- Track applications across stages
- Score opportunities based on quality and fit

### 📈 Reporting Dashboard
- 7 / 30 / 90 day insights
- Identify stuck or underperforming opportunities

### ✉️ Follow-Up System
- Built-in email follow-up workflows
- Helps users stay consistent without manual tracking

### 💳 Subscription System
- Free trial → paid conversion flow
- Integrated with Stripe

---

## 🏗 Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS

**Backend**
- Supabase (Postgres, Auth, Edge Functions)

**Infrastructure**
- Vercel (hosting + deployments)
- Stripe (payments + subscriptions)

---

## 🧩 Architecture Notes

- Server components for performance + data fetching
- Supabase for auth + database + API layer
- Modular UI components for scalability
- API routes for application actions (tracking, follow-ups, reporting)

---

## 📸 Screenshots

_(Add screenshots here — dashboard, onboarding, job tracker, reports)_

---

## 🚧 Roadmap

- Improved onboarding (guided UX, tooltips, progress indicators)
- Advanced reporting (conversion rates, trends)
- AI-assisted resume + application tools
- Email deliverability + tracking improvements

---

## 🧪 Local Development

```bash
git clone https://github.com/error411/job-application-cockpit
cd job-application-cockpit
npm install
npm run dev