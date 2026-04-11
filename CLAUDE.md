# LinkedInFlow Frontend

LinkedIn automation SaaS. Users connect LinkedIn via OAuth and create/schedule/publish posts.

## Stack
- React 18 + TypeScript + Vite (dev: `pnpm dev`, port 3000)
- Tailwind CSS + shadcn/ui + Zustand + axios + recharts + react-hook-form + zod + sonner

## Backend
Fastify on `localhost:4000`. Auth: session cookie + Bearer token (localStorage key: `auth_token`). All axios requests use `withCredentials: true`.

## Key files
| File | Purpose |
|------|---------|
| `src/lib/api.ts` | All API calls: `authAPI`, `linkedInAPI`, `postsAPI` |
| `src/store/useAuthStore.ts` | Auth state: `user`, `isAuthenticated`, `checkAuth`, `logout` |
| `src/store/useLinkedInStore.ts` | `posts[]`, `linkedInStatus`, `setPosts`, `removePost` |
| `src/App.tsx` | All routes |
| `src/components/layout/Sidebar.tsx` | Nav sections: Main / Data / Configuration |
| `src/index.css` | Design tokens: `.icon-container`, `.badge-success/warning/error`, `.card-hover` |

## Pages
- `/` → Dashboard
- `/create-post` → CreatePost (draft / publish now / schedule with datetime picker)
- `/posts` → Posts (tabs: all/draft/scheduled/published/failed, publish drafts, delete)
- `/analytics` → Analytics (real data from posts store, 4 tabs)
- `/linkedin-vault` → LinkedInVault — **keep glassmorphism style**
- `/automation` → Automation — **keep glassmorphism style**
- `/settings` → Settings
- `/api/oauth/linkedin/callback` → LinkedInCallback (outside ProtectedRoute)

## Post model
```ts
interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: 'text' | 'image' | 'link';
  link_url?: string;
  status: 'draft' | 'published' | 'failed' | 'scheduled';
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}
```

## API endpoints
```
POST   /api/signin          POST   /api/signup         POST /api/signout
GET    /api/me
POST   /linkedin/connect    POST   /linkedin/finish
GET    /linkedin/token/:id  DELETE /linkedin/token/:id
POST   /posts               GET    /posts
DELETE /posts/:id           PATCH  /posts/:id/publish
```

## UI rules
- **Dashboard, Posts, Analytics, CreatePost, Settings** → clean shadcn/ui style (no glassmorphism)
- **LinkedIn Vault, Automation** → glassmorphism style (gradient overlays, backdrop-blur) — do NOT redesign
- Never use `Math.random()` or hardcoded placeholder data in charts — compute from real posts store
- Data Management nav item is **commented out** in Sidebar — leave it that way

## Workflow
- Backend changes needed → write a prompt the user can give to their separate backend Claude agent
- User is on Windows 11, uses pnpm, VS Code
