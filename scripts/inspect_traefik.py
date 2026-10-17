import json
import paramiko

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

print("=== All Running Docker Containers ===")
stdin, stdout, stderr = ssh.exec_command('docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Networks}}"')
print(stdout.read().decode())

print("=== Traefik Inspection ===")
stdin, stdout, stderr = ssh.exec_command('docker ps --filter name=traefik --format "{{.ID}} {{.Names}}"')
traefik_out = stdout.read().decode().strip()
print("Traefik container:", traefik_out)

if traefik_out:
    t_id = traefik_out.split()[0]
    stdin, stdout, stderr = ssh.exec_command(f'docker inspect {t_id} --format "{{{{json .HostConfig.Binds}}}}"')
    print("Binds/Volumes:", stdout.read().decode())
    
    stdin, stdout, stderr = ssh.exec_command(f'docker inspect {t_id} --format "{{{{json .Config.Cmd}}}}"')
    print("Cmd/Args:", stdout.read().decode())

    stdin, stdout, stderr = ssh.exec_command(f'docker inspect {t_id} --format "{{{{json .NetworkSettings.Networks}}}}"')
    print("Networks:", stdout.read().decode())

ssh.close()
