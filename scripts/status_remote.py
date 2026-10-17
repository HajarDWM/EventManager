import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker ps -a --filter name=event- --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
print("=== EventManager Containers ===")
print(stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('ps aux | grep -i buildx | grep -v grep')
out = stdout.read().decode()
if out.strip():
    print("=== Compilation Still in Progress (buildx running) ===")
    stdin2, stdout2, stderr2 = ssh.exec_command("ps -eo pid,pcpu,pmem,args | grep -E 'node|maven|java' | grep -v grep")
    print(stdout2.read().decode())
else:
    print("=== Build Completed ===")

stdin, stdout, stderr = ssh.exec_command("ss -tlpn | grep -E ':(951[0-9]|9520)' || echo 'No ports listening yet'")
print("\n=== Ports 9510-9520 Status ===")
print(stdout.read().decode())

ssh.close()
