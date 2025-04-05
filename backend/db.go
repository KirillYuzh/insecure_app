package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func initDB() {
	var err error
	connStr := "user=postgres dbname=postgres sslmode=disable port=5434 password=admin"
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Ошибка при подключении к базе данных: %v", err)
	}

	// Проверка подключения
	err = db.Ping()
	if err != nil {
		log.Fatalf("Ошибка при проверке подключения: %v", err)
	}

	fmt.Println("Успешное подключение к базе данных!")
}
