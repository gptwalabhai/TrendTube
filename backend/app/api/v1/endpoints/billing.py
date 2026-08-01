from fastapi import APIRouter

router = APIRouter()

@router.get("/plans")
async def get_billing_plans():
    return {
        "success": True,
        "plans": [
            {
                "id": "starter",
                "name": "Starter Creator",
                "price_monthly": 29,
                "price_yearly": 24,
                "features": ["1,000 Trend Discoveries/mo", "5 Connected Accounts", "AI Script Generator", "Basic Analytics"]
            },
            {
                "id": "pro",
                "name": "Pro Agency",
                "price_monthly": 79,
                "price_yearly": 64,
                "is_popular": True,
                "features": ["Unlimited Discoveries", "25 Connected Accounts", "Full AI Studio Suite", "YouTube Auto-Publishing", "Priority Scraping Engine"]
            },
            {
                "id": "enterprise",
                "name": "Enterprise Scale",
                "price_monthly": 249,
                "price_yearly": 199,
                "features": ["Dedicated Webhooks & API Keys", "Custom Scraping Proxies", "Unlimited Team Members", "24/7 Dedicated Account Manager"]
            }
        ]
    }
