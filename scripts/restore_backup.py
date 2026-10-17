import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

def run_sudo(cmd):
    full_cmd = f'echo "{cfg["password"]}" | sudo -S {cmd}'
    stdin, stdout, stderr = ssh.exec_command(full_cmd)
    return stdout.read().decode(), stderr.read().decode()

out, err = run_sudo("cp /opt/traefik/dynamic/routes.yml.bak_1792269303 /opt/traefik/dynamic/routes.yml")
print("Restored backup:", out, err)

ssh.close()
