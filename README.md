# Modern Blog & Discussion Platform

A full-stack, feature-rich blogging and interactive discussion platform built with **Next.js 15 (App Router)**, **React 19**, **Prisma ORM**, and **Tailwind CSS**.

---

## 🌟 Key Features

- **📝 Rich Markdown & Code Authoring**: Full Markdown support including code syntax highlighting and live Mermaid diagram rendering.
- **🔍 Interactive Feed & Filtering**: Real-time post search, tag filtering, and cursor-based infinite/paginated feed loading powered by React `useTransition`.
- **💬 Nested Comment System**: Multi-threaded, nested comment discussions with reply support on every blog post.
- **🔐 User Authentication**: Secure authentication powered by NextAuth.js and Prisma Adapter.
- **🎨 Animated & Responsive UI**: Smooth UI transitions powered by Framer Motion, Lucide icons, and Radix UI primitives.
- **🖼️ Profile & Avatar Uploader**: User profile management featuring client-side image cropping and avatar uploads.
- **🌙 Dark Mode Support**: Native dark/light mode switching using `next-themes`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Server Actions)
- **UI Library**: [React 19](https://react.dev/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling & Animations**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Markdown & Diagramming**: [react-markdown](https://github.com/remarkjs/react-markdown), [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter), [Mermaid](https://mermaid.js.org/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js 18+ installed and a running PostgreSQL database instance.

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd blog-site
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and set the required variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blog_db?schema=public"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Optional Cloudinary / Storage credentials if configuring image uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Database Setup

Run Prisma migrations to sync your database schema:

```bash
npx prisma db push
# or
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 📁 Project Structure

```text
├── actions/             # Next.js Server Actions (posts, comments, users)
├── app/                 # Next.js App Router pages and API routes
│   ├── api/             # API handlers (NextAuth, upload, etc.)
│   ├── posts/           # Post views and creation pages
│   ├── profile/         # User profile management
│   └── page.tsx         # Home feed
├── components/          # Reusable UI components & animations
│   ├── ui/              # Base Shadcn/Radix UI elements
│   ├── animations/      # Framer Motion animated components
│   └── InteractiveFeed.tsx
├── prisma/              # Prisma schema & migrations
├── utils/               # Auth options, markdown helpers, utilities
└── public/              # Static assets
```

---

## 📜 Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Generates Prisma client and builds the application for production.
- `npm run start`: Runs the built production application.
- `npm run lint`: Runs ESLint check.
