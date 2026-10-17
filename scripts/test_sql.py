import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

cmd = 'docker exec event-mysql-db mysql -uevent_user -pSecretDbPass2026! event_manager_db -e "SELECT VERSION();"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("MySQL version:", stdout.read().decode())
print("stderr:", stderr.read().decode())

cmd = 'docker exec event-mysql-db mysql -uevent_user -pSecretDbPass2026! event_manager_db -e "DELETE FROM flyway_schema_history WHERE version = \'23\' AND success = 0;"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("Delete failed row result:", stdout.read().decode())
print("stderr:", stderr.read().decode())

cmd = 'docker exec event-mysql-db mysql -uevent_user -pSecretDbPass2026! event_manager_db -e "SELECT installed_rank, version, description, success FROM flyway_schema_history ORDER BY installed_rank;"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print("Flyway Schema History:\n", stdout.read().decode())

ssh.close()
