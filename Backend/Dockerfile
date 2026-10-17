# Lightweight JRE 21 runtime running pre-compiled Spring Boot JAR
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create upload storage directories
RUN mkdir -p /app/uploads/menu /app/uploads/templates

# Copy packaged jar artifact
COPY target/EventManager-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]
