import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

cmd = 'docker exec event-mysql-db mysql -uevent_user -pSecretDbPass2026! event_manager_db -e "SELECT id, email, role, business_name FROM caterers;"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("=== Caterers ===")
print(stdout.read().decode())

cmd = 'docker exec event-mysql-db mysql -uevent_user -pSecretDbPass2026! event_manager_db -e "SELECT id, name, email, access_link_token FROM clients;"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("=== Clients ===")
print(stdout.read().decode())

cmd = 'docker exec event-mysql-db mysql -uevent_user -pSecretDbPass2026! event_manager_db -e "SELECT id, full_name, email, invitation_token FROM guests LIMIT 5;"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("=== Guests Sample ===")
print(stdout.read().decode())

ssh.close()
