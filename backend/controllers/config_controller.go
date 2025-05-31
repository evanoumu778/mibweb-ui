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

type ConfigController struct {
	db      *gorm.DB
	redis   *redis.Client
	service *services.ConfigService
}

func NewConfigController(db *gorm.DB, redis *redis.Client) *ConfigController {
	return &ConfigController{
		db:      db,
		redis:   redis,
		service: services.NewConfigService(db, redis),
	}
}

func (c *ConfigController) GetConfigs(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	configType := ctx.Query("type")

	configs, total, err := c.service.GetConfigs(page, limit, configType)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":  configs,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (c *ConfigController) GetConfig(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	config, err := c.service.GetConfig(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Config not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": config})
}

func (c *ConfigController) CreateConfig(ctx *gin.Context) {
	var config models.Config
	if err := ctx.ShouldBindJSON(&config); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.service.CreateConfig(&config); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": config})
}

func (c *ConfigController) UpdateConfig(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	var updates models.Config
	if err := ctx.ShouldBindJSON(&updates); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config, err := c.service.UpdateConfig(uint(id), &updates)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": config})
}

func (c *ConfigController) DeleteConfig(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	if err := c.service.DeleteConfig(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Config deleted successfully"})
}

func (c *ConfigController) GenerateConfig(ctx *gin.Context) {
	var req struct {
		Type       string                 `json:"type" binding:"required"`
		DeviceID   *uint                  `json:"device_id"`
		TemplateID *uint                  `json:"template_id"`
		OIDs       []string               `json:"oids"`
		Options    map[string]interface{} `json:"options"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config, err := c.service.GenerateConfig(req.Type, req.DeviceID, req.TemplateID, req.OIDs, req.Options)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": config})
}

func (c *ConfigController) ValidateConfig(ctx *gin.Context) {
	var req struct {
		Type    string `json:"type" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := c.service.ValidateConfig(req.Type, req.Content)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}

func (c *ConfigController) GetTemplates(ctx *gin.Context) {
	configType := ctx.Query("type")
	templates, err := c.service.GetTemplates(configType)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": templates})
}

func (c *ConfigController) CreateTemplate(ctx *gin.Context) {
	var template models.ConfigTemplate
	if err := ctx.ShouldBindJSON(&template); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.service.CreateTemplate(&template); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": template})
}

func (c *ConfigController) GetConfigVersions(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid config ID"})
		return
	}

	versions, err := c.service.GetConfigVersions(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": versions})
}

func (c *ConfigController) CompareConfigs(ctx *gin.Context) {
	var req struct {
		Config1 string `json:"config1" binding:"required"`
		Config2 string `json:"config2" binding:"required"`
		Type    string `json:"type"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	diff, err := c.service.CompareConfigs(req.Config1, req.Config2, req.Type)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": diff})
}
