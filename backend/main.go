package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"mib-platform/config"
	"mib-platform/controllers"
	"mib-platform/database"
	"mib-platform/middleware"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize Redis
	redis := database.InitializeRedis(cfg.RedisURL)

	// Initialize Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://yourdomain.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.Use(middleware.Logger())
	router.Use(middleware.ErrorHandler())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "mib-platform-backend",
		})
	})

	// Initialize controllers
	mibController := controllers.NewMIBController(db, redis)
	snmpController := controllers.NewSNMPController(db, redis)
	configController := controllers.NewConfigController(db, redis)
	deviceController := controllers.NewDeviceController(db, redis)

	// API routes
	api := router.Group("/api/v1")
	{
		// MIB routes
		mibs := api.Group("/mibs")
		{
			mibs.GET("", mibController.GetMIBs)
			mibs.POST("", mibController.CreateMIB)
			mibs.GET("/:id", mibController.GetMIB)
			mibs.PUT("/:id", mibController.UpdateMIB)
			mibs.DELETE("/:id", mibController.DeleteMIB)
			mibs.POST("/upload", mibController.UploadMIB)
			mibs.POST("/:id/parse", mibController.ParseMIB)
			mibs.POST("/validate", mibController.ValidateMIB)
			mibs.GET("/:id/oids", mibController.GetMIBOIDs)
			mibs.POST("/import", mibController.ImportMIBs)
			mibs.GET("/export", mibController.ExportMIBs)
		}

		// SNMP routes
		snmp := api.Group("/snmp")
		{
			snmp.POST("/get", snmpController.SNMPGet)
			snmp.POST("/walk", snmpController.SNMPWalk)
			snmp.POST("/set", snmpController.SNMPSet)
			snmp.POST("/test", snmpController.TestConnection)
			snmp.POST("/bulk", snmpController.BulkOperations)
		}

		// Configuration routes
		configs := api.Group("/configs")
		{
			configs.GET("", configController.GetConfigs)
			configs.POST("", configController.CreateConfig)
			configs.GET("/:id", configController.GetConfig)
			configs.PUT("/:id", configController.UpdateConfig)
			configs.DELETE("/:id", configController.DeleteConfig)
			configs.POST("/generate", configController.GenerateConfig)
			configs.POST("/validate", configController.ValidateConfig)
			configs.GET("/templates", configController.GetTemplates)
			configs.POST("/templates", configController.CreateTemplate)
			configs.GET("/:id/versions", configController.GetConfigVersions)
			configs.POST("/diff", configController.CompareConfigs)
		}

		// Device routes
		devices := api.Group("/devices")
		{
			devices.GET("", deviceController.GetDevices)
			devices.POST("", deviceController.CreateDevice)
			devices.GET("/:id", deviceController.GetDevice)
			devices.PUT("/:id", deviceController.UpdateDevice)
			devices.DELETE("/:id", deviceController.DeleteDevice)
			devices.POST("/:id/test", deviceController.TestDevice)
			devices.GET("/templates", deviceController.GetDeviceTemplates)
			devices.POST("/templates", deviceController.CreateDeviceTemplate)
		}
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
