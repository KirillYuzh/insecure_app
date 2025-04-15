# backend/Dockerfile
FROM golang:1.24.1-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o app

# Создаем новый этап с минимальным образом
FROM alpine:latest

WORKDIR /app

# Копируем бинарник из builder-этапа
COPY --from=builder /app/app /app/app

# Создаем непривилегированного пользователя
RUN adduser -D -g '' appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080
CMD ["./app"]