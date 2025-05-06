package utils

import (
	"time"

	"github.com/dgrijalva/jwt-go"
)

var (
	JWTKey           = []byte("my_super_unhackable_secret_key_1") // SECRET KEY
	JWTSigningMethod = jwt.SigningMethodHS256
)

type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	jwt.StandardClaims
}

func GenerateJWT(userID string, username, email, name string) (string, error) {
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

	token := jwt.NewWithClaims(JWTSigningMethod, claims)
	return token.SignedString(JWTKey)
}

func ParseToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return JWTKey, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}
