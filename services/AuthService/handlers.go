package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func login(c *gin.Context) {
	type LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	log.Printf("Login attempt with email: %s", req.Email)
	log.Printf("Login attempt with password: %s", req.Password)

	// Получаем user_id по email
	var userID string
	err := db.QueryRow(`SELECT id FROM users WHERE email = $1`, req.Email).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Получаем username и name
	var username, name string
	err = db.QueryRow(`SELECT username, name FROM users WHERE id = $1`, userID).Scan(&username, &name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
		return
	}

	// Получаем password_hash через безопасную функцию
	hash, err := getUserPasswordHashByID(db, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password check failed"})
		return
	}

	// Сравниваем хэши
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	// Генерим JWT
	token, err := generateJWT(userID, username, req.Email, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT generation failed"})
		return
	}

	// Устанавливаем токен в куку
	c.SetCookie("jwt", token, 3600*24, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func getUserPasswordHashByID(db *sql.DB, userID string) (string, error) {
	var hash string
	err := db.QueryRow(`SELECT get_user_password_hash_by_id($1)`, userID).Scan(&hash)
	if err != nil {
		return "", err
	}
	return hash, nil
}

func getUserEmailByID(db *sql.DB, userID string) (string, error) {
	var email string
	err := db.QueryRow(`SELECT get_user_email_by_id($1)`, userID).Scan(&email)
	if err != nil {
		return "", err
	}
	return email, nil
}

func getUserRoleByID(db *sql.DB, userID string) (string, error) {
	var role string
	err := db.QueryRow(`SELECT get_user_role_by_id($1)`, userID).Scan(&role)
	if err != nil {
		return "", err
	}
	return role, nil
}

func getUserStatusByID(db *sql.DB, userID string) (string, error) {
	var status string
	err := db.QueryRow(`SELECT get_user_status_by_id($1)`, userID).Scan(&status)
	if err != nil {
		return "", err
	}
	return status, nil
}

func signup(c *gin.Context) {
	type SignupRequest struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Password string `json:"password"`
	}

	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Проверка на уникальность username/email
	var exists bool
	err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE username=$1 OR email=$2)`, req.Username, req.Email).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking uniqueness"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		return
	}

	// Хешируем пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password hashing failed"})
		return
	}

	log.Print(req.Username)
	log.Print(req.Email)
	log.Print(req.Name)
	log.Print(string(hashedPassword))
	// Вставка пользователя
	var userID string
	err = db.QueryRow(`
		INSERT INTO users (username, email, name, password_hash)
		VALUES ($1, $2, $3, $4) RETURNING id
	`, req.Username, req.Email, req.Name, string(hashedPassword)).Scan(&userID)

	if err != nil {
		log.Print(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User creation failed"})
		return
	}

	// Генерация токена
	token, err := generateJWT(userID, req.Username, req.Email, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT generation failed"})
		return
	}

	c.SetCookie("jwt", token, 3600*24, "/", "", false, true)
	c.JSON(http.StatusCreated, gin.H{"message": "Signup successful"})
}

func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		role, err := getUserRoleByID(db, fmt.Sprintf("%v", userID))
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

func logout(c *gin.Context) {
	// Удаляем JWT куку
	c.SetCookie("jwt", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}

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

// func requireRole(requiredRole string) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		userID, exists := c.Get("user_id")
// 		if !exists {
// 			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
// 			c.Abort()
// 			return
// 		}

// 		var role string
// 		err := db.QueryRow("SELECT get_user_role_by_id($1)", userID).Scan(&role)
// 		if err != nil || role != requiredRole {
// 			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
// 			c.Abort()
// 			return
// 		}
// 		c.Next()
// 	}
// }

func getAccount(c *gin.Context) {
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

	// Остальной код остается без изменений
	var username, name, email string
	var score int
	err = db.QueryRow(`
        SELECT username, name, email, score FROM users WHERE id = $1
    `, userID).Scan(&username, &name, &email, &score)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Кол-во решённых задач
	var solved int
	err = db.QueryRow(`
        SELECT COUNT(*) FROM c_users_tasks_solutions WHERE user_id = $1 AND is_solved = TRUE
    `, userID).Scan(&solved)
	if err != nil {
		solved = 0 // fallback
	}

	// Название команды (если состоит в какой-то)
	var teamTitle *string
	err = db.QueryRow(`
        SELECT t.title FROM c_users_teams ut
        JOIN teams t ON ut.team_id = t.id
        WHERE ut.user_id = $1 LIMIT 1
    `, userID).Scan(&teamTitle)
	if err != nil {
		teamTitle = nil
	}

	c.JSON(http.StatusOK, gin.H{
		"username":     username,
		"name":         name,
		"email":        email,
		"score":        score,
		"solved_tasks": solved,
		"team":         teamTitle,
	})
}
