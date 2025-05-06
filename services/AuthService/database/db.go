package database

import "database/sql"

var db *sql.DB

func SetDB(connection *sql.DB) {
	db = connection
}

func DB() *sql.DB {
	return db
}

func GetUserPasswordHashByID(userID string) (string, error) {
	var hash string
	err := db.QueryRow(`SELECT get_user_password_hash_by_id($1)`, userID).Scan(&hash)
	if err != nil {
		return "", err
	}
	return hash, nil
}

func GetUserEmailByID(userID string) (string, error) {
	var email string
	err := db.QueryRow(`SELECT get_user_email_by_id($1)`, userID).Scan(&email)
	if err != nil {
		return "", err
	}
	return email, nil
}

func GetUserRoleByID(userID string) (string, error) {
	var role string
	err := db.QueryRow(`SELECT get_user_role_by_id($1)`, userID).Scan(&role)
	if err != nil {
		return "", err
	}
	return role, nil
}

func GetUserStatusByID(userID string) (string, error) {
	var status string
	err := db.QueryRow(`SELECT get_user_status_by_id($1)`, userID).Scan(&status)
	if err != nil {
		return "", err
	}
	return status, nil
}

func GetSolvedTasksCount(userID string) (int, error) {
	var solved int
	err := db.QueryRow(`
        SELECT COUNT(*) FROM c_users_tasks_solutions WHERE user_id = $1 AND is_solved = TRUE
    `, userID).Scan(&solved)
	return solved, err
}

func GetUserTeamTitle(userID string) (string, error) {
	var teamTitle string
	err := db.QueryRow(`
        SELECT t.title FROM c_users_teams ut
        JOIN teams t ON ut.team_id = t.id
        WHERE ut.user_id = $1 LIMIT 1
    `, userID).Scan(&teamTitle)
	return teamTitle, err
}
