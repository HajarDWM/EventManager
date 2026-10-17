import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

print("=== /opt/traefik/traefik.yml ===")
stdin, stdout, stderr = ssh.exec_command('cat /opt/traefik/traefik.yml')
print(stdout.read().decode())

print("\n=== /opt/traefik/dynamic/routes.yml ===")
stdin, stdout, stderr = ssh.exec_command('cat /opt/traefik/dynamic/routes.yml')
print(stdout.read().decode())

ssh.close()
