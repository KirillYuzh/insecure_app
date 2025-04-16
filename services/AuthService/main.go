package main

import (
	"database/sql"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var db *sql.DB

func main() {
	initDB()

	router := gin.Default()

	// Настройка CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8081"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.POST("/auth/login", login)
	router.POST("/auth/login/", login)

	router.POST("/auth/logout", logout)
	router.POST("/auth/logout/", logout)

	router.POST("/auth/signup", signup)
	router.POST("/auth/signup/", signup)

	router.GET("/auth/account", authMiddleware(), getAccount)
	router.GET("/auth/account/", authMiddleware(), getAccount)

	if err := router.Run("localhost:8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
