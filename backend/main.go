package main

import (
	"database/sql"
	"log"
	"net/http"

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
	router.GET("/", getReadme)
	router.POST("/login/", login)
	router.POST("/signup/", signup)
	router.GET("/tasks/", getTasks)
	router.GET("/scoring-table/", getScoringTable)
	router.GET("/account/", authMiddleware(), getAccount)
	router.GET("/all-tasks/", authMiddleware(), getAllTasks)
	router.PATCH("/tasks/:id/", updateTaskActive)
	router.OPTIONS("/tasks/:id/", func(c *gin.Context) {
		c.Status(http.StatusNoContent) // 204 No Content
	})
	router.GET("/tasks/:id/", getTask)
	router.POST("/tasks/:id/flag/", authMiddleware(), checkTaskFlag)
	router.POST("/admin-panel-add-task/", authMiddleware(), addTask)
	router.GET("/community/", getAllTeams)

	// Запуск сервера
	if err := router.Run("localhost:8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
