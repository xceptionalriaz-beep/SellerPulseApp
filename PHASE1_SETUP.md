# 🚀 Riazify — Phase 1 Setup Guide

## Step 1 — Create Next.js Project

Open terminal in your VS Code and run:

```bash
npx create-next-app@14 riazify \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When prompted, say **Yes** to all defaults.

---

## Step 2 — Replace Generated Files

Copy all the files provided into your project, replacing the auto-generated ones:

| File | Action |
|------|--------|
| `package.json` | Replace |
| `tailwind.config.ts` | Replace |
| `app/layout.tsx` | Replace |
| `app/globals.css` | Replace |
| `app/page.tsx` | Replace |
| `middleware.ts` | Add (new file) |
| `lib/supabase.ts` | Add (new file) |
| `lib/utils.ts` | Add (new file) |
| `types/database.ts` | Add (new file) |
| `next.config.js` | Replace |
| `vercel.json` | Add (new file) |

---

## Step 3 — Install Dependencies

```bash
cd riazify
npm install
```

---

## Step 4 — Create Environment File

Create `.env.local` in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ohgejewwsnbyouozymcc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Riazify
```

> 🔑 Get your keys from: Supabase Dashboard → Project Settings → API

---

## Step 5 — Install @supabase/ssr

```bash
npm install @supabase/ssr @supabase/supabase-js
```

---

## Step 6 — Run Dev Server

```bash
npm run dev
```

Open `http://localhost:3000` — you should see a redirect to `/auth/login`
(the login page doesn't exist yet — that's Phase 2).

---

## ✅ Phase 1 Checklist

- [ ] Next.js 14 project created
- [ ] All files replaced/added
- [ ] `npm install` completed with no errors
- [ ] `.env.local` created with Supabase keys
- [ ] `npm run dev` runs without errors
- [ ] Browser shows redirect (even if login page is blank, that's fine)

---

## 📁 Final Folder Structure After Phase 1

```
riazify/
├── app/
│   ├── globals.css          ✅
│   ├── layout.tsx           ✅
│   └── page.tsx             ✅
├── lib/
│   ├── supabase.ts          ✅
│   └── utils.ts             ✅
├── types/
│   └── database.ts          ✅
├── components/              (empty — filled in Phase 3)
├── hooks/                   (empty — filled in Phase 2)
├── middleware.ts             ✅
├── tailwind.config.ts        ✅
├── next.config.js            ✅
├── vercel.json               ✅
├── .env.local                ✅ (you create this)
├── .gitignore                ✅
└── package.json              ✅
```

---

## 🔜 Next: Phase 2 — Auth System

Once Phase 1 is confirmed working, share these Dart files:
- `lib/pages/login_page.dart`
- `lib/pages/signup_page.dart`
- `lib/auth_gate.dart`
- `lib/widgets/app_toast.dart`
- `lib/services/session_tracker.dart`
