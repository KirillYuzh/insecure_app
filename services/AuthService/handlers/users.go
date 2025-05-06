package handlers

import (
	"net/http"

	"services/AuthService/database"
	"services/AuthService/models"

	"github.com/gin-gonic/gin"
)

func GetAccount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization required"})
		return
	}

	user, err := models.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Кол-во решённых задач
	solved, err := database.GetSolvedTasksCount(userID.(string))
	if err != nil {
		solved = 0 // fallback
	}

	// Название команды (если состоит в какой-то)
	teamTitle, err := database.GetUserTeamTitle(userID.(string))
	if err != nil {
		teamTitle = ""
	}

	c.JSON(http.StatusOK, gin.H{
		"username":     user.Username,
		"name":         user.Name,
		"email":        user.Email,
		"score":        user.Score,
		"solved_tasks": solved,
		"team":         teamTitle,
	})
}
