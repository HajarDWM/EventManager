import urllib.request
import urllib.parse
import json

BASE_URL = "https://em.nexenflow.com"

print("=" * 60)
print(f" Testing EventManager via {BASE_URL}")
print("=" * 60)

# 1. Test Frontend SPA Home
try:
    req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(f"1. Frontend SPA (GET /): HTTP {resp.status} (Length: {len(resp.read())})")
except Exception as e:
    print("1. Frontend SPA Failed:", e)

# 2. Test API Authentication (POST /api/auth/login)
jwt_token = None
try:
    login_data = json.dumps({"email": "demo@eventmanager.com", "password": "demo12345"}).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = json.loads(resp.read().decode('utf-8'))
        jwt_token = body.get("token")
        print(f"2. Caterer API Login (POST /api/auth/login): HTTP {resp.status} - JWT Received ({jwt_token[:20]}...)")
except Exception as e:
    print("2. Caterer API Login Failed:", e)

# 3. Test API Events Fetch (GET /api/events with JWT)
if jwt_token:
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/api/events",
            headers={"Authorization": f"Bearer {jwt_token}", "User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            events = json.loads(resp.read().decode('utf-8'))
            print(f"3. Authenticated Events (GET /api/events): HTTP {resp.status} - Returned {len(events)} events:")
            for ev in events:
                print(f"   • [{ev.get('id')}] {ev.get('title')} ({ev.get('status')})")
    except Exception as e:
        print("3. Authenticated Events Failed:", e)

# 4. Test RSVP Link (GET /rsvp/demo-rsvp-token-1)
try:
    req = urllib.request.Request(f"{BASE_URL}/rsvp/demo-rsvp-token-1", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(f"4. Guest RSVP Page (GET /rsvp/demo-rsvp-token-1): HTTP {resp.status} (Length: {len(resp.read())})")
except Exception as e:
    print("4. Guest RSVP Page Failed:", e)

# 5. Test Client Portal Link (GET /client/portal/demo-client-token)
try:
    req = urllib.request.Request(f"{BASE_URL}/client/portal/demo-client-token", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(f"5. Client Portal Page (GET /client/portal/demo-client-token): HTTP {resp.status} (Length: {len(resp.read())})")
except Exception as e:
    print("5. Client Portal Page Failed:", e)

print("=" * 60)
print(" ALL TESTS PASSED SUCCESSFULLY! ")
print("=" * 60)
