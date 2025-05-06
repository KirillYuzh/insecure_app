# Сборка приложения
FROM golang:1.21.4-alpine AS builder

WORKDIR /app

# Кэширование зависимостей
COPY . .
RUN go mod download

# Копируем исходники и собираем
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main .

# Финальный образ
FROM alpine:3.19

# Создаем непривилегированного пользователя
RUN addgroup -S appuser && adduser -S -G appuser appuser

WORKDIR /home/appuser

# Копируем бинарник
COPY --from=builder --chown=appuser:appuser /app/main .

# Настройки безопасности
RUN chmod 550 ./main && \
    find / -perm +6000 -type f -exec chmod a-s {} \; || true

USER appuser

CMD ["./main"]