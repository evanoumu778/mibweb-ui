package services

import (
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"

	"mib-platform/models"
)

type DeviceService struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewDeviceService(db *gorm.DB, redis *redis.Client) *DeviceService {
	return &DeviceService{
		db:    db,
		redis: redis,
	}
}

func (s *DeviceService) GetDevices(page, limit int, search, status string) ([]models.Device, int64, error) {
	var devices []models.Device
	var total int64

	query := s.db.Model(&models.Device{})

	if search != "" {
		query = query.Where("name ILIKE ? OR ip_address ILIKE ? OR hostname ILIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("Template").Preload("Credentials").Offset(offset).Limit(limit).Find(&devices).Error; err != nil {
		return nil, 0, err
	}

	return devices, total, nil
}

func (s *DeviceService) GetDevice(id uint) (*models.Device, error) {
	var device models.Device
	if err := s.db.Preload("Template").Preload("Credentials").First(&device, id).Error; err != nil {
		return nil, err
	}
	return &device, nil
}

func (s *DeviceService) CreateDevice(device *models.Device) error {
	return s.db.Create(device).Error
}

func (s *DeviceService) UpdateDevice(id uint, updates *models.Device) (*models.Device, error) {
	var device models.Device
	if err := s.db.First(&device, id).Error; err != nil {
		return nil, err
	}

	if err := s.db.Model(&device).Updates(updates).Error; err != nil {
		return nil, err
	}

	return &device, nil
}

func (s *DeviceService) DeleteDevice(id uint) error {
	return s.db.Delete(&models.Device{}, id).Error
}

func (s *DeviceService) TestDevice(id uint) (map[string]interface{}, error) {
	device, err := s.GetDevice(id)
	if err != nil {
		return nil, err
	}

	// TODO: Implement actual device connectivity test
	result := map[string]interface{}{
		"success":      true,
		"response_time": 45,
		"status":       "online",
		"last_seen":    "2024-01-15T10:30:00Z",
	}

	return result, nil
}

func (s *DeviceService) GetDeviceTemplates(deviceType string) ([]models.DeviceTemplate, error) {
	var templates []models.DeviceTemplate
	query := s.db.Model(&models.DeviceTemplate{})

	if deviceType != "" {
		query = query.Where("type = ?", deviceType)
	}

	if err := query.Preload("MIBs").Find(&templates).Error; err != nil {
		return nil, err
	}

	return templates, nil
}

func (s *DeviceService) CreateDeviceTemplate(template *models.DeviceTemplate) error {
	return s.db.Create(template).Error
}
