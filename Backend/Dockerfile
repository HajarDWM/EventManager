# Stage 1: Build Spring Boot JAR with Maven
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

ENV MAVEN_OPTS="-Djava.net.preferIPv4Stack=true -Xmx1024m"

# Copy Maven POM and source code
COPY pom.xml ./
COPY src ./src

# Compile and package JAR
RUN mvn clean package -DskipTests -B

# Stage 2: Lightweight JRE 21 runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create upload storage directories
RUN mkdir -p /app/uploads/menu /app/uploads/templates

# Copy packaged jar artifact from builder stage
COPY --from=builder /build/target/EventManager-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Dfile.encoding=UTF-8", "-Dspring.profiles.active=docker", "-jar", "app.jar"]
