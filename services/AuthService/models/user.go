package models

import (
	"database/sql"
	"errors"
	"log"

	"services/AuthService/database"
)

type User struct {
	ID           string
	Username     string
	Email        string
	Name         string
	PasswordHash string
	Score        int
}

func GetUserByEmail(email string) (*User, error) {
	var user User
	err := database.DB().QueryRow(`
		SELECT id, username, name, email, password_hash, score 
		FROM users WHERE email = $1`, email).Scan(
		&user.ID, &user.Username, &user.Name, &user.Email, &user.PasswordHash, &user.Score,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func GetUserByID(id string) (*User, error) {
	var user User
	err := database.DB().QueryRow(`
		SELECT id, username, name, email, password_hash, score 
		FROM users WHERE id = $1`, id).Scan(
		&user.ID, &user.Username, &user.Name, &user.Email, &user.PasswordHash, &user.Score,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func CheckUserExists(username, email string) (bool, error) {
	var exists bool
	err := database.DB().QueryRow(`
		SELECT EXISTS(SELECT 1 FROM users WHERE username=$1 OR email=$2)`,
		username, email).Scan(&exists)
	return exists, err
}

func CreateUser(user User) (string, error) {
	var userID string
	err := database.DB().QueryRow(`
		INSERT INTO users (username, email, name, password_hash)
		VALUES ($1, $2, $3, $4) RETURNING id
	`, user.Username, user.Email, user.Name, user.PasswordHash).Scan(&userID)

	if err != nil {
		log.Print(err)
		return "", err
	}

	return userID, nil
}
