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

	router.GET("/tasks", authMiddleware(), getTasks)
	router.GET("/tasks/", authMiddleware(), getTasks)

	router.GET("/scoring-table", getScoringTable)
	router.GET("/scoring-table/", getScoringTable)

	router.GET("/account", authMiddleware(), getAccount)
	router.GET("/account/", authMiddleware(), getAccount)

	router.GET("/all-tasks", authMiddleware(), getTasks)
	router.GET("/all-tasks/", authMiddleware(), getTasks)

	// router.OPTIONS("/tasks/:id", func(c *gin.Context) {
	// 	c.Status(http.StatusNoContent)
	// })
	// router.OPTIONS("/tasks/:id/", func(c *gin.Context) {
	// 	c.Status(http.StatusNoContent)
	// })

	router.POST("/tasks/flag", authMiddleware(), submitFlag)
	router.POST("/tasks/flag/", authMiddleware(), submitFlag)

	router.GET("/create-task", authMiddleware(), RequireRole("admin"))
	router.GET("/create-task/", authMiddleware(), RequireRole("admin"))
	router.POST("/create-task", authMiddleware(), RequireRole("admin"), createTask)
	router.POST("/create-task/", authMiddleware(), RequireRole("admin"), createTask)

	// router.POST("/admin-panel-add-task", authMiddleware(), addTask)
	// router.POST("/admin-panel-add-task/", authMiddleware(), addTask)

	// router.GET("/community", getAllTeams)
	// router.GET("/community/", getAllTeams)

	// Запуск сервера
	if err := router.Run("localhost:8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
