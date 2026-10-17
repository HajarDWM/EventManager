import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

stdin, stdout, stderr = ssh.exec_command('echo "K@plus@2026" | sudo -S whoami')
print("Sudo output:", stdout.read().decode())
print("Sudo err:", stderr.read().decode())

ssh.close()
