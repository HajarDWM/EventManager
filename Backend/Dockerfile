# Lightweight JRE 21 runtime using pre-compiled JAR (Instant 2-second build)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create upload storage directories
RUN mkdir -p /app/uploads/menu /app/uploads/templates

# Copy pre-compiled JAR artifact
COPY target/EventManager-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Dfile.encoding=UTF-8", "-Dspring.profiles.active=docker", "-jar", "app.jar"]
