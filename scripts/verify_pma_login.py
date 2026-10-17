import urllib.request
import urllib.parse
import http.cookiejar
import re

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Fetch login page to get token
resp = opener.open("http://41.214.254.0:9513/")
html = resp.read().decode('utf-8')
token_match = re.search(r'name="token"\s+value="([a-zA-Z0-9_-]+)"', html)
token = token_match.group(1) if token_match else ""

# 2. Test Invalid Password
bad_data = urllib.parse.urlencode({
    'set_session': token,
    'token': token,
    'pma_username': 'event_user',
    'pma_password': 'WrongPassword123!',
    'server': '1'
}).encode('utf-8')

req = urllib.request.Request("http://41.214.254.0:9513/index.php?route=/", data=bad_data)
resp_bad = opener.open(req)
html_bad = resp_bad.read().decode('utf-8', errors='ignore')

if "Access denied" in html_bad or "pma_username" in html_bad or "Erreur" in html_bad:
    print("[SUCCESS] Invalid credentials correctly rejected!")

# 3. Test Valid Password
token_match2 = re.search(r'name="token"\s+value="([a-zA-Z0-9_-]+)"', html_bad)
token2 = token_match2.group(1) if token_match2 else token

good_data = urllib.parse.urlencode({
    'set_session': token2,
    'token': token2,
    'pma_username': 'event_user',
    'pma_password': 'SecretDbPass2026!',
    'server': '1'
}).encode('utf-8')

req2 = urllib.request.Request("http://41.214.254.0:9513/index.php?route=/", data=good_data)
resp_good = opener.open(req2)
html_good = resp_good.read().decode('utf-8', errors='ignore')

if "event_manager_db" in html_good or "User: event_user@" in html_good:
    print("[SUCCESS] Valid credentials successfully authenticated!")
else:
    print("[ERROR] Login failed with valid credentials")
