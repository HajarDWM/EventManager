import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

stdin, stdout, stderr = ssh.exec_command('sed -n "360,378p" /opt/traefik/dynamic/routes.yml')
for i, line in enumerate(stdout.read().decode().splitlines(), 360):
    print(f'{i:3d}: {line}')

ssh.close()
