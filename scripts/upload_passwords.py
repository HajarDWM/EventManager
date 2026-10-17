import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

sftp = ssh.open_sftp()
sftp.put('PASSWORDS.md', '/home/manager/eventmanager/PASSWORDS.md')
sftp.close()
print("PASSWORDS.md successfully copied to /home/manager/eventmanager/PASSWORDS.md on the remote server.")

stdin, stdout, stderr = ssh.exec_command('ls -lh /home/manager/eventmanager/PASSWORDS.md')
print(stdout.read().decode())

ssh.close()
