import json
import paramiko

with open('server-config.json') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

stdin, stdout, stderr = ssh.exec_command("ss -tlpn | grep -E ':(951[0-9]|9520)' || echo 'PORTS_FREE'")
out = stdout.read().decode().strip()
print("Remote Ports Status:")
print(out)

# Check if docker is running any containers
stdin, stdout, stderr = ssh.exec_command("docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'")
print("\nRunning Containers on Server:")
print(stdout.read().decode().strip())

ssh.close()
