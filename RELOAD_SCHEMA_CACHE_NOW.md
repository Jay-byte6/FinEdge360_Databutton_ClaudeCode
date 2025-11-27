# 🚨 CRITICAL: Reload Schema Cache in Supabase

**Current Error:**
```
Could not find the table 'public.promo_codes' in the schema cache
```

This means the migrations were run, but Supabase hasn't refreshed its schema cache yet!

---

## 🎯 IMMEDIATE ACTION REQUIRED

### Step-by-Step to Reload Schema Cache:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com
   - Sign in
   - Select project: `gzkuoojfoaovnzoczibc`

2. **Navigate to API Settings**
   - Click **"Settings"** in the left sidebar (gear icon at bottom)
   - Click **"API"** in the settings menu

3. **Reload Schema Cache**
   - Scroll down to find **"Schema Cache"** section
   - Click the **"Reload Schema Cache"** button
   - You'll see a success message

4. **WAIT 60 SECONDS**
   - ⏰ This is critical - the cache takes time to reload
   - Don't proceed until 60 seconds have passed

5. **Verify Tables Exist**
   - Click **"Table Editor"** in left sidebar
   - Look for these new tables:
     - subscription_plans ✓
     - user_subscriptions ✓
     - promo_codes ✓
     - promo_code_usage ✓
     - promo_code_stats ✓
     - consultation_types ✓
     - consultation_bookings ✓
     - expert_profiles ✓
     - expert_revenue ✓
     - user_preferences ✓

---

## 🧪 After Reloading - Test Again

After waiting 60 seconds, test the API:

```bash
curl http://localhost:8000/routes/active-promos
```

**Expected Result:**
```json
{
  "success": true,
  "promos": [
    {
      "code": "FOUNDER50",
      "name": "Founder's Circle",
      "total_slots": 50,
      "used_slots": 37,
      "remaining_slots": 13,
      ...
    },
    ...
  ]
}
```

**If Still Getting Error:**
- Wait another 30 seconds
- Try restarting the backend server
- Check Supabase logs

---

## ⚠️ Common Mistake

**DON'T SKIP THE WAIT TIME!**

The schema cache reload is **asynchronous**. Even though you clicked the button, it takes 30-60 seconds for Supabase to actually update the cache across all servers.

---

**After completing this step, let me know and I'll continue testing the complete user flow!**
