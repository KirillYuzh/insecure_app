FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline

COPY src ./src

RUN ./mvnw clean package -DskipTests && \
    ls -la /app/target/  # Проверяем содержимое папки target

RUN groupadd -r appuser && \
    useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app/target && \
    find /app/target -type d -exec chmod 755 {} \; && \
    find /app/target -type f -exec chmod 644 {} \; && \
    chmod 755 /app/target/*.jar

RUN JAR_FILE=$(ls /app/target/*.jar) && \
    echo "JAR file: $JAR_FILE" && \
    ln -sf $JAR_FILE /app/target/authservice.jar

USER appuser

ENTRYPOINT ["java", "-jar", "/app/target/authservice.jar"]

# docker build -t auth-service .
# docker run -p 8080:8080 auth-service