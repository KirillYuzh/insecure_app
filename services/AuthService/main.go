package main

import (
	"database/sql"
	"log"
	// "log"

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
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Маршруты
	router.GET("/")
	router.POST("/login", login)
	router.POST("/login/", login)

	router.POST("/logout", logout)
	router.POST("/logout/", logout)

	router.POST("/signup", signup)
	router.POST("/signup/", signup)

	if err := router.Run("localhost:8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
