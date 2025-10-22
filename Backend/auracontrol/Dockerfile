FROM openjdk:21-jdk-slim
WORKDIR /app

COPY target/auracontrol-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]