package main

import (
	"github.com/LCGant/hanzi-draw-translate/controllers"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.Static("/static", "./public")
	r.GET("/", func(c *gin.Context) {
		c.File("./public/index.html")
	})
	r.POST("/recognize", controllers.OcrHandler)

	r.Run(":8080")
}
