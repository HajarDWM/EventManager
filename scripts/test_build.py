import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

cmd = 'docker run --rm -e NODE_OPTIONS=--dns-result-order=ipv4first node:22-alpine node -e "fetch(\'https://registry.npmjs.org/@angular/core\').then(r => console.log(\'Fetch success status:\', r.status))"'
print("Testing Node fetch from container...")
stdin, stdout, stderr = ssh.exec_command(cmd)
print(stdout.read().decode())
print(stderr.read().decode())

ssh.close()
