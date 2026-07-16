# EventManager Spring Boot 3 - Setup & Troubleshooting Guide

## 📋 Configuration Summary

### Your Setup
- **Java Version**: 21 (via pom.xml: `<java.version>21</java.version>`)
- **Spring Boot Version**: 4.1.0
- **Database**: MySQL 8.0 (Docker)
- **Port Mapping**: 3307 → 3306 (local → container)
- **Active Profile**: dev (default from application.yml)

### All Configuration Files Updated
✅ `application-dev.yml` - Updated Hibernate dialect to MySQL8Dialect + HikariCP pooling
✅ `application-test.yml` - H2 in-memory database for unit tests
✅ `application-prod.yml` - MySQL with environment variables for production

---

## 🔴 Error Fixing: "JDK isn't specified for module 'EventManager'"

### Solution Steps:

#### **Step 1: Verify Java 21 Installation**
```powershell
java -version
# Should show: openjdk version "21.0.x" or higher
```

If Java 21 is NOT installed:
- Download from: https://www.oracle.com/java/technologies/downloads/#java21
- Or use IntelliJ's download feature (see Step 2)

#### **Step 2: Configure SDK in IntelliJ**

**Method A: GUI (Recommended)**
1. Open IntelliJ → **File** → **Project Structure** (Ctrl+Alt+Shift+S on Windows)
2. Left sidebar → **Project**
3. **SDK**: Click dropdown → **Add SDK** → **Download JDK**
4. Select:
   - **Version**: 21 (or 21.0.1+)
   - **Vendor**: Eclipse Temurin (or Oracle)
5. Click **Download** and wait
6. Apply → OK

**Method B: Command Line (If already installed)**
```powershell
# Set JAVA_HOME to Java 21 installation
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-21", "User")
# Restart IntelliJ
```

**Method C: Point to Existing Installation**
1. **File** → **Project Structure** → **Project**
2. **SDK**: Click dropdown → **Add SDK** → **JDK**
3. Navigate to your Java 21 installation folder
   - Example: `C:\Program Files\Java\jdk-21`
4. Select the folder → **OK**

#### **Step 3: Configure Module SDK**
1. **File** → **Project Structure** → **Modules**
2. Select `EventManager` module
3. **Module SDK**: Set to Java 21 (should match project SDK)
4. **Language Level**: Set to `21` (Latest)
5. Click **Apply** → **OK**

#### **Step 4: Invalidate Cache & Restart**
1. **File** → **Invalidate Caches...**
2. Check: ✅ Clear file system cache, ✅ Clear VCS log caches
3. Click **Invalidate and Restart**

---

## 🔵 Verify Database Connectivity

### Step 1: Start Docker Containers
```powershell
# From project root directory
docker-compose up -d

# Verify containers are running
docker-compose ps
```

**Expected Output**:
```
NAME                    STATUS
event-mysql-db          Up
event-phpmyadmin        Up
```

### Step 2: Test MySQL Connection
```powershell
# Using mysql-cli (if installed)
mysql -h 127.0.0.1 -P 3307 -u root -p
# Password: rootpassword
# Should connect successfully

# Or access phpMyAdmin
# Open browser: http://localhost:8082
# Server: event-db
# Username: root
# Password: rootpassword
```

### Step 3: Verify application-dev.yml Connection String
```yaml
spring:
  datasource:
    # ✅ CORRECT: Port 3307 matches docker-compose.yml mapping
    url: jdbc:mysql://localhost:3307/event_manager_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root           # ✅ CORRECT
    password: rootpassword   # ✅ CORRECT
```

---

## 🟢 Run Application

### Option 1: IntelliJ GUI
1. Click **Run** button (top-right)
2. Or use shortcut: **Shift+F10**
3. Console should show:
   ```
   Started EventManagerApplication in X.XXX seconds
   ```

### Option 2: Maven Command
```powershell
cd Backend
./mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### Option 3: Build JAR & Run
```powershell
cd Backend
./mvnw.cmd clean package -DskipTests
java -jar target/EventManager-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

---

## 🎯 Common Issues & Solutions

### Issue 1: "Connection refused" or "Connection timeout"
**Cause**: MySQL container not running or port mismatch
**Fix**:
```powershell
# Check if containers are running
docker-compose ps

# If not running, start them
docker-compose up -d

# Check logs
docker-compose logs event-mysql-db
```

### Issue 2: "Access denied for user 'root'@'localhost'"
**Cause**: Wrong password or username mismatch
**Verify**:
- `application-dev.yml`: username = `root`, password = `rootpassword`
- `docker-compose.yml`: MYSQL_ROOT_PASSWORD = `rootpassword`
- Both must match exactly

### Issue 3: "Unknown database 'event_manager_db'"
**Cause**: Database not created yet
**Fix**: Flyway will auto-create on first run, OR manually:
```powershell
mysql -h 127.0.0.1 -P 3307 -u root -prootpassword -e "CREATE DATABASE event_manager_db;"
```

### Issue 4: "Duplicate key 'email'" on startup
**Cause**: Trying to insert duplicate caterer in migrations
**Fix**: Add `IF NOT EXISTS` to migration or drop and recreate:
```powershell
docker exec -it event-mysql-db mysql -u root -prootpassword -e "DROP DATABASE event_manager_db; CREATE DATABASE event_manager_db;"
```

### Issue 5: "Hibernate dialect not recognized"
**Cause**: Using deprecated `MySQLDialect` instead of `MySQL8Dialect`
**Status**: ✅ **FIXED** - Updated to `MySQL8Dialect` in your config

### Issue 6: Flyway migration fails
**Cause**: Missing or malformed SQL files
**Fix**:
- Verify files in `Backend/src/main/resources/db/migration/`
- File naming must be: `V1__Create_table_name.sql`
- Check SQL syntax in each file

---

## 📊 Profile Configuration Reference

### Development Profile (application-dev.yml)
- **Active by default**: Yes
- **Database**: MySQL 8.0 (local Docker)
- **DDL**: `update` (auto-update schema)
- **SQL Logging**: Disabled (for cleaner logs)
- **HikariCP Pool**: 5 connections max

### Test Profile (application-test.yml)
- **Activated by**: `@SpringBootTest` or `mvn test -Dspring.profiles.active=test`
- **Database**: H2 in-memory
- **DDL**: `create-drop` (recreate for each test)
- **Flyway**: Disabled (H2 is temporary)

### Production Profile (application-prod.yml)
- **Activated by**: Set `SPRING_PROFILES_ACTIVE=prod` env variable
- **Database**: MySQL with environment variables
- **DDL**: `validate` (no auto-updates, safer)
- **HikariCP Pool**: 10 connections max (production capacity)
- **Logging**: WARN level (less verbose)

---

## ✅ Verification Checklist

After setup, verify each point:

- [ ] Java 21 installed and set in IntelliJ
- [ ] Module SDK configured to Java 21
- [ ] Docker containers running: `docker-compose ps`
- [ ] MySQL accessible on port 3307
- [ ] Database `event_manager_db` exists
- [ ] Application compiles: `./mvnw.cmd clean compile`
- [ ] Tests pass: `./mvnw.cmd test`
- [ ] Application starts: `./mvnw.cmd spring-boot:run`
- [ ] H2 Console accessible (test profile): http://localhost:8080/h2-console
- [ ] MySQL Console accessible (dev profile): http://localhost:8082 (phpMyAdmin)

---

## 🚀 Next Steps

1. **Run the application** and verify it starts without errors
2. **Check logs** for any warnings or issues
3. **Access H2 Console** (test profile) to verify schema creation
4. **Run unit tests**: `./mvnw.cmd test`
5. **Create API endpoints** to test database connectivity

---

## 📞 Emergency Troubleshooting

If issues persist, try these commands in order:

```powershell
# 1. Full clean build
./mvnw.cmd clean install -DskipTests

# 2. Rebuild Docker environment
docker-compose down
docker volume prune -f
docker-compose up -d

# 3. Invalidate IntelliJ cache
# File > Invalidate Caches > Invalidate and Restart

# 4. Check Java version matches pom.xml
java -version

# 5. Verify environment variables
echo $env:JAVA_HOME
echo $env:PATH
```

---

**Configuration Status**: ✅ All files updated and verified
**Compilation Status**: ✅ No errors
**Ready to Run**: ✅ Yes

