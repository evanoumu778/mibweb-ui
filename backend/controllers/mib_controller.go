package controllers

import (
	"crypto/md5"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"

	"mib-platform/models"
	"mib-platform/services"
)

type MIBController struct {
	db      *gorm.DB
	redis   *redis.Client
	service *services.MIBService
}

func NewMIBController(db *gorm.DB, redis *redis.Client) *MIBController {
	return &MIBController{
		db:      db,
		redis:   redis,
		service: services.NewMIBService(db, redis),
	}
}

func (c *MIBController) GetMIBs(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	search := ctx.Query("search")
	status := ctx.Query("status")

	mibs, total, err := c.service.GetMIBs(page, limit, search, status)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":  mibs,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (c *MIBController) GetMIB(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MIB ID"})
		return
	}

	mib, err := c.service.GetMIB(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "MIB not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": mib})
}

func (c *MIBController) CreateMIB(ctx *gin.Context) {
	var mib models.MIB
	if err := ctx.ShouldBindJSON(&mib); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.service.CreateMIB(&mib); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": mib})
}

func (c *MIBController) UpdateMIB(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MIB ID"})
		return
	}

	var updates models.MIB
	if err := ctx.ShouldBindJSON(&updates); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mib, err := c.service.UpdateMIB(uint(id), &updates)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": mib})
}

func (c *MIBController) DeleteMIB(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MIB ID"})
		return
	}

	if err := c.service.DeleteMIB(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "MIB deleted successfully"})
}

func (c *MIBController) UploadMIB(ctx *gin.Context) {
	file, header, err := ctx.Request.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Create upload directory if it doesn't exist
	uploadDir := "./uploads/mibs"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), header.Filename)
	filepath := filepath.Join(uploadDir, filename)

	// Save file
	dst, err := os.Create(filepath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}
	defer dst.Close()

	// Calculate checksum
	hash := md5.New()
	size, err := io.Copy(io.MultiWriter(dst, hash), file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	checksum := fmt.Sprintf("%x", hash.Sum(nil))

	// Create MIB record
	mib := models.MIB{
		Name:        header.Filename,
		Filename:    header.Filename,
		FilePath:    filepath,
		Status:      "uploaded",
		FileSize:    size,
		Checksum:    checksum,
		Description: ctx.PostForm("description"),
		Author:      ctx.PostForm("author"),
	}

	if err := c.service.CreateMIB(&mib); err != nil {
		// Clean up file if database operation fails
		os.Remove(filepath)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "MIB uploaded successfully",
		"data":    mib,
	})
}

func (c *MIBController) ParseMIB(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MIB ID"})
		return
	}

	result, err := c.service.ParseMIB(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}

func (c *MIBController) ValidateMIB(ctx *gin.Context) {
	file, _, err := ctx.Request.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	result, err := c.service.ValidateMIBFile(file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}

func (c *MIBController) GetMIBOIDs(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid MIB ID"})
		return
	}

	oids, err := c.service.GetMIBOIDs(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": oids})
}

func (c *MIBController) ImportMIBs(ctx *gin.Context) {
	file, _, err := ctx.Request.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	result, err := c.service.ImportMIBs(file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}

func (c *MIBController) ExportMIBs(ctx *gin.Context) {
	format := ctx.DefaultQuery("format", "json")
	ids := ctx.QueryArray("ids")

	data, filename, err := c.service.ExportMIBs(ids, format)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	ctx.Data(http.StatusOK, "application/octet-stream", data)
}
