# Environment Variables Setup Instructions

## Required Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

### 1. Supabase Configuration (REQUIRED)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Encryption Key (REQUIRED)
```env
ENCRYPTION_KEY=your_fernet_encryption_key_here
```

**To generate an encryption key:**
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

**Example output:**
```
mPF6JYqK3vK8h9TxN2ZxJ5nGH8yL3mK9vR4wP7sQ2zA=
```

### 3. Email Configuration (Optional)
For breach notifications and data retention alerts:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
FROM_EMAIL=your_email@gmail.com
```

**For Gmail:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an "App Password" for this application
4. Use the generated app password (16 characters)

### 4. Application Settings
```env
DATABUTTON_SERVICE_TYPE=development
ADMIN_EMAIL=seyonshomefashion@gmail.com
```

## Complete .env Example

```env
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Encryption (REQUIRED)
ENCRYPTION_KEY=mPF6JYqK3vK8h9TxN2ZxJ5nGH8yL3mK9vR4wP7sQ2zA=

# Email (Optional - notifications will log to console if not configured)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
FROM_EMAIL=your_email@gmail.com

# Application
DATABUTTON_SERVICE_TYPE=development
ADMIN_EMAIL=seyonshomefashion@gmail.com
```

## Security Notes

1. **NEVER** commit the `.env` file to version control
2. Keep your `ENCRYPTION_KEY` secure - losing it means you cannot decrypt existing data
3. Rotate the encryption key periodically for maximum security
4. Use different keys for development and production environments

## Installation Steps

1. Install required Python packages:
```bash
pip install cryptography
```

2. Generate your encryption key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

3. Create `.env` file with all required variables

4. Run database migrations:
```bash
# Connect to Supabase and run the SQL migration files in order:
# - 002_create_consent_tracking_table.sql
# - 003_create_audit_logs_table.sql
# - 004_add_last_activity_column.sql
```

5. Start the backend server:
```bash
python main.py
```

## Testing the Setup

To verify your environment is configured correctly:

1. Check that the backend starts without errors
2. Test the health check endpoint: `GET /routes/privacy-health`
3. Verify encryption works by saving and retrieving financial data
4. Check that audit logs are being created

## Troubleshooting

### "ENCRYPTION_KEY not set" error
- Make sure the `.env` file exists in the backend directory
- Verify the `ENCRYPTION_KEY` variable is set correctly
- Check that the key is a valid Fernet key (44 characters base64-encoded)

### Email notifications not working
- Email configuration is optional - notifications will log to console if SMTP is not configured
- For Gmail, ensure you're using an App Password, not your regular password
- Check that 2FA is enabled on your Google account

### Supabase connection errors
- Verify your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Make sure you're using the service role key, not the anon key, for backend operations
- Check that your Supabase project is active and accessible
