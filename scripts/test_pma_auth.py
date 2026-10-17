import json
import paramiko
import time
import urllib.request

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

print("Stopping event-phpmyadmin...")
ssh.exec_command("docker stop event-phpmyadmin && docker rm event-phpmyadmin")
time.sleep(2)

print("Starting event-phpmyadmin with cookie auth (PMA_HOST=event-db, no PMA_USER/PMA_PASSWORD)...")
cmd = "docker run -d --name event-phpmyadmin --restart always --network eventmanager_prod_network -p 9513:80 -e PMA_HOST=event-db -e PMA_PORT=3306 -e PMA_ARBITRARY=0 phpmyadmin:5.2.1"
stdin, stdout, stderr = ssh.exec_command(cmd)
print("Run output:", stdout.read().decode(), stderr.read().decode())

time.sleep(3)

# Test HTTP GET
try:
    req = urllib.request.urlopen("http://41.214.254.0:9513")
    html = req.read().decode('utf-8', errors='ignore')
    print("HTTP Status:", req.status)
    if "pma_username" in html or "input_username" in html or "Log in" in html:
        print("[SUCCESS] phpMyAdmin is now presenting the login screen requesting username & password!")
    else:
        print("[WARNING] Check page contents:")
        for line in html.splitlines()[:20]:
            print(" ", line)
except Exception as e:
    print("HTTP Request failed:", e)

ssh.close()
