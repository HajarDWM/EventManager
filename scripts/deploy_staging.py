#!/usr/bin/env python3
"""
EventManager - Script de Déploiement Automatisé Staging (Serveur Local VM)
Construit le Frontend en local (Windows), pousse sur Git, et met à jour la VM
en 5 secondes chrono via SSH (sans re-téléchargement Node/npm dans la VM).
"""

import os
import sys
import subprocess
import paramiko
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT_DIR / ".env.local_server"

def load_credentials():
    creds = {
        "host": "192.168.11.110",
        "port": 22,
        "user": "hajar",
        "password": "199600",
        "remote_dir": "/home/hajar/apps/EventManager"
    }
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or not line or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k == "VM_HOST": creds["host"] = v
                elif k == "VM_PORT": creds["port"] = int(v)
                elif k == "VM_USER": creds["user"] = v
                elif k == "VM_PASSWORD": creds["password"] = v
                elif k == "VM_REMOTE_DIR": creds["remote_dir"] = v
    return creds

def run_local(cmd, cwd=None):
    print(f"\n[LOCAL EXEC] {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd or ROOT_DIR)
    if res.returncode != 0:
        print(f"❌ Échec de la commande locale (code {res.returncode})")
        sys.exit(res.returncode)

def run_remote(ssh, cmd):
    print(f"\n[REMOTE EXEC] {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    if out:
        print(out)
    return out

def main():
    creds = load_credentials()
    print("=" * 70)
    print("🚀 DÉPLOIEMENT RAPIDE STAGING (SERVEUR LOCAL)")
    print(f"Cible : {creds['user']}@{creds['host']}:{creds['port']}")
    print("=" * 70)

    # 1. Build local Angular si nécessaire
    build_choice = input("\n[1/3] Voulez-vous re-compiler le Frontend Angular en local ? (o/n, défaut: o) : ").strip().lower()
    if build_choice != 'n':
        print("\n⚡ Compilation Angular sur Windows (rapide)...")
        run_local("npm run build", cwd=ROOT_DIR / "Frontend")
        run_local("git add Frontend/dist; git commit -m 'build(frontend): update precompiled dist bundle'; git push origin main")

    # 2. Connexion SSH
    print(f"\n[2/3] Connexion SSH à {creds['host']}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(creds["host"], creds["port"], creds["user"], creds["password"], timeout=10)
        print(" Connexion SSH établie.")
    except Exception as e:
        print(f"❌ Impossible de se connecter en SSH: {e}")
        sys.exit(1)

    # 3. Pull & Déploiement instantané sur la VM
    print("\n[3/3] Mise à jour et relance des conteneurs sur la VM...")
    remote_dir = creds["remote_dir"]
    run_remote(ssh, f"cd {remote_dir} && git pull origin main")
    run_remote(ssh, f"cd {remote_dir} && docker compose up -d --build event-frontend")

    # Vérification
    print("\n Vérification de l'état des conteneurs...")
    run_remote(ssh, f"cd {remote_dir} && docker compose ps")

    ssh.close()
    print("\n" + "=" * 70)
    print("✨ DÉPLOIEMENT TERMINÉ EN QUELQUES SECONDES !")
    print("👉 Accès Express : http://192.168.11.110/express")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()

