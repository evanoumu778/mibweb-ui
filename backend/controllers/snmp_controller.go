package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"

	"mib-platform/models"
	"mib-platform/services"
)

type SNMPController struct {
	db      *gorm.DB
	redis   *redis.Client
	service *services.SNMPService
}

func NewSNMPController(db *gorm.DB, redis *redis.Client) *SNMPController {
	return &SNMPController{
		db:      db,
		redis:   redis,
		service: services.NewSNMPService(db, redis),
	}
}

func (c *SNMPController) SNMPGet(ctx *gin.Context) {
	var req models.SNMPRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := c.service.SNMPGet(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

func (c *SNMPController) SNMPWalk(ctx *gin.Context) {
	var req models.SNMPRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := c.service.SNMPWalk(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

func (c *SNMPController) SNMPSet(ctx *gin.Context) {
	var req models.SNMPSetRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := c.service.SNMPSet(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

func (c *SNMPController) TestConnection(ctx *gin.Context) {
	var req models.SNMPRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := c.service.TestConnection(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}

func (c *SNMPController) BulkOperations(ctx *gin.Context) {
	operationType := ctx.Query("type")
	if operationType == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Operation type is required"})
		return
	}

	var requests []models.SNMPRequest
	if err := ctx.ShouldBindJSON(&requests); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	operation, err := c.service.StartBulkOperation(operationType, requests)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusAccepted, gin.H{"data": operation})
}

func (c *SNMPController) GetBulkOperation(ctx *gin.Context) {
	id := ctx.Param("id")
	operation, err := c.service.GetBulkOperation(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Operation not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": operation})
}
