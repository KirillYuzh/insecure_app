package main

import (
	"database/sql"
	"log"

	"services/AuthService/database"
	"services/AuthService/handlers"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("postgres", "your_connection_string")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	database.SetDB(db) // Инициализация DB в пакете database

	router := gin.Default()

	// Auth routes
	authGroup := router.Group("/auth")
	{
		authGroup.POST("/login", handlers.Login)
		authGroup.POST("/signup", handlers.Signup)
		authGroup.POST("/logout", handlers.Logout)
	}

	// Account routes
	accountGroup := router.Group("/account")
	accountGroup.Use(handlers.AuthMiddleware())
	{
		accountGroup.GET("", handlers.GetAccount)
	}

	// Admin routes
	adminGroup := router.Group("/admin")
	adminGroup.Use(handlers.AuthMiddleware())
	adminGroup.Use(handlers.RequireRole("admin"))
	{
		// Здесь будут админские роуты
	}

	if err := router.Run("localhost:8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
