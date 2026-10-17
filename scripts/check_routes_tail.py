import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

stdin, stdout, stderr = ssh.exec_command('wc -l /opt/traefik/dynamic/routes.yml')
print("Line count:", stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('tail -n 40 /opt/traefik/dynamic/routes.yml')
print("Tail:\n", stdout.read().decode())

ssh.close()
