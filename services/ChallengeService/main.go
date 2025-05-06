package main

import (
	"database/sql"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var db *sql.DB

func main() {
	// Инициализация базы данных
	initDB()

	router := gin.Default()

	// Настройка CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.GET("/")

	router.GET("/tasks", getTasks)
	router.GET("/tasks/", getTasks)

	router.POST("/tasks/flag", authMiddleware(), submitFlag)
	router.POST("/tasks/flag/", authMiddleware(), submitFlag)

	if err := router.Run("localhost:8081"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
