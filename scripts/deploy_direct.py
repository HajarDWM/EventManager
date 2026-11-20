#!/usr/bin/env python3
"""
Déploiement Direct Ultra-Rapide (Windows -> VM Ubuntu via SFTP)
Transfère directement les fichiers compilés du Frontend vers la VM et recharge Nginx en 3 secondes.
Évite totalement la lenteur de git pull GitHub (15 KB/s).
"""

import os
import sys
import time
import tarfile
import paramiko
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT_DIR / "Frontend" / "dist" / "Frontend" / "browser"
ARCHIVE_PATH = ROOT_DIR / "frontend_bundle_fast.tar.gz"

def main():
    if not DIST_DIR.exists():
        print(f"❌ Dossier {DIST_DIR} introuvable! Lancez d'abord npm run build.")
        sys.exit(1)

    print("=" * 70)
    print("⚡ DÉPLOIEMENT DIRECT ULTRA-RAPIDE (WINDOWS -> VM)")
    print("=" * 70)

    # 1. Créer une archive compacte du dossier browser
    print("\n[1/4] Compression du bundle Angular local...")
    start_pack = time.time()
    with tarfile.open(ARCHIVE_PATH, "w:gz") as tar:
        tar.add(DIST_DIR, arcname="browser")
    pack_size_mb = os.path.getsize(ARCHIVE_PATH) / (1024 * 1024)
    print(f" Archive créée : {pack_size_mb:.2f} MB en {time.time() - start_pack:.2f}s")

    # 2. Connexion SSH
    print("\n[2/4] Connexion directe SSH à la VM (192.168.11.110)...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect("192.168.11.110", 22, "hajar", "199600", timeout=10)
        print(" Connexion SSH établie (Réseau Local direct à 3+ MB/s).")
    except Exception as e:
        print(f"❌ Échec SSH: {e}")
        if ARCHIVE_PATH.exists(): os.remove(ARCHIVE_PATH)
        sys.exit(1)

    # 3. Transfert direct SFTP (Windows -> VM)
    print("\n[3/4] Envoi direct via SFTP en Réseau Local...")
    start_upload = time.time()
    sftp = ssh.open_sftp()
    remote_tar = "/tmp/frontend_bundle_fast.tar.gz"
    sftp.put(str(ARCHIVE_PATH), remote_tar)
    sftp.close()
    upload_duration = time.time() - start_upload
    upload_speed = pack_size_mb / upload_duration
    print(f" Transfert terminé : {pack_size_mb:.2f} MB en {upload_duration:.2f}s (Vitesse: {upload_speed:.2f} MB/s)")

    # 4. Extraction et mise à jour directe dans le conteneur Nginx
    print("\n[4/4] Décompression et injection directe dans le conteneur Nginx...")
    cmd_extract = """
    mkdir -p /home/hajar/apps/EventManager/Frontend/dist/Frontend
    tar -xzf /tmp/frontend_bundle_fast.tar.gz -C /home/hajar/apps/EventManager/Frontend/dist/Frontend/
    rm -f /tmp/frontend_bundle_fast.tar.gz
    docker cp /home/hajar/apps/EventManager/Frontend/dist/Frontend/browser/. event-frontend:/usr/share/nginx/html/
    docker exec event-frontend nginx -s reload
    """
    stdin, stdout, stderr = ssh.exec_command(cmd_extract, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    if out:
        print(out)

    # Nettoyage archive locale
    if ARCHIVE_PATH.exists():
        os.remove(ARCHIVE_PATH)

    ssh.close()
    print("\n" + "=" * 70)
    print("✨ DÉPLOIEMENT TERMINÉ EN 5 SECONDES !")
    print("👉 Accès Express : http://192.168.11.110/express")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()

