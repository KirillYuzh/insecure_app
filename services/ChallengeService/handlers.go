package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

var (
	// jwtKey = []byte(os.Getenv("JWT_SECRET_KEY")) // Получаем из переменных окружения
	jwtKey           = []byte("my_super_unhackable_secret_key_1")
	jwtSigningMethod = jwt.SigningMethodHS256
)

type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	jwt.StandardClaims
}

func generateJWT(userID string, username, email, name string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:   userID,
		Username: username,
		Email:    email,
		Name:     name,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func submitFlag(c *gin.Context) {
	type SubmitFlagRequest struct {
		TaskID string `json:"task_id"`
		Flag   string `json:"flag"`
	}

	var req SubmitFlagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	var storedHash string
	log.Print(req.TaskID)
	err := db.QueryRow("SELECT get_task_flag_hash_by_id($1)", req.TaskID).Scan(&storedHash)
	if err != nil {
		log.Print(err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(req.Flag)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"result": "Incorrect flag"})
		return
	}

	// Получаем JWT токен из куки
	tokenString, err := c.Cookie("jwt")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization required"})
		return
	}

	// Парсим токен
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Проверяем алгоритм подписи
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtKey, nil // Замените на ваш секретный ключ
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Извлекаем claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Получаем user_id из claims
	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user ID in token",
		})
		return
	}

	err = db.QueryRow(`SELECT submit_task_by_user_id_by_task_id($1, $2)`, userID, req.TaskID).Scan(&userID)

	if err != nil {
		log.Print(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"result": "Correct flag!"})
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("jwt")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Refresh token if it's expiring soon
		exp := time.Unix(claims.ExpiresAt, 0)
		if time.Until(exp) < 6*time.Hour {
			newToken, err := generateJWT(claims.UserID, claims.Username, claims.Email, claims.Name)
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

func getTasks(c *gin.Context) {

	// Получаем все активные задачи
	taskRows, err := db.Query(`
        SELECT id FROM tasks WHERE active = true ORDER BY weight DESC
    `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load tasks"})
		return
	}
	defer taskRows.Close()

	type Task struct {
		ID          string `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Weight      int    `json:"weight"`
		Category    string `json:"category"`
		Solved      bool   `json:"solved"`
	}

	var tasks []Task

	// Получаем JWT токен из куки
	tokenString, err := c.Cookie("jwt")
	if err != nil {
		// Если пользователя нет, все задачи ставим как нерешённые
		for taskRows.Next() {
			var taskID string
			if err := taskRows.Scan(&taskID); err != nil {
				log.Printf("Error scanning task ID: %v", err)
				continue
			}

			// Получаем основные данные задачи
			var t Task
			err := db.QueryRow(`
				SELECT title, description, category, weight 
				FROM get_task_by_task_id($1)
			`, taskID).Scan(&t.Title, &t.Description, &t.Category, &t.Weight)

			if err != nil {
				log.Printf("Error getting task details: %v", err)
				continue
			}
			t.ID = taskID

			t.Solved = false

			if err != nil {
				log.Printf("Error checking task solution: %v", err)
				t.Solved = false
			}

			tasks = append(tasks, t)
		}

		if err = taskRows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing tasks"})
			return
		}

		c.JSON(http.StatusOK, tasks)
		return
	}

	// Парсим токен
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Проверяем алгоритм подписи
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtKey, nil // Замените на ваш секретный ключ
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Извлекаем claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Получаем user_id из claims
	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user ID in token",
		})
		return
	}

	for taskRows.Next() {
		var taskID string
		if err := taskRows.Scan(&taskID); err != nil {
			log.Printf("Error scanning task ID: %v", err)
			continue
		}

		// Получаем основные данные задачи
		var t Task
		err := db.QueryRow(`
            SELECT title, description, category, weight 
            FROM get_task_by_task_id($1)
        `, taskID).Scan(&t.Title, &t.Description, &t.Category, &t.Weight)

		if err != nil {
			log.Printf("Error getting task details: %v", err)
			continue
		}
		t.ID = taskID

		err = db.QueryRow(`
			SELECT check_task_solution_by_user_id_by_task_id($1, $2)
		`, userID, taskID).Scan(&t.Solved)

		if err != nil {
			log.Printf("Error checking task solution: %v", err)
			t.Solved = false
		}

		tasks = append(tasks, t)
	}

	if err = taskRows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing tasks"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}
