# Claude Instructions — Flow AI (MERN + AI)

## Stack

**Frontend:** React 19 (JSX), Vite, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query, React Hook Form, Zod, socket.io-client, Lucide icons
**Backend:** Node.js, Express 5, Mongoose 8, Zod, JSON Web Tokens (jsonwebtoken), bcryptjs, socket.io
**Database:** MongoDB Atlas
**Auth:** Custom JWT (email/password with bcrypt hashing)
**AI:** Anthropic Claude via `@ai-sdk/anthropic` + Vercel AI SDK (`streamText`, `generateText`)
**Email:** Resend
**Real-time:** Socket.io (rooms per project)
**Deploy:** Frontend → Vercel, Backend → Render (or Railway)

**Never use:** Redux, Axios (use `fetch`), class components, callback-style async (use async/await), `var`, direct AI API calls from the client.

---

## Folder Structure

```
/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # shadcn — never edit directly
│   │   │   ├── shared/            # reusable across features
│   │   │   └── [feature]/         # feature-scoped (dashboard/, project/, task/, ai/)
│   │   ├── pages/                 # one file per route
│   │   ├── hooks/                 # custom React hooks (useProjects, useTasks, useAiSuggestTasks, ...)
│   │   ├── store/                 # Zustand stores (authStore, uiStore)
│   │   ├── lib/
│   │   │   ├── api.js             # fetch wrapper + base URL + auth header
│   │   │   ├── socket.js          # socket.io-client singleton
│   │   │   ├── validations/       # Zod schemas — mirror the server ones
│   │   │   └── utils.js           # cn() + misc helpers
│   │   └── config/                # constants, prompts (if client prompts needed)
│   └── .env
│
└── server/                        # Express backend
    ├── routes/                    # one file per resource (authRoutes.js, projectRoutes.js, ...)
    ├── controllers/               # business logic — one per resource (authController.js, ...)
    ├── models/                    # Mongoose schemas (User.model.js, Project.model.js, Task.model.js)
    ├── middleware/
    │   ├── auth.js                # JWT verification
    │   ├── validate.js            # Zod request validation
    │   ├── asyncHandler.js        # wraps async handlers
    │   └── errorHandler.js        # global error handler
    ├── lib/
    │   ├── db.js                  # MongoDB connection
    │   ├── ai.js                  # Anthropic client + streaming helpers
    │   ├── email.js               # Resend client + send helpers
    │   ├── socket.js              # socket.io server setup
    │   └── authz.js               # canEdit / canView / isOwner helpers
    ├── validations/               # Zod schemas shared by middleware
    ├── config/                    # prompts.js (AI system prompts) + constants
    └── server.js                  # Express app entry point
```

---

## Naming
- Components: PascalCase (`TaskCard.jsx`)
- Hooks: camelCase, `use` prefix (`useCurrentUser`)
- Files (utils/hooks/routes/controllers): camelCase (`authMiddleware.js`)
- Controllers: verb-first (`createProject`, `deleteTask`)
- Zod schemas: camelCase + `Schema` suffix (`createProjectSchema`)
- Mongoose models: PascalCase singular, file ends in `.model.js` (`User.model.js`)
- Constants: SCREAMING_SNAKE_CASE
- Routes: kebab-case (`/api/projects/:id/members`)

---

## Rules

**React Components**
- Functional components only. Keep under 150 lines — split if larger.
- Use `cn()` from `lib/utils.js` for conditional classes.
- Use TanStack Query for all server data — never `useEffect + fetch`.
- Use Zustand only for UI state (auth token, modals, sidebar, theme). Never for server data.
- Use shadcn/ui primitives for buttons, dialogs, forms, dropdowns, etc. Never edit files under `components/ui/` by hand — regenerate via the CLI.

**Forms**
- Always React Hook Form + `@hookform/resolvers/zod`.
- The Zod schema used on the client must mirror the one on the server. If they drift, fix the client to match the server.

**Auth (JWT)**
- Frontend: token stored in Zustand `authStore` (persisted to `localStorage`). `<ProtectedRoute>` wraps authenticated routes and redirects to `/login` if no token.
- Every protected API call sends `Authorization: Bearer <token>` via the `lib/api.js` fetch wrapper.
- Backend: `auth` middleware verifies JWT on every protected route, attaches `req.user = { id, email }`.
- Never trust client-sent user IDs — always read from `req.user`.
- Passwords are hashed with bcryptjs in a Mongoose `pre('save')` hook. `User.comparePassword(plain)` is the only way to verify.

**Express Backend**
- Route ordering is always: `auth → validate → controller`.
- Every async controller is wrapped with `asyncHandler`.
- Validate all request bodies with Zod via the `validate` middleware.
- Consistent response envelope: `{ success: true, data }` or `{ success: false, error: { message, code? } }`.
- Never expose raw Mongoose/Mongo errors to the client — normalize in the global `errorHandler`.

**MongoDB / Mongoose**
- Schemas live in `server/models/`. Always `{ timestamps: true }`.
- Index any field you query by (`email`, `projectId`, `owner`).
- Use `.lean()` for read-only queries.
- Never return full documents — select only needed fields or shape via a `toClient()` helper.
- Never store raw passwords — bcrypt only.

**AI Features**
- All AI calls go through the Express backend. Anthropic API key never leaves the server.
- Text/chat responses must **stream** (`streamText`) whenever the user is waiting on visible output.
- Use `generateText` for one-shot structured outputs (prioritization, categorization).
- All system prompts live in `server/config/prompts.js` as named exports.
- Sanitize user input before sending to Claude (strip control chars, cap length).
- Every AI UI must show: loading state, streaming state (tokens appearing), and error state (toast on failure).

**Real-time (Socket.io)**
- One socket.io server attached to the same HTTP server as Express.
- Auth via JWT in the socket handshake (`socket.handshake.auth.token`). Reject unauthenticated connections.
- Rooms = project IDs. Client emits `join:project` with `projectId` → server verifies membership → joins room.
- After any task/project mutation, emit to the project room (`task:created`, `task:updated`, `task:deleted`, `project:updated`, `member:added`, `member:removed`).
- On the client, the `useProjectRealtime(projectId)` hook joins the room and invalidates the relevant TanStack Query caches when events fire. Do not try to patch the cache manually.

**Email (Resend)**
- All sends go through `server/lib/email.js`. Never import `Resend` directly in controllers.
- Respect `user.preferences.notifications` before sending anything non-transactional.
- In dev, `RESEND_FROM=onboarding@resend.dev` works without a verified domain.

**Error Handling**
- Backend: global `errorHandler.js` catches everything, logs server-side, returns a friendly `{ success: false, error }` payload.
- Frontend: TanStack Query `onError` + shadcn `toast` — always show a human-readable message, never raw error objects.

**Env**
- `VITE_` prefix = browser-safe. Never put secrets in them.
- Server secrets stay in `server/.env` only. Never commit `.env`.
- Required client: `VITE_API_URL`, `VITE_SOCKET_URL`.
- Required server: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `CORS_ORIGIN`, `CLIENT_URL`.

---

## Decision Tree

```
Data needed on frontend?
  Server data (users, projects, tasks) → TanStack Query → Express API
  UI-only state                        → useState or Zustand

Form submission?
  Always → React Hook Form + Zod → POST via lib/api.js

Backend route order?
  Always → auth middleware → validate middleware → asyncHandler(controller)

Auth check?
  Frontend  → <ProtectedRoute> wrapper, token from Zustand
  Backend   → auth middleware on every protected route
  Never     → trust client-sent user IDs (always use req.user)

AI response?
  Streaming text        → streamText   → stream to frontend
  One-shot structured   → generateText → JSON parse
  All prompts           → server/config/prompts.js

Real-time update needed?
  Mutation on server → emit to project room
  Client             → useProjectRealtime(projectId) invalidates queries

New feature checklist?
  1. Zod schema in server/validations/ (mirror in client/src/lib/validations/)
  2. Mongoose model in server/models/ if new resource
  3. Express route + controller (auth → validate → asyncHandler(controller))
  4. TanStack Query hook on frontend
  5. Component in client/src/components/[feature]/
  6. Socket events if it mutates shared state
```
