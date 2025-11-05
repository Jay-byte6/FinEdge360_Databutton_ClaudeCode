# SOLID Principles Refactoring Plan
## FinEdge360 - Architecture Improvement Roadmap

---

## 📊 Current Architecture Issues

### Backend Violations

#### 1. Single Responsibility Principle (SRP) Violations

**Issue:** API route handlers contain business logic and data access code

**Location:** `app/apis/financial_data/__init__.py`
```python
# Current: Mixing concerns
@router.post("/save-financial-data")
async def save_financial_data(...):
    # ❌ Direct Supabase client instantiation
    supabase = create_client(supabase_url, supabase_key)

    # ❌ Business logic in controller
    assets_detail = {...}  # Data transformation

    # ❌ Database operations in controller
    response = supabase.table("personal_info").upsert(...).execute()

    # ❌ Fallback logic mixed with main flow
    if not response.data:
        db.storage.json.put(...)
```

**Problems:**
- Controller handles routing, validation, business logic, and data access
- Tight coupling to Supabase
- Difficult to test
- Hard to maintain

---

#### 2. Open/Closed Principle (OCP) Violations

**Issue:** Hard-coded financial calculations

**Location:** Throughout financial data processing
```python
# ❌ Cannot extend without modifying code
def calculate_net_worth(assets, liabilities):
    return assets - liabilities

# ❌ Hard-coded asset types
assets_detail = {
    "illiquid_assets": {
        "home": illiquid_assets.home,
        "other_real_estate": illiquid_assets.other_real_estate,
        # ... fixed structure
    }
}
```

**Problems:**
- Adding new asset types requires code changes
- Different calculation strategies not supported
- Cannot customize for different user types

---

#### 3. Dependency Inversion Principle (DIP) Violations

**Issue:** Direct dependency on concrete implementations

```python
# ❌ Direct import and usage
from supabase import create_client

supabase = create_client(url, key)  # Concrete dependency
```

**Problems:**
- Cannot swap database providers
- Difficult to mock for testing
- High coupling to Supabase

---

### Frontend Violations

#### 1. Component Coupling

**Issue:** State management mixed with UI
```tsx
// ❌ Dashboard.tsx
export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Business logic in component
        fetchFinancialData().then(...)
    }, []);

    // Rendering mixed with logic
    return <div>...</div>
}
```

---

## 🎯 Proposed Refactored Architecture

### Backend Structure

```
backend/
├── app/
│   ├── api/                    # API Layer (Presentation)
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── financial_data.py
│   │       │   └── db_schema.py
│   │       └── dependencies.py
│   │
│   ├── core/                   # Core Configuration
│   │   ├── config.py          # Settings
│   │   ├── security.py        # Auth utilities
│   │   └── errors.py          # Error handling
│   │
│   ├── domain/                 # Domain Layer (Business Logic)
│   │   ├── models/            # Domain models (entities)
│   │   │   ├── user.py
│   │   │   ├── financial_profile.py
│   │   │   ├── asset.py
│   │   │   └── goal.py
│   │   │
│   │   ├── services/          # Business logic
│   │   │   ├── financial_service.py
│   │   │   ├── goal_service.py
│   │   │   └── tax_service.py
│   │   │
│   │   └── interfaces/        # Abstract interfaces
│   │       ├── repository.py
│   │       ├── calculator.py
│   │       └── storage.py
│   │
│   ├── infrastructure/         # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── supabase_repository.py
│   │   │   └── local_repository.py
│   │   │
│   │   ├── calculators/
│   │   │   ├── net_worth_calculator.py
│   │   │   ├── fire_calculator.py
│   │   │   └── tax_calculator.py
│   │   │
│   │   └── storage/
│   │       ├── supabase_storage.py
│   │       └── local_storage.py
│   │
│   └── schemas/                # Pydantic schemas (DTOs)
│       ├── request/
│       └── response/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🔧 Implementation Plan

### Phase 1: Repository Pattern (2-3 days)

#### Step 1.1: Define Repository Interface
**File:** `app/domain/interfaces/repository.py`

```python
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List
from uuid import UUID

T = TypeVar('T')

class IRepository(ABC, Generic[T]):
    """Base repository interface following DIP"""

    @abstractmethod
    async def get_by_id(self, id: UUID) -> Optional[T]:
        pass

    @abstractmethod
    async def get_all(self) -> List[T]:
        pass

    @abstractmethod
    async def create(self, entity: T) -> T:
        pass

    @abstractmethod
    async def update(self, entity: T) -> T:
        pass

    @abstractmethod
    async def delete(self, id: UUID) -> bool:
        pass


class IFinancialDataRepository(ABC):
    """Financial data specific operations"""

    @abstractmethod
    async def save_financial_profile(
        self,
        user_id: UUID,
        profile: "FinancialProfile"
    ) -> "FinancialProfile":
        pass

    @abstractmethod
    async def get_financial_profile(
        self,
        user_id: UUID
    ) -> Optional["FinancialProfile"]:
        pass
```

#### Step 1.2: Implement Supabase Repository
**File:** `app/infrastructure/database/supabase_repository.py`

```python
from typing import Optional
from uuid import UUID
from supabase import create_client, Client

from app.domain.interfaces.repository import IFinancialDataRepository
from app.domain.models.financial_profile import FinancialProfile
from app.core.config import settings


class SupabaseFinancialRepository(IFinancialDataRepository):
    """Concrete implementation using Supabase"""

    def __init__(self, client: Client):
        self._client = client

    async def save_financial_profile(
        self,
        user_id: UUID,
        profile: FinancialProfile
    ) -> FinancialProfile:
        # Implementation using self._client
        try:
            # Save personal info
            personal_response = self._client.table("personal_info").upsert({
                "user_id": str(user_id),
                "name": profile.personal_info.name,
                "age": profile.personal_info.age,
                # ...
            }).execute()

            # Save assets
            # Save goals
            # etc.

            return profile
        except Exception as e:
            raise RepositoryError(f"Failed to save: {str(e)}")

    async def get_financial_profile(
        self,
        user_id: UUID
    ) -> Optional[FinancialProfile]:
        # Implementation
        pass
```

#### Step 1.3: Create Local Storage Fallback
**File:** `app/infrastructure/database/local_repository.py`

```python
class LocalFinancialRepository(IFinancialDataRepository):
    """Fallback using local storage"""

    def __init__(self, storage_service):
        self._storage = storage_service

    async def save_financial_profile(
        self,
        user_id: UUID,
        profile: FinancialProfile
    ) -> FinancialProfile:
        key = f"financial_data_{user_id}"
        data = profile.dict()
        self._storage.put(key, data)
        return profile
```

---

### Phase 2: Service Layer (2-3 days)

#### Step 2.1: Create Financial Service
**File:** `app/domain/services/financial_service.py`

```python
from uuid import UUID
from typing import Optional

from app.domain.interfaces.repository import IFinancialDataRepository
from app.domain.models.financial_profile import FinancialProfile
from app.domain.interfaces.calculator import INetWorthCalculator


class FinancialService:
    """Business logic for financial operations (SRP)"""

    def __init__(
        self,
        repository: IFinancialDataRepository,  # DIP
        calculator: INetWorthCalculator  # DIP
    ):
        self._repo = repository
        self._calculator = calculator

    async def save_financial_data(
        self,
        user_id: UUID,
        profile_data: dict
    ) -> FinancialProfile:
        """
        Business logic for saving financial data
        - Validates data
        - Transforms data
        - Calculates derived values
        - Persists via repository
        """
        # Create domain model
        profile = FinancialProfile.from_dict(profile_data)

        # Calculate net worth using injected calculator (OCP)
        profile.net_worth = await self._calculator.calculate(
            profile.assets,
            profile.liabilities
        )

        # Persist via repository abstraction (DIP)
        saved_profile = await self._repo.save_financial_profile(
            user_id,
            profile
        )

        return saved_profile

    async def get_financial_data(
        self,
        user_id: UUID
    ) -> Optional[FinancialProfile]:
        return await self._repo.get_financial_profile(user_id)
```

---

### Phase 3: Calculator Strategy Pattern (1-2 days)

#### Step 3.1: Define Calculator Interface
**File:** `app/domain/interfaces/calculator.py`

```python
from abc import ABC, abstractmethod
from typing import Dict, Any


class INetWorthCalculator(ABC):
    """Strategy interface for net worth calculation (OCP)"""

    @abstractmethod
    async def calculate(
        self,
        assets: Dict[str, Any],
        liabilities: Dict[str, Any]
    ) -> float:
        pass


class IFIRECalculator(ABC):
    """Strategy for FIRE calculations"""

    @abstractmethod
    async def calculate_fire_number(
        self,
        annual_expenses: float,
        withdrawal_rate: float
    ) -> float:
        pass
```

#### Step 3.2: Implement Calculators
**File:** `app/infrastructure/calculators/net_worth_calculator.py`

```python
class StandardNetWorthCalculator(INetWorthCalculator):
    """Standard net worth calculation"""

    async def calculate(
        self,
        assets: Dict[str, Any],
        liabilities: Dict[str, Any]
    ) -> float:
        total_assets = self._sum_assets(assets)
        total_liabilities = self._sum_liabilities(liabilities)
        return total_assets - total_liabilities

    def _sum_assets(self, assets: Dict) -> float:
        total = 0.0
        for category in assets.values():
            if isinstance(category, dict):
                total += sum(category.values())
        return total


class InflationAdjustedCalculator(INetWorthCalculator):
    """Alternative calculator with inflation adjustment (OCP)"""

    def __init__(self, inflation_rate: float):
        self.inflation_rate = inflation_rate

    async def calculate(
        self,
        assets: Dict[str, Any],
        liabilities: Dict[str, Any]
    ) -> float:
        # Different calculation strategy
        pass
```

---

### Phase 4: Refactor API Endpoints (1 day)

#### Step 4.1: Update Financial Data Endpoint
**File:** `app/api/v1/endpoints/financial_data.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID

from app.domain.services.financial_service import FinancialService
from app.schemas.request.financial_data import SaveFinancialDataRequest
from app.schemas.response.financial_data import FinancialDataResponse
from app.api.v1.dependencies import get_financial_service, get_current_user


router = APIRouter(prefix="/financial-data", tags=["financial-data"])


@router.post("/", response_model=FinancialDataResponse)
async def save_financial_data(
    request: SaveFinancialDataRequest,
    current_user: User = Depends(get_current_user),
    service: FinancialService = Depends(get_financial_service)  # DIP
):
    """
    Clean controller - only handles HTTP concerns (SRP)
    Business logic delegated to service layer
    """
    try:
        profile = await service.save_financial_data(
            user_id=current_user.id,
            profile_data=request.dict()
        )
        return FinancialDataResponse.from_domain(profile)
    except RepositoryError as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### Step 4.2: Dependency Injection Setup
**File:** `app/api/v1/dependencies.py`

```python
from fastapi import Depends
from supabase import create_client

from app.core.config import settings
from app.domain.services.financial_service import FinancialService
from app.domain.interfaces.repository import IFinancialDataRepository
from app.infrastructure.database.supabase_repository import SupabaseFinancialRepository
from app.infrastructure.calculators.net_worth_calculator import StandardNetWorthCalculator


def get_supabase_client():
    """Factory for Supabase client"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_financial_repository(
    client = Depends(get_supabase_client)
) -> IFinancialDataRepository:
    """Factory for financial repository (DIP)"""
    return SupabaseFinancialRepository(client)


def get_net_worth_calculator():
    """Factory for calculator (OCP)"""
    return StandardNetWorthCalculator()


def get_financial_service(
    repo: IFinancialDataRepository = Depends(get_financial_repository),
    calculator = Depends(get_net_worth_calculator)
) -> FinancialService:
    """Factory for financial service"""
    return FinancialService(repo, calculator)
```

---

### Phase 5: Frontend Refactoring (2-3 days)

#### Step 5.1: Separate Containers from Components

**Before:**
```tsx
// ❌ EnterDetails.tsx - Mixed concerns
export default function EnterDetails() {
    const [data, setData] = useState(null);

    const handleSubmit = async (values) => {
        // API call
        // State update
        // Navigation
    };

    return <form>...</form>
}
```

**After:**

**Container:** `pages/EnterDetails.tsx`
```tsx
// ✅ Container handles logic
export default function EnterDetailsPage() {
    const { saveFinancialData, loading } = useFinancialData();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        await saveFinancialData(values);
        navigate('/dashboard');
    };

    return (
        <FinancialDetailsForm
            onSubmit={handleSubmit}
            loading={loading}
        />
    );
}
```

**Component:** `components/FinancialDetailsForm.tsx`
```tsx
// ✅ Presentational component
interface Props {
    onSubmit: (values: FormValues) => void;
    loading: boolean;
}

export function FinancialDetailsForm({ onSubmit, loading }: Props) {
    const { control, handleSubmit } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Pure UI */}
        </form>
    );
}
```

#### Step 5.2: Extract Custom Hooks

**File:** `utils/hooks/useFinancialData.ts`
```typescript
export function useFinancialData() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const saveFinancialData = async (data: FinancialData) => {
        setLoading(true);
        setError(null);
        try {
            await apiService.saveFinancialData(data);
        } catch (e) {
            setError(e as Error);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { saveFinancialData, loading, error };
}
```

---

## 📈 Benefits of Refactoring

### Backend
✅ **Testability:** Mock repositories and calculators easily
✅ **Maintainability:** Clear separation of concerns
✅ **Flexibility:** Swap implementations without changing business logic
✅ **Extensibility:** Add new calculators without modifying existing code
✅ **Reduced Coupling:** Depend on abstractions, not concrete implementations

### Frontend
✅ **Reusability:** Pure components can be reused anywhere
✅ **Testability:** Test logic separately from UI
✅ **Clarity:** Clear separation between container and presentational components
✅ **Performance:** Easier to optimize pure components

---

## 🎯 Testing Strategy

### Unit Tests
```python
# tests/unit/domain/services/test_financial_service.py
import pytest
from unittest.mock import Mock

async def test_save_financial_data():
    # Arrange
    mock_repo = Mock(spec=IFinancialDataRepository)
    mock_calc = Mock(spec=INetWorthCalculator)
    mock_calc.calculate.return_value = 100000.0

    service = FinancialService(mock_repo, mock_calc)

    # Act
    result = await service.save_financial_data(user_id, data)

    # Assert
    mock_repo.save_financial_profile.assert_called_once()
    assert result.net_worth == 100000.0
```

### Integration Tests
```python
# tests/integration/test_financial_api.py
async def test_save_financial_data_endpoint(client):
    response = await client.post(
        "/api/v1/financial-data/",
        json=test_data,
        headers=auth_headers
    )
    assert response.status_code == 200
```

---

## 📅 Implementation Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Repository Pattern | 2-3 days | High |
| Phase 2: Service Layer | 2-3 days | High |
| Phase 3: Calculator Strategy | 1-2 days | Medium |
| Phase 4: Refactor Endpoints | 1 day | High |
| Phase 5: Frontend Refactoring | 2-3 days | Medium |
| **Total** | **8-12 days** | |

---

## 🚀 Migration Strategy

### Incremental Approach (Recommended)
1. **Week 1:** Implement new architecture alongside old code
2. **Week 2:** Gradually migrate endpoints to new structure
3. **Week 3:** Remove old code, update tests
4. **Week 4:** Frontend refactoring

### Benefits:
- No downtime
- Can test new code in parallel
- Easy rollback if issues arise

---

## 📋 Checklist

### Before Starting
- [ ] Review current codebase thoroughly
- [ ] Write tests for existing functionality
- [ ] Document current API contracts
- [ ] Set up development branch

### During Refactoring
- [ ] Create interfaces first
- [ ] Implement concrete classes
- [ ] Write unit tests for each component
- [ ] Update API endpoints gradually
- [ ] Keep old code until migration complete

### After Refactoring
- [ ] Remove deprecated code
- [ ] Update documentation
- [ ] Performance testing
- [ ] Security audit
- [ ] Deploy to staging
- [ ] Deploy to production

---

**This refactoring will transform the codebase into a maintainable, testable, and extensible system following SOLID principles!**
