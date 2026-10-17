@echo off
echo ===================================================
echo   EventManager - Demarrage de l'Environnement Demo
echo ===================================================
echo.

echo Verification des binaires...
if not exist "Backend\target\EventManager-0.0.1-SNAPSHOT.jar" (
    echo Compilation du Backend Spring Boot (Maven)...
    cd Backend && call .\mvnw.cmd clean package -DskipTests && cd ..
)

if not exist "Frontend\dist\Frontend\browser\index.html" (
    echo Compilation du Frontend Angular...
    cd Frontend && call npm run build && cd ..
)

echo Lancement des conteneurs Docker...
docker compose up -d --build

echo.
echo Attente de l'initialisation des conteneurs (10s)...
timeout /t 10 /nobreak >nul

echo.
echo ===================================================
echo   EventManager est operationnel !
echo ===================================================
echo   - Application Web : http://localhost
echo   - Espace Client   : http://localhost/client/login?token=demo-client-token
echo   - Invitation RSVP : http://localhost/rsvp/demo-rsvp-token-1
echo   - phpMyAdmin      : http://localhost:8082
echo.
echo   Identifiants Traiteur : demo@eventmanager.com / demo12345
echo   Identifiants Admin    : admin@eventmanager.com / admin12345
echo ===================================================
echo.

start http://localhost/login
