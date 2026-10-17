import json
import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=15)

def run_cmd(cmd, desc):
    print(f"\n>>> {desc}: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line.rstrip())
    exit_code = stdout.channel.recv_exit_status()
    print(f"Exit status: {exit_code}")
    return exit_code

run_cmd("cd /home/manager/eventmanager && git fetch origin main && git reset --hard origin/main", "Pull latest git code")
run_cmd("cd /home/manager/eventmanager && docker compose -f docker-compose.prod.yml up -d --build event-backend", "Rebuild and restart event-backend")

ssh.close()
