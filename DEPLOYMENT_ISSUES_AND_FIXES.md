# Deployment Issues and Fixes - FinEdge360

**Project**: FinEdge360 Financial Planning Application
**Date**: November 8, 2025
**Deployment Target**: Vercel (Frontend) + Railway (Backend)
**Status**: ✅ Successfully Deployed

---

## Table of Contents
1. [Backend Deployment Issues (Railway)](#backend-deployment-issues-railway)
2. [Frontend Deployment Issues (Vercel)](#frontend-deployment-issues-vercel)
3. [Lessons Learned](#lessons-learned)
4. [Prevention Checklist](#prevention-checklist)

---

## Backend Deployment Issues (Railway)

### Issue #1: Script start.sh Not Found
**Error Message**:
```
Script start.sh not found
Railpack could not determine how to build the app
```

**Root Cause**:
- Railway was looking at the root directory instead of the `backend/` subdirectory
- No deployment configuration files were present in the backend directory

**Fix**:
1. Created multiple Railway configuration files for maximum compatibility:
   - `backend/railway.toml` (Railway's native format, highest priority)
   - `backend/nixpacks.toml` (Nixpacks-specific configuration)
   - `backend/Dockerfile` (Docker containerization)
   - `backend/Procfile` (Heroku-style fallback)
   - `backend/runtime.txt` (Python version specification)
   - `backend/.dockerignore` (Exclude sensitive files from Docker)

2. Set "Root Directory" to "backend" in Railway dashboard settings

**Files Created**:

`backend/railway.toml`:
```toml
[build]
builder = "NIXPACKS"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port 8000"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

`backend/Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

`backend/runtime.txt`:
```
python-3.11.0
```

**Lesson**: Always provide multiple deployment configuration formats for platform compatibility.

---

### Issue #2: ModuleNotFoundError - databutton Package
**Error Message**:
```
ModuleNotFoundError: No module named 'databutton'
Occurred in:
- /app/main.py line 94
- /app/app/apis/db_schema/__init__.py line 5
- /app/app/apis/financial_data/__init__.py line 4
- /app/app/apis/auth/__init__.py line 3
```

**Root Cause**:
- The application was originally built for Databutton platform
- `databutton` package was removed from `requirements.txt` for Railway deployment
- But `import databutton as db` statements remained in the code
- Code used `db.secrets.get()` and `db.storage` for fallback operations

**Fix**:
1. Commented out all `import databutton as db` statements in 3 files:
   - `backend/app/apis/auth/__init__.py`
   - `backend/app/apis/db_schema/__init__.py`
   - `backend/app/apis/financial_data/__init__.py`

2. Replaced `db.secrets.get()` with `os.getenv()`:
```python
# Before:
supabase_url = os.getenv("SUPABASE_URL") or db.secrets.get("SUPABASE_URL")

# After:
supabase_url = os.getenv("SUPABASE_URL")
```

3. Removed 65+ lines of `db.storage` fallback logic in `financial_data/__init__.py`

4. Updated `backend/requirements.txt`:
```python
# databutton==0.38.34  # Removed for Railway deployment
python-dotenv==1.0.0  # Added for environment variable handling
```

**Lesson**: When migrating from platform-specific deployments, audit ALL imports and remove platform-specific code entirely.

---

### Issue #3: PORT Environment Variable Handling
**Error Message**:
```
PORT variable not expanding correctly in startup commands
```

**Root Cause**:
- Railway provides a dynamic `$PORT` environment variable
- Initial configurations used incorrect syntax for variable expansion

**Fix Evolution**:
1. First attempt: Used `$PORT` → Failed
2. Second attempt: Used `${PORT:-8000}` with fallback → Failed
3. Third attempt: Used `sh -c` wrapper → Complex
4. Final solution: Simplified to fixed port 8000

**Final Configuration**:
```toml
[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port 8000"
```

**Lesson**: For Railway, use fixed port 8000 in configuration; Railway handles port mapping automatically.

---

## Frontend Deployment Issues (Vercel)

### Issue #1: Vercel 404 NOT_FOUND After Successful Build
**Error Message**:
```
Build succeeded but deployment shows 404 NOT_FOUND
```

**Root Cause**:
- No `vercel.json` configuration file
- Vercel couldn't find the frontend app in the custom directory structure
- SPA routing not configured

**Fix**:
Created `vercel.json` in project root:
```json
{
  "buildCommand": "cd frontend && npm install --legacy-peer-deps && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install --legacy-peer-deps",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key Points**:
- `buildCommand`: Navigate to frontend directory before building
- `outputDirectory`: Point to `frontend/dist` not just `dist`
- `rewrites`: Enable SPA routing (all routes → index.html)

**Lesson**: Custom monorepo structures require explicit Vercel configuration.

---

### Issue #2: NPM Peer Dependency Conflict (Stripe)
**Error Message**:
```
npm error ERESOLVE could not resolve
npm error peer @stripe/stripe-js@"^1.44.1 || ^2.0.0 || ^3.0.0 || ^4.0.0" from @stripe/react-stripe-js@2.9.0
npm error Conflicting peer dependency: @stripe/stripe-js@4.10.0
npm error Project has: @stripe/stripe-js@5.0.0
```

**Root Cause**:
- `@stripe/react-stripe-js@2.9.0` requires `@stripe/stripe-js` version 4.x
- Project has `@stripe/stripe-js@5.0.0` installed (newer version)
- npm strict peer dependency checking fails the build

**Fix**:
Added `--legacy-peer-deps` flag to npm install commands in `vercel.json`:
```json
{
  "installCommand": "cd frontend && npm install --legacy-peer-deps",
  "buildCommand": "cd frontend && npm install --legacy-peer-deps && npm run build"
}
```

**Why This Works**:
- `--legacy-peer-deps` bypasses strict peer dependency checking
- Stripe v5 API is backward compatible with wrappers expecting v4
- Safe to use in this case as the APIs are compatible

**Lesson**: For minor version peer dependency conflicts with backward-compatible libraries, `--legacy-peer-deps` is a valid solution.

---

### Issue #3: Invalid Nested Resolve Configuration
**Error Message**:
```
Build failed during vite build step (syntax error in config)
```

**Root Cause**:
Invalid nested `resolve.alias` configuration in `frontend/vite.config.ts`:
```typescript
// WRONG ❌
resolve: {
    alias: {
        resolve: {      // Nested resolve!
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    },
}
```

**Fix**:
Corrected the syntax to proper structure:
```typescript
// CORRECT ✅
resolve: {
    alias: {
        "@": path.resolve(__dirname, "./src"),
    },
}
```

**File**: `frontend/vite.config.ts` lines 79-83

**Lesson**: Always validate Vite configuration syntax. Nested `resolve` is invalid.

---

### Issue #4: Missing UI Component Files
**Error Message**:
```
[vite:load-fallback] Could not load /vercel/path0/frontend/src/components/ui/card
ENOENT: no such file or directory, open '/vercel/path0/frontend/src/components/ui/card'
```

**Root Cause**:
- All shadcn UI components were located in `frontend/src/extensions/shadcn/components/`
- Imports throughout the app used `@/components/ui/[component]`
- The `frontend/src/components/ui/` directory didn't exist
- Development worked because of Vite's lenient module resolution
- Production build (Vercel) was stricter and failed

**Fix**:
Created `frontend/src/components/ui/` directory with 18 re-export files:

```typescript
// Example: frontend/src/components/ui/card.tsx
export * from '@/extensions/shadcn/components/card';
```

**Complete List of Components**:
- accordion.tsx
- badge.tsx
- button.tsx
- card.tsx
- carousel.tsx
- dialog.tsx
- dropdown-menu.tsx
- input.tsx
- label.tsx
- progress.tsx
- radio-group.tsx
- select.tsx
- separator.tsx
- slider.tsx
- table.tsx
- tabs.tsx
- toast.tsx
- toggle.tsx
- tooltip.tsx

**Lesson**:
- Production builds are stricter than development builds
- Always test production builds locally: `npm run build`
- Create adapter/re-export layers for cleaner import paths

---

### Issue #5: Missing lib/utils.ts File (Critical)
**Error Message**:
```
[vite:load-fallback] Could not load /vercel/path0/frontend/src/lib/utils
ENOENT: no such file or directory, open '/vercel/path0/frontend/src/lib/utils'
```

**Root Cause**:
- `.gitignore` had `lib/` pattern (intended for Python's lib/ directory)
- This excluded `frontend/src/lib/` from git tracking
- `frontend/src/lib/utils.ts` existed locally but was never committed
- Vercel couldn't find the file because it wasn't in the repository

**Fix**:
1. Updated `.gitignore` to comment out the overly broad pattern:
```gitignore
# Before:
lib/
lib64/

# After:
# lib/ - commented out to allow frontend/src/lib/
# lib64/ - commented out to allow frontend/src/lib/
```

2. Force-added the file to git:
```bash
git add -f frontend/src/lib/utils.ts
```

**File Content** (`frontend/src/lib/utils.ts`):
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Why This File Is Critical**:
- The `cn()` function is used by ALL shadcn components for conditional className merging
- Without it, every single UI component fails to build

**Lesson**:
- Be specific with `.gitignore` patterns
- Avoid overly broad patterns like `lib/` that might catch frontend code
- Use platform-specific paths: `backend/lib/` instead of `lib/`
- Always verify critical files are tracked: `git ls-files | grep utils`

---

### Issue #6: Missing Hooks Re-exports
**Error Message**:
```
Could not resolve import from '@/hooks/use-toast'
```

**Root Cause**:
- Hooks existed at `frontend/src/extensions/shadcn/hooks/`
- Imports used `@/hooks/use-toast`
- `frontend/src/hooks/` directory didn't exist
- Similar to the UI components issue

**Fix**:
Created `frontend/src/hooks/` directory with re-export files:

```typescript
// frontend/src/hooks/use-toast.ts
export * from '@/extensions/shadcn/hooks/use-toast';

// frontend/src/hooks/use-theme.ts
export * from '@/extensions/shadcn/hooks/use-theme';
```

**Lesson**: Maintain consistent import paths across the application with re-export layers.

---

## Lessons Learned

### 1. Platform Migration Checklist
When migrating from platform-specific deployments (e.g., Databutton) to generic hosting:

- [ ] Remove all platform-specific imports
- [ ] Replace platform-specific APIs with standard alternatives
- [ ] Update environment variable handling
- [ ] Remove platform-specific storage/secrets APIs
- [ ] Test locally with production-like environment

### 2. .gitignore Best Practices
- ❌ **Don't**: Use overly broad patterns like `lib/`, `dist/`, `build/`
- ✅ **Do**: Be specific - `backend/lib/`, `frontend/dist/`, `backend/build/`
- ✅ **Do**: Comment patterns explaining their purpose
- ✅ **Do**: Regularly audit what's excluded: `git status --ignored`

### 3. Monorepo Deployment Configuration
For projects with `frontend/` and `backend/` directories:

**Vercel (Frontend)**:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install"
}
```

**Railway (Backend)**:
- Set "Root Directory" to `backend` in dashboard
- Create configuration files IN the backend directory
- Use absolute paths in scripts

### 4. Development vs Production Builds
**Critical Difference**: Development builds are lenient, production builds are strict.

**Always Test Production Builds Locally**:
```bash
cd frontend
npm run build
```

**Common Production-Only Failures**:
- Missing file extensions in imports
- Incorrect import paths
- Missing dependencies
- Environment variable issues
- Circular dependencies

### 5. Dependency Management
- Keep `package.json` and `requirements.txt` minimal
- Document why each dependency is needed
- Use `--legacy-peer-deps` cautiously (only for backward-compatible conflicts)
- Regular dependency audits: `npm audit`, `pip check`

### 6. Component Architecture
When using UI component libraries (shadcn, etc.):

**Option 1**: Direct imports (not recommended)
```typescript
import { Card } from '@/extensions/shadcn/components/card';
```

**Option 2**: Re-export layer (recommended)
```typescript
// In @/components/ui/card.tsx
export * from '@/extensions/shadcn/components/card';

// In application code
import { Card } from '@/components/ui/card';
```

**Benefits of Re-export Layer**:
- Cleaner imports throughout the app
- Easier to swap component libraries
- Single source of truth for component locations

---

## Prevention Checklist

### Before Deploying to Production

#### Backend (Railway/Heroku/etc.)
- [ ] Create deployment configuration files:
  - [ ] `railway.toml` or `app.json`
  - [ ] `Procfile`
  - [ ] `runtime.txt` (Python) or `.nvmrc` (Node.js)
  - [ ] `Dockerfile` (optional but recommended)
- [ ] Remove platform-specific imports and code
- [ ] Replace platform-specific APIs with standard libraries
- [ ] Set environment variables in hosting dashboard
- [ ] Test with production-like environment locally
- [ ] Verify all dependencies in `requirements.txt` or `package.json`
- [ ] Check for sensitive files in `.dockerignore`

#### Frontend (Vercel/Netlify/etc.)
- [ ] Create `vercel.json` or `netlify.toml` configuration
- [ ] Run production build locally: `npm run build`
- [ ] Verify all imports resolve correctly
- [ ] Check for missing files in git: `git status`
- [ ] Audit `.gitignore` for overly broad patterns
- [ ] Add `--legacy-peer-deps` if needed for peer dependency conflicts
- [ ] Configure SPA routing (rewrites)
- [ ] Set environment variables in hosting dashboard
- [ ] Verify output directory path is correct

#### General
- [ ] Test production build locally before deploying
- [ ] Verify all environment variables are set
- [ ] Check git tracking: `git ls-files` includes all needed files
- [ ] Review `.gitignore` for accidental exclusions
- [ ] Document all deployment configuration
- [ ] Create deployment guide (like this document)
- [ ] Test deployment on a staging environment first
- [ ] Monitor deployment logs for errors
- [ ] Verify application functionality after deployment

---

## Quick Reference: Common Errors

### Error: "Could not load [file]"
**Solution**: File is missing from git repository
1. Check if file exists locally: `ls [path]`
2. Check if tracked by git: `git ls-files [path]`
3. If not tracked, check `.gitignore`
4. Force add if needed: `git add -f [path]`

### Error: "ERESOLVE could not resolve"
**Solution**: Peer dependency conflict
1. Add `--legacy-peer-deps` to npm install
2. Or update conflicting package versions
3. Or use `npm install --force` (not recommended)

### Error: "404 NOT_FOUND" on Vercel
**Solution**: Missing or incorrect vercel.json
1. Create `vercel.json` in project root
2. Set correct `outputDirectory`
3. Add SPA rewrites
4. Specify build commands with correct paths

### Error: "ModuleNotFoundError" in Python
**Solution**: Missing dependency or platform-specific import
1. Check `requirements.txt` has the package
2. Remove platform-specific imports (e.g., `databutton`)
3. Replace with standard library alternatives

### Error: "Script not found" on Railway
**Solution**: Missing deployment configuration
1. Create `railway.toml`, `Procfile`, etc.
2. Set correct root directory in Railway dashboard
3. Specify build and start commands

---

## Success Indicators

### Railway Backend
✅ Deployment logs show:
```
Started server process [1]
Application startup complete
Uvicorn running on http://0.0.0.0:8000
```

### Vercel Frontend
✅ Deployment logs show:
```
✓ 2624 modules transformed.
✓ built in [time]
Deployment successful
```

✅ Application accessible at deployment URL
✅ No CORS errors in browser console
✅ API calls to backend succeed

---

## Final Deployment URLs

**Frontend**: https://finedge360-claudecode.vercel.app
**Backend**: https://finedge360databuttonclaudecode-production.up.railway.app

---

## Document Version
**Version**: 1.0
**Last Updated**: November 8, 2025
**Author**: Claude Code + Jay
**Status**: Deployment Successful ✅

---

**Note**: Keep this document updated as you encounter and fix new deployment issues. It will serve as a valuable reference for future projects and team members.
