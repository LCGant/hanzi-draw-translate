package controllers

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// OcrHandler receives a base64 image and sends it to the Python OCR microservice
func OcrHandler(c *gin.Context) {
	var payload struct {
		ImageData string `json:"imageData"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error receiving JSON"})
		return
	}

	splitData := strings.Split(payload.ImageData, ",")
	if len(splitData) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image format"})
		return
	}

	rawImage := splitData[1]
	imageBytes, err := base64.StdEncoding.DecodeString(rawImage)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error decoding base64"})
		return
	}

	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", "image.png")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	_, err = part.Write(imageBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	writer.Close()

	req, err := http.NewRequest("POST", "http://localhost:8000/ocr", body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	responseData, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("OCR Service error: %s", string(responseData)),
		})
		return
	}

	c.Data(http.StatusOK, "application/json", responseData)
}
