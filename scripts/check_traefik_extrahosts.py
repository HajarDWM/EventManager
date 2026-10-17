import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

stdin, stdout, stderr = ssh.exec_command('docker inspect traefik --format="{{json .HostConfig.ExtraHosts}}"')
print('ExtraHosts:', stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('docker exec traefik ping -c 1 host.docker.internal 2>&1 || true')
print('Ping test:\n', stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('docker exec traefik wget -qO- --timeout=3 http://host.docker.internal:9510 | head -n 10')
print('Wget 9510 from Traefik:\n', stdout.read().decode())

ssh.close()
