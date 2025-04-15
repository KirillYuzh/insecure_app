FROM node:18-alpine AS build

WORKDIR /app

# 1. Копируем только файлы зависимостей сначала
COPY package.json package-lock.json ./

# 2. Устанавливаем зависимости с очисткой кеша
RUN npm ci --silent && \
    npm cache clean --force


COPY . .

# 4. Проверяем структуру проекта (для отладки)
RUN ls -la

# 5. Запускаем сборку с выводом логов
RUN npm run build || (echo "Build failed. Logs:" && cat /app/logs/*.log && exit 1)

# 6. Финальный образ
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]