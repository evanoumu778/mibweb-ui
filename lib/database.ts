import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export default sql

// Database utility functions
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await sql(query, params)
    return result as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function executeTransaction<T = any>(queries: Array<{ query: string; params?: any[] }>): Promise<T[]> {
  try {
    const results = []
    for (const { query, params = [] } of queries) {
      const result = await sql(query, params)
      results.push(result)
    }
    return results as T[]
  } catch (error) {
    console.error("Database transaction error:", error)
    throw error
  }
}

// Common database operations
export const db = {
  // Users
  async getUsers() {
    return executeQuery(`
      SELECT id, email, name, role, avatar_url, created_at, updated_at, last_login, is_active
      FROM users
      ORDER BY created_at DESC
    `)
  },

  async createUser(userData: {
    email: string
    name: string
    password_hash: string
    role?: string
  }) {
    return executeQuery(
      `
      INSERT INTO users (email, name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, created_at
    `,
      [userData.email, userData.name, userData.password_hash, userData.role || "user"],
    )
  },

  async updateUser(
    id: number,
    userData: Partial<{
      email: string
      name: string
      role: string
      is_active: boolean
    }>,
  ) {
    const fields = Object.keys(userData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")
    const values = Object.values(userData)

    return executeQuery(
      `
      UPDATE users 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, name, role, updated_at
    `,
      [id, ...values],
    )
  },

  // Devices
  async getDevices() {
    return executeQuery(`
      SELECT d.*, dt.name as device_type_name, dt.icon as device_type_icon
      FROM devices d
      LEFT JOIN device_types dt ON d.device_type_id = dt.id
      ORDER BY d.created_at DESC
    `)
  },

  async createDevice(deviceData: {
    name: string
    hostname?: string
    ip_address: string
    device_type_id?: number
    location?: string
    description?: string
  }) {
    return executeQuery(
      `
      INSERT INTO devices (name, hostname, ip_address, device_type_id, location, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        deviceData.name,
        deviceData.hostname,
        deviceData.ip_address,
        deviceData.device_type_id,
        deviceData.location,
        deviceData.description,
      ],
    )
  },

  // System Settings
  async getSettings() {
    return executeQuery(`
      SELECT setting_key, setting_value, setting_type, description
      FROM system_settings
      ORDER BY setting_key
    `)
  },

  async updateSetting(key: string, value: string, type = "string") {
    return executeQuery(
      `
      INSERT INTO system_settings (setting_key, setting_value, setting_type, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key)
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        setting_type = EXCLUDED.setting_type,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
      [key, value, type],
    )
  },

  // API Keys
  async getApiKeys(userId?: number) {
    const query = userId
      ? `SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`
      : `SELECT ak.*, u.name as user_name FROM api_keys ak LEFT JOIN users u ON ak.user_id = u.id ORDER BY ak.created_at DESC`

    return executeQuery(query, userId ? [userId] : [])
  },

  async createApiKey(keyData: {
    user_id: number
    key_name: string
    api_key: string
    permissions: any
    rate_limit?: number
  }) {
    return executeQuery(
      `
      INSERT INTO api_keys (user_id, key_name, api_key, permissions, rate_limit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [
        keyData.user_id,
        keyData.key_name,
        keyData.api_key,
        JSON.stringify(keyData.permissions),
        keyData.rate_limit || 1000,
      ],
    )
  },
}
