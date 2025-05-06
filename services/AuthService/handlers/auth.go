package handlers

import (
	"log"
	"net/http"
	"strings"

	"services/AuthService/models"
	"services/AuthService/utils/"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *gin.Context) {
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

	// Получаем user_id по email
	user, err := models.GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Сравниваем хэши
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	// Генерим JWT
	token, err := jwt.GenerateJWT(user.ID, user.Username, user.Email, user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT generation failed"})
		return
	}

	// Устанавливаем токен в куку
	c.SetCookie("jwt", token, 3600*24, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func Signup(c *gin.Context) {
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
	exists, err := models.CheckUserExists(req.Username, req.Email)
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

	// Создаем пользователя
	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		Name:         req.Name,
		PasswordHash: string(hashedPassword),
	}

	userID, err := models.CreateUser(user)
	if err != nil {
		log.Print(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User creation failed"})
		return
	}

	// Генерация токена
	token, err := jwt.GenerateJWT(userID, req.Username, req.Email, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT generation failed"})
		return
	}

	c.SetCookie("jwt", token, 3600*24, "/", "", false, true)
	c.JSON(http.StatusCreated, gin.H{"message": "Signup successful"})
}

func Logout(c *gin.Context) {
	// Удаляем JWT куку
	c.SetCookie("jwt", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}
