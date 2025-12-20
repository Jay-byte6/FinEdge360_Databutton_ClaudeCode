"""
Daily NAV Updater
Scheduled job to update mutual fund NAVs daily at 7 PM IST (after market close)
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, date
import asyncio
import os
from supabase import create_client
import traceback

# Initialize scheduler
scheduler = AsyncIOScheduler()

# Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


# =======================
# HELPER FUNCTIONS
# =======================

def create_job_record(job_date: date) -> str:
    """Create a job record and return its ID"""
    try:
        result = supabase.table('nav_update_jobs').insert({
            'job_date': job_date.isoformat(),
            'job_status': 'RUNNING',
            'started_at': datetime.now().isoformat()
        }).execute()

        if result.data:
            return result.data[0]['id']
        return None
    except Exception as e:
        print(f"[Daily NAV Updater] Error creating job record: {str(e)}")
        return None


def update_job_record(job_id: str, status: str, stats: dict, error_log: str = None):
    """Update job record with final status and statistics"""
    try:
        update_data = {
            'job_status': status,
            'completed_at': datetime.now().isoformat(),
            'total_schemes_to_update': stats.get('unique_schemes', 0),
            'schemes_updated_successfully': stats.get('schemes_updated', 0),
            'schemes_failed': stats.get('schemes_failed', 0),
            'notifications_created': stats.get('notifications_created', 0)
        }

        if error_log:
            update_data['error_log'] = error_log

        supabase.table('nav_update_jobs').update(update_data).eq('id', job_id).execute()
        print(f"[Daily NAV Updater] Job {job_id} updated with status: {status}")

    except Exception as e:
        print(f"[Daily NAV Updater] Error updating job record: {str(e)}")


# =======================
# SCHEDULED JOB
# =======================

async def daily_nav_update_job():
    """
    Daily NAV update job - Runs at 7 PM IST
    1. Fetch latest NAV for all schemes
    2. Update portfolio holdings
    3. Check for 10% changes and create notifications
    4. Send email alerts
    5. Sync net worth values
    """
    job_id = None
    today = date.today()

    try:
        print(f"\n{'='*60}")
        print(f"[Daily NAV Updater] Starting job for {today}")
        print(f"{'='*60}\n")

        # Create job record
        job_id = create_job_record(today)

        if not job_id:
            print("[Daily NAV Updater] Failed to create job record - aborting")
            return

        # Import NAV service
        from app.apis.portfolio.nav_service import batch_update_navs

        # Run batch NAV update for all users
        stats = await batch_update_navs(user_id=None)

        print(f"\n[Daily NAV Updater] Job completed successfully!")
        print(f"  Total Holdings: {stats.get('total_holdings', 0)}")
        print(f"  Unique Schemes: {stats.get('unique_schemes', 0)}")
        print(f"  Schemes Updated: {stats.get('schemes_updated', 0)}")
        print(f"  Schemes Failed: {stats.get('schemes_failed', 0)}")
        print(f"  Holdings Updated: {stats.get('holdings_updated', 0)}")
        print(f"  Notifications Created: {stats.get('notifications_created', 0)}")
        print(f"  Users Affected: {stats.get('users_affected', 0)}")

        # Update job record with success
        update_job_record(job_id, 'COMPLETED', stats)

    except Exception as e:
        error_msg = f"Job failed: {str(e)}\n{traceback.format_exc()}"
        print(f"\n[Daily NAV Updater] ERROR: {error_msg}")

        # Update job record with failure
        if job_id:
            update_job_record(job_id, 'FAILED', {}, error_log=error_msg)

    finally:
        print(f"\n{'='*60}")
        print(f"[Daily NAV Updater] Job finished at {datetime.now()}")
        print(f"{'='*60}\n")


# =======================
# SCHEDULER CONFIGURATION
# =======================

# Schedule job to run daily at 7 PM IST (Asia/Kolkata timezone)
@scheduler.scheduled_job(
    trigger=CronTrigger(hour=19, minute=0, timezone='Asia/Kolkata'),
    id='daily_nav_update',
    name='Daily NAV Update Job'
)
def scheduled_nav_update():
    """Wrapper to run async job in scheduler"""
    print(f"\n[Scheduler] Triggered daily NAV update at {datetime.now()}")
    asyncio.create_task(daily_nav_update_job())


# Manual trigger function for testing
async def trigger_manual_update():
    """Manually trigger NAV update (for testing)"""
    print("[Manual Trigger] Starting manual NAV update...")
    await daily_nav_update_job()


# Print scheduler info on module load
print("""
===============================================================
          DAILY NAV UPDATER - SCHEDULER INITIALIZED
===============================================================
 Job ID:        daily_nav_update
 Schedule:      Every day at 7:00 PM IST
 Timezone:      Asia/Kolkata
 Status:        Ready
===============================================================
""")


# Export scheduler and trigger function
__all__ = ['scheduler', 'trigger_manual_update', 'daily_nav_update_job']
