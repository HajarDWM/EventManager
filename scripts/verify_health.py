import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

cmd = 'docker compose -f /home/manager/eventmanager/docker-compose.prod.yml logs --tail 30 event-backend'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("=== Backend Logs ===")
print(stdout.read().decode())

cmd = 'curl -sI http://127.0.0.1:9510 | head -n 5'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("=== Frontend HTTP Health (Port 9510) ===")
print(stdout.read().decode())

cmd = '''curl -s -X POST http://127.0.0.1:9510/api/auth/login -H "Content-Type: application/json" -d '{"email":"demo@eventmanager.com","password":"demo12345"}' '''
stdin, stdout, stderr = ssh.exec_command(cmd)
print("=== Nginx -> Backend Proxy Login Test (Port 9510) ===")
print(stdout.read().decode())

cmd = 'curl -sI http://127.0.0.1:9510/rsvp/demo-rsvp-token-1 | head -n 5'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("\n=== RSVP Route Test (Port 9510) ===")
print(stdout.read().decode())

cmd = '''
TOKEN=$(curl -s -X POST http://127.0.0.1:9510/api/auth/login -H "Content-Type: application/json" -d '{"email":"demo@eventmanager.com","password":"demo12345"}' | sed -E 's/.*"token":"([^"]+)".*/\\1/')
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:9510/api/events
'''
stdin, stdout, stderr = ssh.exec_command(cmd)
print("\n=== Authenticated Events Fetch (/api/events) ===")
print(stdout.read().decode())

ssh.close()
