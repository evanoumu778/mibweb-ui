package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"

	"mib-platform/models"
)

type ConfigService struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewConfigService(db *gorm.DB, redis *redis.Client) *ConfigService {
	return &ConfigService{
		db:    db,
		redis: redis,
	}
}

func (s *ConfigService) GetConfigs(page, limit int, configType string) ([]models.Config, int64, error) {
	var configs []models.Config
	var total int64

	query := s.db.Model(&models.Config{})

	if configType != "" {
		query = query.Where("type = ?", configType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("Device").Preload("Template").Offset(offset).Limit(limit).Find(&configs).Error; err != nil {
		return nil, 0, err
	}

	return configs, total, nil
}

func (s *ConfigService) GetConfig(id uint) (*models.Config, error) {
	var config models.Config
	if err := s.db.Preload("Device").Preload("Template").Preload("Versions").First(&config, id).Error; err != nil {
		return nil, err
	}
	return &config, nil
}

func (s *ConfigService) CreateConfig(config *models.Config) error {
	return s.db.Create(config).Error
}

func (s *ConfigService) UpdateConfig(id uint, updates *models.Config) (*models.Config, error) {
	var config models.Config
	if err := s.db.First(&config, id).Error; err != nil {
		return nil, err
	}

	if err := s.db.Model(&config).Updates(updates).Error; err != nil {
		return nil, err
	}

	return &config, nil
}

func (s *ConfigService) DeleteConfig(id uint) error {
	return s.db.Delete(&models.Config{}, id).Error
}

func (s *ConfigService) GenerateConfig(configType string, deviceID, templateID *uint, oids []string, options map[string]interface{}) (*models.Config, error) {
	var device *models.Device
	var configTemplate *models.ConfigTemplate

	// Load device if specified
	if deviceID != nil {
		if err := s.db.Preload("Credentials").First(&device, *deviceID).Error; err != nil {
			return nil, fmt.Errorf("device not found: %v", err)
		}
	}

	// Load template if specified
	if templateID != nil {
		if err := s.db.First(&configTemplate, *templateID).Error; err != nil {
			return nil, fmt.Errorf("template not found: %v", err)
		}
	} else {
		// Use default template for the config type
		if err := s.db.Where("type = ? AND is_default = ?", configType, true).First(&configTemplate).Error; err != nil {
			return nil, fmt.Errorf("no default template found for type: %s", configType)
		}
	}

	// Generate configuration content
	content, err := s.generateConfigContent(configTemplate, device, oids, options)
	if err != nil {
		return nil, err
	}

	// Create config record
	config := &models.Config{
		Name:       fmt.Sprintf("%s_config_%d", configType, device.ID),
		Type:       configType,
		Content:    content,
		DeviceID:   deviceID,
		TemplateID: &configTemplate.ID,
		Status:     "generated",
		Version:    "1.0",
	}

	if err := s.CreateConfig(config); err != nil {
		return nil, err
	}

	return config, nil
}

func (s *ConfigService) ValidateConfig(configType, content string) (map[string]interface{}, error) {
	// TODO: Implement actual config validation based on type
	result := map[string]interface{}{
		"valid":    true,
		"errors":   []string{},
		"warnings": []string{},
		"suggestions": []string{
			"Consider adding more descriptive job names",
			"Add timeout configurations for better reliability",
		},
	}

	return result, nil
}

func (s *ConfigService) GetTemplates(configType string) ([]models.ConfigTemplate, error) {
	var templates []models.ConfigTemplate
	query := s.db.Model(&models.ConfigTemplate{})

	if configType != "" {
		query = query.Where("type = ?", configType)
	}

	if err := query.Find(&templates).Error; err != nil {
		return nil, err
	}

	return templates, nil
}

func (s *ConfigService) CreateTemplate(template *models.ConfigTemplate) error {
	return s.db.Create(template).Error
}

func (s *ConfigService) GetConfigVersions(configID uint) ([]models.ConfigVersion, error) {
	var versions []models.ConfigVersion
	if err := s.db.Where("config_id = ?", configID).Order("created_at DESC").Find(&versions).Error; err != nil {
		return nil, err
	}
	return versions, nil
}

func (s *ConfigService) CompareConfigs(config1, config2, configType string) (map[string]interface{}, error) {
	// Simple line-by-line comparison
	lines1 := strings.Split(config1, "\n")
	lines2 := strings.Split(config2, "\n")

	var additions []string
	var deletions []string
	var modifications []string

	// Basic diff algorithm (simplified)
	maxLen := len(lines1)
	if len(lines2) > maxLen {
		maxLen = len(lines2)
	}

	for i := 0; i < maxLen; i++ {
		var line1, line2 string
		if i < len(lines1) {
			line1 = lines1[i]
		}
		if i < len(lines2) {
			line2 = lines2[i]
		}

		if line1 != line2 {
			if line1 == "" {
				additions = append(additions, fmt.Sprintf("+ %s", line2))
			} else if line2 == "" {
				deletions = append(deletions, fmt.Sprintf("- %s", line1))
			} else {
				modifications = append(modifications, fmt.Sprintf("~ %s -> %s", line1, line2))
			}
		}
	}

	return map[string]interface{}{
		"additions":     additions,
		"deletions":     deletions,
		"modifications": modifications,
		"stats": map[string]int{
			"total_changes": len(additions) + len(deletions) + len(modifications),
			"additions":     len(additions),
			"deletions":     len(deletions),
			"modifications": len(modifications),
		},
	}, nil
}

func (s *ConfigService) generateConfigContent(tmpl *models.ConfigTemplate, device *models.Device, oids []string, options map[string]interface{}) (string, error) {
	// Prepare template data
	data := map[string]interface{}{
		"Device":  device,
		"OIDs":    oids,
		"Options": options,
	}

	// Parse and execute template
	t, err := template.New("config").Parse(tmpl.Template)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %v", err)
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to execute template: %v", err)
	}

	return buf.String(), nil
}
