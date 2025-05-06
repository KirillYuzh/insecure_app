package handlers

import (
	"fmt"
	"net/http"
	"time"

	"services/AuthService/database"
	"services/AuthService/utils/jwt"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("jwt")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		claims, err := jwt.ParseToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Refresh token if it's expiring soon
		exp := time.Unix(claims.ExpiresAt, 0)
		if time.Until(exp) < 6*time.Hour {
			newToken, err := jwt.GenerateJWT(claims.UserID, claims.Username, claims.Email, claims.Name)
			if err == nil {
				c.SetCookie("jwt", newToken, 3600*24, "/", "", false, true)
			}
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)
		c.Set("name", claims.Name)
		c.Next()
	}
}

func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		role, err := database.GetUserRoleByID(fmt.Sprintf("%v", userID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not determine role"})
			c.Abort()
			return
		}

		for _, r := range allowedRoles {
			if r == role {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		c.Abort()
	}
}
