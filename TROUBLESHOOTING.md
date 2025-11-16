# FinEdge360 - Troubleshooting Guide

**Purpose**: Quick solutions to common issues
**Last Updated**: 2025-11-16
**Project**: FinEdge360 Financial Planning Platform

---

## 🚨 "App Not Loading" or Blank Page

### Symptoms
- Browser shows blank page
- "Cannot connect" error
- Page loads but shows no content

### Checklist (Try in order)

#### ✅ Step 1: Verify Servers Are Running

**Frontend Server**:
```bash
# Check if port 5173 is in use
netstat -ano | findstr "5173"

# If nothing shows, start the server:
cd frontend
npm run dev

# Should see: "Local: http://localhost:5173/"
```

**Backend Server**:
```bash
# Check if port 8000 is in use
netstat -ano | findstr "8000"

# If nothing shows, start the server:
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Should see: "Uvicorn running on http://0.0.0.0:8000"
```

#### ✅ Step 2: Check Browser Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for errors:

**Common Errors & Solutions**:

| Error | Cause | Solution |
|-------|-------|----------|
| `net::ERR_CONNECTION_REFUSED` | Backend not running | Start backend server |
| `Failed to fetch` | CORS issue | Check CORS configuration |
| `404 Not Found` | Wrong URL | Verify routes in vite.config.ts |
| `Mixed Content` | HTTP in HTTPS | Use HTTPS backend in production |

#### ✅ Step 3: Hard Refresh Browser

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

#### ✅ Step 4: Clear Browser Cache

```
Windows/Linux: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
```

#### ✅ Step 5: Check Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests (red status codes)

**Status Code Meanings**:
- `200 OK` - Success ✅
- `404 Not Found` - Endpoint doesn't exist
- `500 Internal Server Error` - Backend error
- `CORS error` - CORS misconfiguration

---

## 🔌 Backend API Not Responding

### Symptoms
- API calls fail with errors
- Data not loading in UI
- Console shows fetch errors

### Solutions

#### Check 1: Verify Backend is Running
```bash
curl http://localhost:8000/openapi.json
# Should return JSON with API documentation
```

#### Check 2: Test Specific Endpoint
```bash
# Replace {user_id} with actual user ID
curl http://localhost:8000/routes/get-profile/{user_id}
```

#### Check 3: Check Backend Logs
Look in terminal where backend is running for:
- Python errors
- Supabase connection errors
- CORS messages

#### Check 4: Verify Environment Variables
```bash
# Check if .env file exists
ls backend/.env

# Verify it contains:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - OPENAI_API_KEY (if using AI features)
```

---

## 🗺️ Journey Map Not Showing Progress

### Symptoms
- Journey Map page loads but shows 0% progress
- All milestones locked
- No XP displayed

### Solutions

#### Check 1: Verify User Has Data
```bash
# Check if user has financial data
curl http://localhost:8000/routes/get-financial-data/{user_id}

# Should return JSON with assets, liabilities, goals
```

#### Check 2: Check Browser Console
Look for:
- API errors fetching financial data
- API errors fetching risk assessment
- Retry messages (normal - up to 3 retries)

#### Check 3: Verify API Endpoints
Journey Map requires these endpoints:
- ✅ `/routes/get-financial-data/{user_id}`
- ✅ `/routes/get-risk-assessment/{user_id}`
- ✅ `/routes/get-sip-planner/{user_id}`

Test each endpoint individually.

#### Check 4: Clear Journey Map Cache
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 💾 Data Not Saving

### Symptoms
- Form submits but data not saved
- Page refreshes and data is gone
- No error messages shown

### Solutions

#### Check 1: Verify POST Requests
Open Developer Tools → Network tab:
1. Fill out form
2. Click Save
3. Look for POST request
4. Check response status

**Should see**:
- `POST /routes/save-financial-data` - Status 200

**If 404**: Backend endpoint doesn't exist
**If 500**: Check backend logs for error
**If CORS error**: CORS misconfigured

#### Check 2: Check Supabase Connection
```bash
# Backend logs should show:
# "Supabase client initialized successfully"
```

#### Check 3: Verify User Authentication
```javascript
// In browser console:
console.log('User:', useAuthStore.getState().user);
// Should show user object with id
```

---

## 🔐 Authentication Issues

### Symptoms
- Login fails
- Redirected to login repeatedly
- "User not authenticated" errors

### Solutions

#### Check 1: Verify Supabase Configuration
```bash
# Check backend/.env contains:
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=eyJ...
```

#### Check 2: Check Browser Local Storage
```javascript
// In browser console:
console.log(localStorage.getItem('supabase.auth.token'));
// Should show auth token
```

#### Check 3: Clear Auth State
```javascript
// In browser console:
localStorage.removeItem('supabase.auth.token');
sessionStorage.clear();
location.reload();
// Then login again
```

---

## 🌐 CORS Errors

### Symptoms
- "blocked by CORS policy" in console
- API calls fail from frontend
- Works in backend but not frontend

### Solutions

#### Check 1: Verify CORS Configuration
**File**: `backend/main.py`
```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    # ... should include your frontend port
]
```

#### Check 2: Restart Backend Server
```bash
# Stop backend (Ctrl+C)
# Start again:
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Check 3: Check Frontend Port
```bash
# Make sure frontend is on allowed port
npm run dev
# Note the port number, add to ALLOWED_ORIGINS if different
```

---

## 🐛 Common Error Messages

### "Extension firebase-auth not found"
**Severity**: ⚠️ Warning (Safe to ignore)
**Cause**: App uses Supabase, not Firebase
**Action**: No action needed

### "Field name 'schema' shadows an attribute"
**Severity**: ⚠️ Warning (Safe to ignore)
**Cause**: Pydantic model naming
**Action**: No action needed (works correctly)

### "util._extend API is deprecated"
**Severity**: ⚠️ Warning (Safe to ignore)
**Cause**: Node.js dependency using old API
**Action**: No action needed

### "Cannot read property 'sub' of undefined"
**Severity**: 🔴 Error (Needs fix)
**Cause**: User object not loaded yet
**Action**: Add null check before accessing user.sub

---

## 📋 Quick Diagnostic Commands

### Check All Services Status
```bash
# Frontend
curl http://localhost:5173

# Backend
curl http://localhost:8000/openapi.json

# Database (via backend)
curl http://localhost:8000/routes/schema
```

### Check All Ports
```bash
# Windows
netstat -ano | findstr "5173 8000"

# Linux/Mac
lsof -i :5173 -i :8000
```

### Check Processes
```bash
# Windows
tasklist | findstr "node python"

# Linux/Mac
ps aux | grep -E "node|python"
```

---

## 🆘 Still Not Working?

### Create Debug Report

1. **Collect Information**:
```bash
# Frontend status
cd frontend
npm run dev > frontend-status.txt 2>&1

# Backend status
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 > backend-status.txt 2>&1
```

2. **Browser Console**:
- F12 → Console tab
- Copy all errors
- Save to file: browser-errors.txt

3. **Network Tab**:
- F12 → Network tab
- Refresh page
- Right-click → Save all as HAR
- Save to file: network-log.har

4. **Check Documentation**:
- Review BUGS_AND_FIXES.md for similar issues
- Check Progress.md for recent changes
- Review IMPLEMENTATION_PLAN_UX_IMPROVEMENTS.md for pending features

---

## 📞 Getting Help

When reporting issues, include:

1. **What you were trying to do**
2. **What actually happened**
3. **Error messages** (from console)
4. **Screenshots** (if visual issue)
5. **Steps to reproduce**
6. **System information**:
   - OS: Windows/Mac/Linux
   - Node version: `node --version`
   - Python version: `python --version`
   - Browser: Chrome/Firefox/Safari/Edge

---

## 🔄 Reset Everything

**Nuclear option** - Use only if nothing else works:

```bash
# Stop all servers
# Press Ctrl+C in both terminal windows

# Clear all caches
cd frontend
rm -rf node_modules
rm package-lock.json
npm install

# Clear Python cache
cd ../backend
find . -type d -name "__pycache__" -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Clear browser data
# In browser: Ctrl+Shift+Delete
# Clear everything from "All time"

# Restart servers
cd frontend
npm run dev

# New terminal:
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

**Last Updated**: 2025-11-16 (Session 9)
**Tested With**: Node v18+, Python 3.11+, Chrome/Edge Latest
