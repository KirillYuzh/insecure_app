package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("your_secret_key")

type Claims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

func generateJWT(username string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

func signup(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		log.Printf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверка уникальности username
	var usernameExists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", user.Username).Scan(&usernameExists)
	if err != nil {
		log.Printf("Failed to check username uniqueness: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check username uniqueness"})
		return
	}
	if usernameExists {
		log.Printf("Username already exists: %s", user.Username)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
		return
	}

	// Проверка уникальности email
	var emailExists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", user.Email).Scan(&emailExists)
	if err != nil {
		log.Printf("Failed to check email uniqueness: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check email uniqueness"})
		return
	}
	if emailExists {
		log.Printf("Email already exists: %s", user.Email)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	// Хэшируем пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	// Сохраняем пользователя в базу данных
	_, err = db.Exec(
		"INSERT INTO users (username, email, name, password_hash) VALUES ($1, $2, $3, $4)",
		user.Username, user.Email, user.Name, string(hashedPassword),
	)
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	log.Printf("User created successfully: %s", user.Username)
	c.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("jwt")
		if err != nil {
			log.Printf("JWT cookie not found: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}
		log.Printf("JWT token found: %s", tokenString)

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			log.Printf("Invalid JWT token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		log.Printf("User authenticated: %s", claims.Username)
		c.Set("username", claims.Username)
		c.Next()
	}
}

func login(c *gin.Context) {
	// Проверяем, есть ли уже JWT-токен в куках
	tokenString, err := c.Cookie("jwt")
	if err == nil && tokenString != "" {
		// Если токен существует, вызываем logout
		logout(c)
		c.SetCookie("jwt", "", -1, "/", "localhost", false, true)
	}

	var user struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		log.Printf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var dbUser struct {
		Username     string
		PasswordHash string
	}

	// Получаем хэш пароля из базы данных
	err = db.QueryRow("SELECT username, password_hash FROM users WHERE username = $1", user.Username).Scan(&dbUser.Username, &dbUser.PasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("User not found: %s", user.Username)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		} else {
			log.Printf("Failed to fetch user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		}
		return
	}

	// Сравниваем хэшированный пароль
	err = bcrypt.CompareHashAndPassword([]byte(dbUser.PasswordHash), []byte(user.Password))
	if err != nil {
		log.Printf("Invalid credentials for user: %s", user.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Генерация JWT токена
	token, err := generateJWT(dbUser.Username)
	if err != nil {
		log.Printf("Failed to generate JWT token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Устанавливаем токен в httpOnly куку
	log.Printf("Setting JWT cookie for user: %s", dbUser.Username)
	c.SetCookie("jwt", token, 3600, "/", "localhost", false, true)
	log.Printf("JWT cookie set successfully")

	log.Printf("User logged in successfully: %s", dbUser.Username)
	c.JSON(http.StatusOK, gin.H{"message": "Logged in successfully"})
}

func logout(c *gin.Context) {
	// Удаляем куку
	c.SetCookie("jwt", "", -1, "/", "localhost", false, true)
	log.Println("User logged out successfully")
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// Структура для представления задачи
type Task struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Weight      int    `json:"weight"`
	Category    string `json:"category"`
	Active      bool   `json:"active"`
}

func getAllTasks(c *gin.Context) {
	rows, err := db.Query("SELECT id, title, description, weight, category, active FROM tasks WHERE id > 0")
	if err != nil {
		log.Printf("Failed to fetch tasks: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
		return
	}
	defer rows.Close()

	var tasks []Task

	for rows.Next() {
		var task Task
		if err := rows.Scan(&task.ID, &task.Title, &task.Description, &task.Weight, &task.Category, &task.Active); err != nil {
			log.Printf("Failed to scan task: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan task"})
			return
		}
		tasks = append(tasks, task)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error after scanning tasks: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error after scanning tasks"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tasks": tasks,
	})
}

func getTask(c *gin.Context) {
	id := c.Param("id")
	var task struct {
		ID          int    `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Weight      int    `json:"weight"`
		Category    string `json:"category"`
	}

	row := db.QueryRow("SELECT id, title, description, weight, category FROM tasks WHERE id = $1 AND active = TRUE", id)
	err := row.Scan(&task.ID, &task.Title, &task.Description, &task.Weight, &task.Category)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found or not active"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, task)
}

type PlayerScoringTable struct {
	Username        string         `json:"username"`
	Score           int            `json:"score"`
	IsInTeam        bool           `json:"is_in_team"`
	PlayerTeamTitle sql.NullString `json:"player_team_title"`
}

func getScoringTable(c *gin.Context) {
	rows, err := db.Query("SELECT username, score, is_in_team, player_team_title FROM users")
	if err != nil {
		log.Printf("Failed to fetch users: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer rows.Close()

	var players []PlayerScoringTable

	for rows.Next() {
		var player PlayerScoringTable
		if err := rows.Scan(&player.Username, &player.Score, &player.IsInTeam, &player.PlayerTeamTitle); err != nil {
			log.Printf("Failed to scan users: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan user"})
			return
		}
		players = append(players, player)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error after scanning players: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error after scanning players"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"players": players,
	})
}

func getTasks(c *gin.Context) {
	rows, err := db.Query("SELECT id, title, description, weight, category FROM tasks WHERE active = true")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
		return
	}
	defer rows.Close()

	var tasks []Task
	var solvedTasks []string

	username, isAuthenticated := c.Get("username")
	if isAuthenticated {
		err = db.QueryRow(
			"SELECT solved_tasks FROM users WHERE username = $1",
			username,
		).Scan(pq.Array(&solvedTasks))
		if err != nil && err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch solved tasks"})
			return
		}
	}

	for rows.Next() {
		var task Task
		if err := rows.Scan(&task.ID, &task.Title, &task.Description, &task.Weight, &task.Category); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan task"})
			return
		}
		tasks = append(tasks, task)
	}

	response := gin.H{"tasks": tasks}
	if isAuthenticated {
		response["user"] = gin.H{"solved_tasks": solvedTasks}
	}

	c.JSON(http.StatusOK, response)
}

type PlayerWithTasks struct {
	Username         string   `json:"username"`
	Score            int      `json:"score"`
	IsInTeam         bool     `json:"is_in_team"`
	PlayerTeamTitle  string   `json:"player_team_title"`
	SolvedTasks      []string `json:"solved_tasks"`
	SolvedTaskTitles []string `json:"solved_task_titles"`
}

func getAccount(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var player PlayerWithTasks
	err := db.QueryRow(
		"SELECT username, score, is_in_team, player_team_title, solved_tasks FROM users WHERE username = $1",
		username,
	).Scan(&player.Username, &player.Score, &player.IsInTeam, &player.PlayerTeamTitle, pq.Array(&player.SolvedTasks))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
		return
	}

	c.JSON(http.StatusOK, player)
}

// Обработчик для добавления задачи
func addTask(c *gin.Context) {
	var task Task

	// Привязка данных из JSON к структуре Task
	if err := c.ShouldBindJSON(&task); err != nil {
		log.Printf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверка уникальности title
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM tasks WHERE title = $1)", task.Title).Scan(&exists)
	if err != nil {
		log.Printf("Failed to check task uniqueness: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check task uniqueness"})
		return
	}
	if exists {
		log.Printf("Task with this title already exists: %s", task.Title)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task with this title already exists"})
		return
	}

	// Вставка данных в таблицу tasks
	query := `
		INSERT INTO tasks (title, category, description, weight, active)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err = db.Exec(query, task.Title, task.Category, task.Description, task.Weight, task.Active)
	if err != nil {
		log.Printf("Failed to insert task into database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert task into database"})
		return
	}

	log.Printf("Task added successfully: %s", task.Title)
	c.JSON(http.StatusOK, gin.H{"message": "Task added successfully"})
}

// Структура для обновления поля active
type UpdateTaskActiveRequest struct {
	Active bool `json:"active"`
}

// Обработчик для обновления поля active
func updateTaskActive(c *gin.Context) {
	// Получаем ID задачи из URL
	taskID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("Invalid task ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	// Привязка данных из JSON
	var req UpdateTaskActiveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Обновление поля active в базе данных
	query := `
		UPDATE tasks
		SET active = $1
		WHERE id = $2
	`
	_, err = db.Exec(query, req.Active, taskID)
	if err != nil {
		log.Printf("Failed to update task: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update task"})
		return
	}

	log.Printf("Task updated successfully: %d", taskID)
	c.JSON(http.StatusOK, gin.H{"message": "Task updated successfully"})
}

type FlagRequest struct {
	Flag string `json:"flag"`
}

type FlagResponse struct {
	Solved bool `json:"solved"`
}

func checkTaskFlag(c *gin.Context) {
	taskID := c.Param("id")

	var req FlagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var taskFlag string
	var taskWeight int
	err := db.QueryRow(
		"SELECT flag, weight FROM tasks WHERE id = $1",
		taskID,
	).Scan(&taskFlag, &taskWeight)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	solved := req.Flag == taskFlag

	if solved {
		username, exists := c.Get("username")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Получаем текущий список решенных задач (как массив строк)
		var solvedTasks []string
		err := db.QueryRow(
			"SELECT solved_tasks FROM users WHERE username = $1",
			username,
		).Scan(pq.Array(&solvedTasks))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch solved tasks"})
			return
		}

		// Проверяем, не решена ли уже эта задача
		taskIDStr := taskID // Преобразуем ID задачи в строку
		for _, t := range solvedTasks {
			if t == taskIDStr {
				c.JSON(http.StatusOK, FlagResponse{Solved: true})
				return
			}
		}

		// Добавляем ID задачи в массив solved_tasks
		_, err = db.Exec(
			"UPDATE users SET solved_tasks = array_append(solved_tasks, $1), score = score + $2 WHERE username = $3",
			taskIDStr, taskWeight, username,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user data"})
			return
		}
	}

	c.JSON(http.StatusOK, FlagResponse{
		Solved: solved,
	})
}

// Вспомогательная функция для проверки наличия элемента в массиве
func contains(arr []string, str string) bool {
	for _, item := range arr {
		if item == str {
			return true
		}
	}
	return false
}

type Team struct {
	ID           int      `json:"id"`
	Title        string   `json:"title"`
	Participants []string `json:"participants"`
	InviteLink   string   `json:"invite_link"`
	TotalScore   int      `json:"total_score"`
	Captain      string   `json:"captain"`
}

func createTeam(db *sql.DB, team Team) error {
	query := `
        INSERT INTO teams (title, participants, invite_link, total_score)
        VALUES ($1, $2, $3, $4)
    `
	_, err := db.Exec(query, team.Title, pq.Array(team.Participants), team.InviteLink, team.TotalScore)
	return err
}

func getTeam(db *sql.DB, teamID int) (Team, error) {
	var team Team
	query := `
        SELECT id, title, participants, invite_link, total_score
        FROM teams
        WHERE id = $1
    `
	err := db.QueryRow(query, teamID).Scan(&team.ID, &team.Title, pq.Array(&team.Participants), &team.InviteLink, &team.TotalScore)
	return team, err
}

type TeamInfo struct {
	Title      string `json:"title"`
	TotalScore int    `json:"total_score"`
}

func getAllTeams(c *gin.Context) {
	// Выполняем запрос к базе данных
	rows, err := db.Query("SELECT title, total_score FROM teams")
	if err != nil {
		log.Printf("Failed to fetch teams: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return
	}
	defer rows.Close()

	// Создаем срез для хранения данных о командах
	var teams []TeamInfo

	// Итерируем по результатам запроса
	for rows.Next() {
		var team TeamInfo
		if err := rows.Scan(&team.Title, &team.TotalScore); err != nil {
			log.Printf("Failed to scan team: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan team"})
			return
		}
		teams = append(teams, team)
	}

	// Проверяем на ошибки после итерации
	if err := rows.Err(); err != nil {
		log.Printf("Error after scanning teams: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error after scanning teams"})
		return
	}

	// Возвращаем данные о командах
	c.JSON(http.StatusOK, teams)
}

// Обработчик для получения README
func getReadme(c *gin.Context) {
	// Пример данных, которые могут быть прочитаны из файла или базы данных
	readmeLines := strings.Split(string(`## Hex Bomb

# Общие задачи
- Быть умничками
- Team_page, Settings_page, InviteLink_page
- Возможность отправлять заявки в команды
- Обработка заявок капитаном команды
- Изменение User_page, Team_page данных пользователем
- Смена цветов задач

# Задачи backend
- JWT refresh token
- Хранение секретов
- Логика хранения файлов
- Работа с бд через функции (обращение не к таблицам с данными, а к таблицам с функциями для работы с данными)
- Наладить процесс создания и настройки виртуальных машин (скорее всего vagrant + ansible)
- Наладить управление виртуальными машинами через k8s
- Добавить и настроить nginx

# Задачи frontend
- При запросе GET localhost:5173/sth/ загружаются сразу все странцы/компоненты (react все дела, но меня смущает тот факт, что в некоторых местах (например после submit в login_page ЗАПРОС отправляется ДВАЖДЫ + ссылки (теги a) заставляют загружать все страницы заново, а это как будто не очень хорошо - в react есть свои link теги, которые работают как теги a, но не делают новый запрос, а просто переносят на нужную страницу, которая уже загружена (все страницы загружаются на первом запросе), но и у этих тегов я находил какие-то минусы. Короче, надо с этим разобраться))
- Корректное отображение элементов: navbar (min-width), tasks (тоже что-то придумать)`), "\n")

	// Возвращаем массив строк в формате JSON
	c.JSON(http.StatusOK, gin.H{
		"description": readmeLines,
	})
}
