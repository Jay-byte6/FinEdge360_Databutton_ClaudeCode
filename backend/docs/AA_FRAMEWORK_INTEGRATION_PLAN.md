# Account Aggregator (AA) Framework Integration Plan

**STATUS**: ⏸️ **PENDING - Requires FIU License**

**Last Updated**: December 21, 2025

---

## Executive Summary

This document outlines the complete implementation plan for integrating the Account Aggregator (AA) framework into FinEdge360. The AA framework enables automatic fetching of ALL financial data types from 100+ institutions, eliminating manual data entry for users.

### Key Benefits
- **Automatic Portfolio Syncing**: Real-time updates from AMCs, brokers, insurance companies
- **Comprehensive Asset Coverage**: Mutual funds, stocks, bonds, ULIPs, insurance, bank accounts, loans, EPF/PPF/NPS, tax data
- **Single Consent Flow**: Users grant permission once, data flows automatically
- **Regulatory Compliance**: RBI-regulated, secure, encrypted data transfer
- **Superior User Experience**: Zero manual entry, always up-to-date portfolio

### Why This is PENDING
- **Requires FIU License**: Must register as Financial Information User with SEBI/RBI
- **Timeline**: 5-6 months from application to production
- **Investment**: ₹1-3 lakhs one-time + recurring fees
- **Legal Requirements**: Privacy policy updates, compliance framework, data security audits

---

## 1. What is Account Aggregator Framework?

The Account Aggregator (AA) framework is an **RBI-regulated** digital infrastructure that enables seamless, secure, and consent-based sharing of financial data between institutions.

### How It Works
```
User → FinEdge360 (FIU) → AA → Financial Institution Provider (FIP) → Data Returns
                   ↓
              Consent Management
```

1. **User initiates consent**: User selects which accounts to share (e.g., HDFC MF, ICICI Bank)
2. **AA facilitates consent**: Account Aggregator (Saafe, Finvu, OneMoney, etc.) manages consent
3. **FIP provides data**: Financial Institution Provider (bank, AMC, insurer) sends encrypted data
4. **FIU receives data**: FinEdge360 (as FIU) decrypts and processes data
5. **Auto-sync**: Portfolio, net worth, FIRE calculations update automatically

### Key Stakeholders
- **FIU (Financial Information User)**: FinEdge360 (requires license)
- **AA (Account Aggregator)**: Saafe, Finvu, OneMoney, CAMS Finserv, PhonePe AA, etc.
- **FIP (Financial Information Provider)**: Banks, AMCs, insurers (100+ entities)
- **User**: FinEdge360 customer granting consent

---

## 2. Asset Types Covered by AA Framework

### 2.1 Investment Assets
| Asset Type | Data Available | Providers |
|------------|----------------|-----------|
| **Mutual Funds** | Folio number, scheme name, units, NAV, market value, XIRR, gains | All AMCs (40+ AMCs) |
| **Stocks & Equities** | Holdings, quantity, average price, current price, P&L | NSDL, CDSL, brokers |
| **Bonds & Debentures** | Face value, maturity date, coupon rate, current value | Depositories |
| **ULIPs** | Policy number, premium, fund value, maturity date | Life insurance cos |
| **Insurance** | Policy details, sum assured, premium, surrender value | 20+ insurers |
| **NPS** | PRAN number, contributions, NAV, returns, tier-1/2 balances | NSDL-CRA, Karvy |
| **EPF** | UAN, balance, contributions, employer contributions, interest | EPFO |
| **PPF** | Account number, balance, interest earned, maturity | Banks |
| **Gold ETFs** | Units, NAV, market value | AMCs, depositories |

### 2.2 Liabilities
| Asset Type | Data Available | Providers |
|------------|----------------|-----------|
| **Home Loans** | Loan amount, outstanding, EMI, interest rate, tenure | 40+ banks |
| **Car Loans** | Outstanding amount, EMI, tenure remaining | Banks, NBFCs |
| **Personal Loans** | Amount, EMI, interest rate, closure charges | Banks, NBFCs |
| **Credit Cards** | Outstanding, credit limit, payment due date | Banks |
| **Education Loans** | Amount, moratorium period, repayment schedule | Banks |

### 2.3 Bank Accounts & Deposits
| Asset Type | Data Available | Providers |
|------------|----------------|-----------|
| **Savings Accounts** | Balance, transactions (last 12 months), interest | All major banks |
| **Current Accounts** | Balance, transaction history | Banks |
| **Fixed Deposits** | FD number, amount, maturity date, interest rate | Banks |
| **Recurring Deposits** | Amount, maturity, installment | Banks |

### 2.4 Tax & Compliance
| Asset Type | Data Available | Providers |
|------------|----------------|-----------|
| **Form 26AS** | TDS deducted, refunds, advance tax | Income Tax Dept |
| **ITR** | Filed returns, income details | Income Tax Dept |
| **GST** | GST registration, filings (for businesses) | GSTN |

**Total Coverage**: 100+ Financial Institution Providers (FIPs) across 15+ asset categories

---

## 3. Legal & Regulatory Requirements

### 3.1 FIU (Financial Information User) License

**What is FIU License?**
- Authorization to request and receive financial data via AA framework
- Issued by **SEBI** (for investment apps) or **RBI** (for lending apps)
- FinEdge360 needs SEBI approval as a financial planning/investment tracking app

**Application Process**:
1. **Prepare Documentation** (2-4 weeks):
   - Company incorporation certificates
   - Business plan detailing use of AA data
   - Data security and privacy policies
   - IT infrastructure audit report
   - Compliance framework document
   - Board resolutions authorizing application

2. **Submit Application to SEBI** (1 week):
   - Online submission via SEBI portal
   - Application fee: ₹50,000 - ₹1,00,000

3. **SEBI Review & Queries** (2-3 months):
   - SEBI reviews application
   - May request clarifications, additional documents
   - Security audit of infrastructure
   - Privacy policy review

4. **License Approval** (1-2 weeks):
   - SEBI issues FIU license
   - Valid for 3 years, renewable

**Total Timeline**: 3-4 months from application to approval

### 3.2 Compliance Requirements

**Data Security**:
- SSL/TLS encryption for all data in transit
- AES-256 encryption for data at rest
- Regular security audits (annual)
- ISO 27001 certification (recommended)
- Penetration testing reports

**Privacy & User Consent**:
- Update Privacy Policy with AA data usage
- Explicit consent flow for users
- Right to revoke consent anytime
- Data retention policy (delete data after consent expires)
- GDPR/DPDPA compliance

**Operational**:
- Maintain audit logs of all data access
- Incident response plan
- Data breach notification process
- Compliance officer appointment

### 3.3 Legal Documents to Update

1. **Privacy Policy**: Add section on AA data collection, usage, storage
2. **Terms of Service**: Include AA framework consent clauses
3. **User Consent Form**: Separate consent for AA integration
4. **Data Processing Agreement**: With AA provider
5. **Service Agreement**: With each AA (Saafe, Finvu, etc.)

---

## 4. Cost Breakdown

### 4.1 One-Time Costs

| Item | Cost (INR) | Timeline |
|------|-----------|----------|
| FIU License Application Fee | ₹50,000 - ₹1,00,000 | Upfront |
| Legal Consultation & Compliance | ₹1,00,000 - ₹2,00,000 | Pre-launch |
| Security Audit & ISO Certification | ₹50,000 - ₹1,50,000 | Pre-launch |
| AA Provider Integration (Saafe/Finvu) | ₹1,00,000 - ₹2,00,000 | Development |
| Development Effort (3 months) | ₹3,00,000 - ₹6,00,000 | Development |
| **Total One-Time Investment** | **₹6,00,000 - ₹12,00,000** | |

### 4.2 Recurring Costs

| Item | Cost (INR/month) | Notes |
|------|------------------|-------|
| AA Provider API Fees | ₹10,000 - ₹50,000 | Based on usage (per fetch) |
| Data Storage (AWS/Supabase) | ₹5,000 - ₹20,000 | Increased data volume |
| Compliance & Audits | ₹10,000 - ₹30,000 | Quarterly audits |
| Support & Maintenance | ₹20,000 - ₹50,000 | Bug fixes, updates |
| **Total Monthly Recurring** | **₹45,000 - ₹1,50,000** | |

### 4.3 Usage-Based Pricing (AA Providers)

Most AA providers charge per data fetch:
- **Per fetch**: ₹2 - ₹5 per account per fetch
- **Example**: User with 5 accounts (2 MF folios, 1 bank, 1 demat, 1 EPF) = ₹10-25 per sync
- **Monthly sync**: If 1000 users sync monthly = ₹10,000 - ₹25,000/month

**Optimization Strategy**: Sync on-demand (user-triggered) vs. automatic daily sync to control costs

---

## 5. Technical Implementation Plan

### Phase 1: AA Provider Selection & Integration (4-6 weeks)

**Choose AA Provider**:
- **Saafe**: Largest AA, widest FIP coverage
- **Finvu**: Good API documentation, developer-friendly
- **OneMoney**: CAMS-backed, strong MF coverage
- **PhonePe AA**: Large user base, seamless UPI integration

**Recommended**: Start with **Saafe** or **Finvu** (best API support)

**Integration Steps**:
1. Sign Master Services Agreement (MSA) with AA provider
2. Get API credentials (client_id, client_secret)
3. Set up sandbox environment for testing
4. Implement OAuth2 consent flow
5. Test data fetching with sample FIPs

### Phase 2: Database Schema (1 week)

**Create New Tables**:

```sql
-- AA Consent Management
CREATE TABLE aa_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_id VARCHAR(255) UNIQUE NOT NULL, -- AA-provided consent ID
  consent_handle VARCHAR(255) NOT NULL, -- User's AA handle (mobile@AA)
  aa_provider VARCHAR(50) NOT NULL, -- 'saafe', 'finvu', 'onemoney'
  status VARCHAR(50) NOT NULL, -- 'PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED'
  consent_start TIMESTAMP NOT NULL,
  consent_expiry TIMESTAMP NOT NULL,
  frequency VARCHAR(50), -- 'DAILY', 'WEEKLY', 'MONTHLY', 'ONETIME'
  fip_ids TEXT[], -- Array of FIP IDs user consented to
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AA Data Fetch Jobs
CREATE TABLE aa_fetch_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_id UUID REFERENCES aa_consents(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL, -- AA session ID
  status VARCHAR(50) NOT NULL, -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
  fip_id VARCHAR(100) NOT NULL, -- Which FIP data was fetched from
  account_type VARCHAR(100), -- 'MUTUAL_FUND', 'BANK_ACCOUNT', 'DEMAT', etc.
  data_fetched JSONB, -- Raw encrypted data from FIP
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- AA Account Mapping (link AA accounts to our holdings)
CREATE TABLE aa_account_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fip_id VARCHAR(100) NOT NULL,
  fip_account_id VARCHAR(255) NOT NULL, -- FIP's account identifier
  account_type VARCHAR(100) NOT NULL, -- 'MUTUAL_FUND', 'DEMAT', etc.
  linked_holding_id UUID, -- References portfolio_holdings(id) or assets_liabilities(id)
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_aa_consents_user ON aa_consents(user_id);
CREATE INDEX idx_aa_fetch_jobs_user ON aa_fetch_jobs(user_id);
CREATE INDEX idx_aa_fetch_jobs_status ON aa_fetch_jobs(status);
```

### Phase 3: Backend API Implementation (6-8 weeks)

**Create AA Service Module**: `backend/app/apis/aa_integration/`

**File Structure**:
```
backend/app/apis/aa_integration/
├── __init__.py              # Main router
├── aa_client.py             # AA provider SDK wrapper
├── consent_manager.py       # Consent flow logic
├── data_fetcher.py          # Fetch and decrypt data from FIPs
├── data_mapper.py           # Map FIP data to portfolio_holdings
├── sync_scheduler.py        # Scheduled sync jobs
└── models.py                # Pydantic models
```

**Key Endpoints**:

1. **POST /aa/initiate-consent** - Start AA consent flow
   ```python
   @router.post("/aa/initiate-consent")
   async def initiate_consent(user_id: str, fip_ids: List[str]):
       # 1. Generate consent request with AA provider
       # 2. Return redirect URL to AA consent page
       # 3. Store consent_id in database
       pass
   ```

2. **GET /aa/consent-callback** - Handle consent approval callback
   ```python
   @router.get("/aa/consent-callback")
   async def consent_callback(consent_id: str, status: str):
       # 1. Verify consent status from AA
       # 2. Update aa_consents table
       # 3. Trigger initial data fetch if approved
       pass
   ```

3. **POST /aa/fetch-data** - Trigger data fetch from FIPs
   ```python
   @router.post("/aa/fetch-data")
   async def fetch_data(consent_id: str):
       # 1. Create data fetch session with AA
       # 2. Fetch encrypted data from FIPs
       # 3. Decrypt using private key
       # 4. Store in aa_fetch_jobs
       # 5. Trigger data mapping
       pass
   ```

4. **POST /aa/sync-portfolio** - Map AA data to portfolio
   ```python
   @router.post("/aa/sync-portfolio")
   async def sync_portfolio(user_id: str, fetch_job_id: str):
       # 1. Get decrypted data from fetch job
       # 2. Parse FIP data format (varies by FIP)
       # 3. Map to portfolio_holdings schema
       # 4. Upsert holdings (INSERT or UPDATE)
       # 5. Update net worth
       pass
   ```

5. **DELETE /aa/revoke-consent** - Revoke AA consent
   ```python
   @router.delete("/aa/revoke-consent/{consent_id}")
   async def revoke_consent(consent_id: str):
       # 1. Call AA provider revoke API
       # 2. Update aa_consents.status = 'REVOKED'
       # 3. Delete linked account mappings
       pass
   ```

**AA Client Implementation** (`aa_client.py`):
```python
import httpx
from datetime import datetime, timedelta

class SaafeAAClient:
    """Saafe Account Aggregator API client"""

    BASE_URL = "https://api.saafe.in/aa"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None

    async def get_access_token(self):
        """OAuth2 token fetch"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                }
            )
            data = response.json()
            self.access_token = data["access_token"]
            return self.access_token

    async def create_consent_request(self, user_mobile: str, fip_ids: List[str],
                                     purpose: str = "Portfolio Tracking"):
        """Create consent request"""
        consent_params = {
            "ver": "1.0",
            "timestamp": datetime.utcnow().isoformat(),
            "txnid": str(uuid.uuid4()),
            "ConsentDetail": {
                "consentStart": datetime.utcnow().isoformat(),
                "consentExpiry": (datetime.utcnow() + timedelta(days=365)).isoformat(),
                "Customer": {
                    "id": f"{user_mobile}@saafe"
                },
                "FIDataRange": {
                    "from": (datetime.utcnow() - timedelta(days=365)).isoformat(),
                    "to": datetime.utcnow().isoformat()
                },
                "consentMode": "VIEW",
                "consentTypes": ["PROFILE", "SUMMARY", "TRANSACTIONS"],
                "fetchType": "PERIODIC",
                "Frequency": {
                    "unit": "DAY",
                    "value": 1
                },
                "DataFilter": fip_ids,
                "Purpose": {
                    "code": "101",
                    "text": purpose
                }
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/Consent",
                json=consent_params,
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            data = response.json()
            return data["ConsentHandle"]

    async def fetch_consent_status(self, consent_handle: str):
        """Check consent approval status"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/Consent/handle/{consent_handle}",
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            return response.json()

    async def fetch_financial_data(self, consent_id: str, fip_id: str):
        """Fetch data from FIP using approved consent"""
        fi_request = {
            "ver": "1.0",
            "timestamp": datetime.utcnow().isoformat(),
            "txnid": str(uuid.uuid4()),
            "FIDataRange": {
                "from": (datetime.utcnow() - timedelta(days=365)).isoformat(),
                "to": datetime.utcnow().isoformat()
            },
            "Consent": {
                "id": consent_id
            },
            "KeyMaterial": {
                "Nonce": base64.b64encode(os.urandom(32)).decode(),
                "DHPublicKey": {
                    "keyValue": self.get_public_key()
                }
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/FI/request",
                json=fi_request,
                headers={"Authorization": f"Bearer {self.access_token}"}
            )
            session_id = response.json()["sessionId"]

            # Poll for data (AA fetches from FIP asynchronously)
            for _ in range(10):
                await asyncio.sleep(5)
                fetch_response = await client.get(
                    f"{self.BASE_URL}/FI/fetch/{session_id}",
                    headers={"Authorization": f"Bearer {self.access_token}"}
                )
                fetch_data = fetch_response.json()
                if fetch_data["status"] == "READY":
                    encrypted_data = fetch_data["FI"]
                    # Decrypt using private key
                    decrypted_data = self.decrypt_fi_data(encrypted_data)
                    return decrypted_data

            raise Exception("Data fetch timeout")
```

**Data Mapper** (`data_mapper.py`):
```python
async def map_mutual_fund_data(user_id: str, fip_data: dict):
    """Map mutual fund data from FIP to portfolio_holdings"""

    holdings = []
    for account in fip_data.get("Accounts", []):
        folio_number = account["linkedAccRef"]

        for holding in account.get("Holdings", []):
            scheme_code = holding["schemeCode"]
            scheme_name = holding["schemeName"]
            units = float(holding["units"])
            avg_cost = float(holding.get("averageCost", 0))
            current_nav = float(holding["nav"])

            holdings.append({
                "user_id": user_id,
                "folio_number": folio_number,
                "scheme_code": scheme_code,
                "scheme_name": scheme_name,
                "unit_balance": units,
                "avg_cost_per_unit": avg_cost,
                "cost_value": units * avg_cost,
                "current_nav": current_nav,
                "market_value": units * current_nav,
                "data_source": "AA_AUTO"  # Flag as AA-sourced
            })

    # Upsert into portfolio_holdings
    for holding in holdings:
        await upsert_holding(holding)

    return len(holdings)

async def map_demat_data(user_id: str, fip_data: dict):
    """Map demat/equity holdings"""
    # Similar logic for stocks, bonds, ETFs
    pass

async def map_insurance_data(user_id: str, fip_data: dict):
    """Map insurance policies (ULIPs, term, endowment)"""
    # Parse policy details, premium, maturity
    pass
```

### Phase 4: Frontend Implementation (4 weeks)

**Create AA Components**: `frontend/src/components/aa/`

1. **AAConsentFlow.tsx** - Step-by-step consent wizard
   ```tsx
   export const AAConsentFlow = () => {
     const [step, setStep] = useState(1);
     const [selectedFIPs, setSelectedFIPs] = useState([]);

     // Step 1: Select financial institutions
     // Step 2: Enter mobile number for AA
     // Step 3: Redirect to AA consent page
     // Step 4: Callback handling & data sync
   };
   ```

2. **FIPSelector.tsx** - UI to select banks, AMCs, insurers
   ```tsx
   const FIP_CATEGORIES = {
     mutualFunds: ["HDFC MF", "ICICI Pru MF", "SBI MF", ...],
     banks: ["HDFC Bank", "ICICI Bank", "SBI", ...],
     insurance: ["LIC", "HDFC Life", "ICICI Pru Life", ...]
   };
   ```

3. **AADataSyncStatus.tsx** - Show sync progress
   ```tsx
   // Show: "Fetching data from HDFC Bank... ✅"
   // Show: "Syncing 15 mutual fund holdings... ⏳"
   ```

4. **AAConsentManager.tsx** - View/revoke active consents
   ```tsx
   // List all active AA consents
   // Allow user to revoke consent
   // Show last sync time
   ```

**Update Portfolio Page** (`frontend/src/pages/Portfolio.tsx`):
```tsx
import { AAConsentFlow } from '@/components/aa/AAConsentFlow';

// Add button: "Auto-Sync with Account Aggregator"
<Button onClick={() => setShowAAFlow(true)}>
  <RefreshCw className="mr-2" />
  Auto-Sync Portfolio
</Button>

{showAAFlow && <AAConsentFlow onComplete={handleAASyncComplete} />}
```

### Phase 5: Scheduled Sync Jobs (2 weeks)

**Daily Auto-Sync** (`sync_scheduler.py`):
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour=8, minute=0)  # 8 AM daily
async def daily_aa_sync():
    """Auto-sync all active AA consents"""

    # Get all active consents
    active_consents = await get_active_aa_consents()

    for consent in active_consents:
        try:
            # Fetch data from all FIPs for this consent
            fetch_job = await trigger_aa_data_fetch(consent.consent_id)

            # Map data to portfolio
            await sync_portfolio_from_aa(consent.user_id, fetch_job.id)

            # Update net worth
            await update_net_worth_from_portfolio(consent.user_id)

        except Exception as e:
            logger.error(f"AA sync failed for consent {consent.id}: {e}")
```

---

## 6. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FinEdge360 User                         │
│                  (Grants consent via AA app)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Account Aggregator (Saafe)                   │
│          • Manages consent lifecycle                            │
│          • Routes data requests to FIPs                         │
│          • Encrypts data with FIU public key                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Financial Institution Providers (FIPs)             │
│   ┌──────────┬──────────┬──────────┬──────────┬──────────┐     │
│   │ HDFC MF  │ SBI Bank │ ICICI    │ EPFO     │ CDSL     │     │
│   │          │          │ Pru Life │          │ Demat    │     │
│   └──────────┴──────────┴──────────┴──────────┴──────────┘     │
│          • Fetch account data based on consent                  │
│          • Encrypt and send to AA                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FinEdge360 Backend (FIU)                     │
│   ┌──────────────────────────────────────────────────────┐     │
│   │ AA Integration Service                               │     │
│   │  • Decrypt FIP data with private key                 │     │
│   │  • Parse different FIP formats                       │     │
│   │  • Map to portfolio_holdings schema                  │     │
│   └──────────────────────────────────────────────────────┘     │
│                             │                                   │
│   ┌──────────────────────────────────────────────────────┐     │
│   │ Data Mapper                                          │     │
│   │  • Mutual funds → portfolio_holdings                 │     │
│   │  • Stocks → equity_holdings                          │     │
│   │  • Insurance → insurance_policies                    │     │
│   │  • Loans → liabilities                               │     │
│   └──────────────────────────────────────────────────────┘     │
│                             │                                   │
│   ┌──────────────────────────────────────────────────────┐     │
│   │ Supabase Database                                    │     │
│   │  • portfolio_holdings (updated)                      │     │
│   │  • assets_liabilities (synced)                       │     │
│   │  • net_worth_snapshots (captured)                    │     │
│   └──────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FinEdge360 Frontend                         │
│   • Displays auto-synced portfolio                             │
│   • Shows real-time net worth                                  │
│   • Updates FIRE progress graphs                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Security & Encryption

### 7.1 Public Key Infrastructure (PKI)

AA framework uses **Elliptic Curve Cryptography (ECC)** for data encryption:

1. **FIU (FinEdge360) generates key pair**:
   ```python
   from cryptography.hazmat.primitives.asymmetric import ec

   private_key = ec.generate_private_key(ec.SECP256R1())
   public_key = private_key.public_key()
   ```

2. **FIU shares public key** with AA during consent request

3. **FIP encrypts data** with FIU's public key:
   ```
   Encrypted_Data = Encrypt(User_Financial_Data, FIU_Public_Key)
   ```

4. **FIU decrypts data** with private key:
   ```python
   from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

   def decrypt_fi_data(encrypted_data: str, private_key):
       # Derive shared secret using ECDH
       # Decrypt AES-encrypted data
       # Return plaintext JSON
   ```

### 7.2 Data Storage Security

- **Encrypted at rest**: All FIP data encrypted in database (Supabase encryption)
- **Encrypted in transit**: HTTPS/TLS for all API calls
- **Key management**: Private keys stored in AWS Secrets Manager or HashiCorp Vault
- **Access control**: Row-level security (RLS) in Supabase ensures users only see own data

### 7.3 Consent Revocation

When user revokes consent:
1. Call AA provider's revoke API
2. Delete all linked `aa_account_mappings`
3. Mark `aa_fetch_jobs` as `REVOKED`
4. **Optional**: Delete fetched FIP data (compliance with Right to be Forgotten)

---

## 8. Implementation Timeline

### Total Duration: 5-6 months

| Phase | Duration | Activities | Dependencies |
|-------|----------|------------|--------------|
| **Phase 0: Legal Prep** | 4-6 weeks | Prepare FIU application, compliance docs, privacy policy | None |
| **Phase 1: FIU License** | 2-3 months | Submit to SEBI, respond to queries, await approval | Phase 0 |
| **Phase 2: AA Provider Setup** | 2-3 weeks | Sign MSA with Saafe/Finvu, get API creds, sandbox testing | Phase 1 |
| **Phase 3: Backend Dev** | 6-8 weeks | Database schema, AA client, consent APIs, data mappers | Phase 2 |
| **Phase 4: Frontend Dev** | 4 weeks | Consent flow UI, FIP selector, sync status dashboard | Phase 3 (parallel) |
| **Phase 5: Testing** | 3-4 weeks | Sandbox testing with mock FIPs, UAT with real users | Phase 3+4 |
| **Phase 6: Production** | 1-2 weeks | Deploy, monitor, bug fixes | Phase 5 |

**Critical Path**: FIU license approval (2-3 months) is the longest dependency

---

## 9. Risk Mitigation

### 9.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **AA API downtime** | High | Implement retry logic, queue failed fetches, fallback to manual entry |
| **FIP data format changes** | Medium | Version FIP parsers, monitor API changes, maintain fallback parsers |
| **Decryption failures** | High | Robust error handling, alert on failures, manual verification option |
| **Data sync conflicts** | Medium | Conflict resolution UI (AA data vs. manual entry), user chooses winner |

### 9.2 Regulatory Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **FIU license rejection** | Critical | Engage regulatory consultant, prepare robust application, have backup plan |
| **Compliance violations** | High | Annual audits, compliance officer, legal review of all policies |
| **Data breach** | Critical | ISO 27001, penetration testing, insurance, incident response plan |

### 9.3 Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **User adoption low** | Medium | Educate users on benefits, incentivize (free premium for AA users) |
| **Cost overruns** | Medium | Start with one AA provider, optimize sync frequency, monitor usage |
| **Competition** | Low | First-mover advantage in comprehensive financial planning space |

---

## 10. Success Metrics

### 10.1 Technical KPIs
- **Consent Approval Rate**: >70% of users who start consent flow complete it
- **Data Fetch Success Rate**: >95% of scheduled syncs succeed
- **Sync Latency**: <60 seconds from fetch trigger to portfolio update
- **Uptime**: >99.5% availability of AA integration service

### 10.2 Business KPIs
- **AA Adoption Rate**: 30% of active users link AA within 3 months
- **Manual Entry Reduction**: 80% reduction in manual portfolio entries
- **User Retention**: +20% retention for AA users vs. manual users
- **Premium Conversion**: +15% conversion for users with AA linked

### 10.3 User Experience KPIs
- **Time to First Sync**: <5 minutes from consent to portfolio update
- **Data Accuracy**: >98% match between FIP data and user verification
- **Support Tickets**: <5% of AA users raise sync-related issues

---

## 11. Next Steps (When FIU License Obtained)

### Immediate Actions (Week 1)
1. ✅ Sign Master Services Agreement with Saafe/Finvu
2. ✅ Set up sandbox environment
3. ✅ Generate encryption key pairs
4. ✅ Create test consents with mock FIPs

### Short-term (Weeks 2-4)
1. ✅ Implement consent flow backend APIs
2. ✅ Build FIP data parsers for top 5 FIPs (HDFC MF, SBI Bank, ICICI Pru, EPFO, CDSL)
3. ✅ Create consent flow UI components
4. ✅ Test end-to-end flow in sandbox

### Medium-term (Weeks 5-12)
1. ✅ Expand FIP coverage to 20+ providers
2. ✅ Implement scheduled sync jobs
3. ✅ Build consent management dashboard
4. ✅ UAT with beta users (10-20 early adopters)
5. ✅ Fix bugs, optimize data mapping logic

### Production Launch (Week 13+)
1. ✅ Deploy to production
2. ✅ Monitor sync jobs, error rates, latency
3. ✅ Gather user feedback
4. ✅ Iterate on UX improvements

---

## 12. Alternatives to AA Framework (If License Not Feasible)

### Option 1: CAMS/Karvy Portfolio Upload (Current Plan)
- **Status**: ✅ Already implementing (see plan file)
- **Coverage**: Mutual funds only
- **User effort**: Upload PDF/Excel monthly
- **Cost**: Free (uses MFAPI for NAV)

### Option 2: Email Parser Integration
- **How it works**: Users forward portfolio emails (CAMS, broker statements) to finedge360@parse.com
- **Coverage**: MF, stocks, bonds (wherever email statements available)
- **Cost**: Low (email parsing service ~₹5000/month)
- **Limitation**: Not real-time, requires user action

### Option 3: Browser Extension for Statement Scraping
- **How it works**: Chrome extension logs into user's AMC/broker sites, scrapes portfolio data
- **Coverage**: High (any site with login)
- **Cost**: Development cost ~₹2-3 lakhs
- **Risk**: Violates site ToS, accounts may get blocked

### Option 4: Partnership with Existing AA FIU
- **How it works**: White-label solution from existing licensed FIU (e.g., Perfios, Finbox)
- **Coverage**: Full AA coverage
- **Cost**: Revenue share (20-30% of subscription) or per-user fee
- **Timeline**: 1-2 months (no license needed)
- **Recommended**: Best option if own FIU license infeasible

---

## 13. Recommended Path Forward

Given FinEdge360's current stage, we recommend:

### Phase A (Now - Month 3): **Manual Portfolio + CAMS Upload**
- ✅ Implement current plan (manual entry + CAMS PDF upload)
- ✅ Build strong user base (1000+ users)
- ✅ Gather feedback on portfolio tracking needs

### Phase B (Month 4-6): **Evaluate AA Partnership**
- Approach existing FIU providers (Perfios, Finbox, Fold, OneMoney)
- Negotiate white-label partnership or API integration
- **Benefit**: Skip FIU license, get AA coverage immediately
- **Cost**: Revenue share or ₹10-30 per user/month

### Phase C (Month 7-12): **Apply for Own FIU License** (Optional)
- If user base >10,000 and revenue >₹50 lakhs/year
- Cost-benefit analysis: Own license vs. partnership fees
- Apply to SEBI with strong business case

### Phase D (Month 13+): **Full AA Integration**
- Launch with own FIU license OR continue white-label
- Expand to all 100+ FIPs
- Position as comprehensive financial aggregation platform

---

## 14. Documentation & References

### Official AA Framework Resources
- **RBI Master Directions**: https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10598
- **SEBI Guidelines**: https://www.sebi.gov.in/legal/circulars/
- **Saafe AA Developer Docs**: https://docs.saafe.in/
- **Finvu AA API Guide**: https://developer.finvu.in/

### Technical Specifications
- **AA Technical Standards**: https://api.rebit.org.in/
- **FI Data Schemas**: JSON schemas for different asset types
- **Encryption Standards**: SECP256R1 (ECC), AES-256-GCM

### Industry References
- **AA Ecosystem Map**: List of all licensed AAs, FIUs, FIPs
- **Case Studies**: How other fintechs integrated AA (Paytail, ET Money, Fold)

---

## 15. Contact Information for AA Providers

### Account Aggregators (Choose One)
1. **Saafe** (CAMSFinserv)
   - Website: https://www.saafe.in
   - Contact: partnerships@saafe.in
   - Coverage: 100+ FIPs

2. **Finvu** (Cookiejar Technologies)
   - Website: https://finvu.in
   - Contact: hello@finvu.in
   - Coverage: 80+ FIPs

3. **OneMoney**
   - Website: https://onemoney.in
   - Contact: support@onemoney.in
   - Coverage: 90+ FIPs (strong in MF)

4. **PhonePe AA**
   - Website: https://www.phonepe.com/aa
   - Contact: Via PhonePe business team
   - Coverage: 70+ FIPs (growing fast)

### White-Label FIU Providers
1. **Perfios**
   - Website: https://www.perfios.com
   - Product: Perfios AA Gateway
   - Contact: sales@perfios.com

2. **Finbox**
   - Website: https://finbox.in
   - Product: AA-as-a-Service
   - Contact: hello@finbox.in

3. **Fold Money**
   - Website: https://fold.money
   - Product: AA integration platform
   - Contact: partner@fold.money

---

## Conclusion

The Account Aggregator framework represents the **future of financial data integration** in India. While it requires significant upfront investment (time, money, regulatory compliance), it offers unparalleled benefits:

- **Zero user friction**: One-time consent, automatic syncing
- **Comprehensive coverage**: ALL asset types from 100+ institutions
- **Regulatory compliance**: RBI-approved, secure, privacy-preserving
- **Competitive advantage**: First-mover in comprehensive financial planning

**Current Status**: ⏸️ **PENDING** - Awaiting FIU license or partnership decision

**Recommended Action**: Focus on manual portfolio + CAMS upload (current priority), then evaluate AA partnership options in Q2 2026.

---

**Document Owner**: FinEdge360 Technical Team
**Last Updated**: December 21, 2025
**Next Review**: March 2026 (after Phase A completion)
