# Claude Instructions for FIREMap Project

## CRITICAL RULE: Git Operations

⚠️ **NEVER PUSH TO GIT WITHOUT USER CONFIRMATION** ⚠️

### Git Workflow Rules:
1. **ALWAYS commit changes locally first**
2. **NEVER run `git push` automatically**
3. **ALWAYS ask user for confirmation before pushing**
4. **Wait for user to explicitly say "push to git" or "commit and push"**

### Correct Workflow:
```bash
# Step 1: Stage changes
git add <files>

# Step 2: Commit locally
git commit -m "message"

# Step 3: STOP and ask user
# "Changes committed locally. Would you like me to push to git?"

# Step 4: Only push after user confirms
git push origin master
```

### Example Interaction:
```
Assistant: I've committed the changes locally. Would you like me to push to the remote repository?
User: yes, push to git
Assistant: [Now runs git push]
```

## Project Information

This is the FIREMap project - a financial planning application for FIRE (Financial Independence, Retire Early) goals.

- Frontend: React + TypeScript + Vite
- Backend: Python (Databutton)
- Database: Supabase
- Deployment: Vercel (frontend), Databutton (backend)

## Key Features
- Financial data tracking
- Portfolio management (CAMS integration)
- FIRE calculator
- Goal planning and SIP tracking
- Risk assessment
- Premium subscription features
