import DOMPurify from 'dompurify'
import validator from 'validator'

// Input sanitization utilities
export const sanitizeInput = {
  // Sanitize HTML content to prevent XSS
  html: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: []
    })
  },

  // Sanitize text content
  text: (input: string): string => {
    return validator.escape(input.trim())
  },

  // Validate and sanitize email
  email: (input: string): { isValid: boolean; sanitized: string } => {
    const sanitized = validator.normalizeEmail(input) || ''
    return {
      isValid: validator.isEmail(sanitized),
      sanitized
    }
  },

  // Validate file name
  filename: (input: string): { isValid: boolean; sanitized: string } => {
    // Remove potentially dangerous characters
    const sanitized = input.replace(/[^a-zA-Z0-9._-]/g, '_')
    const isValid = sanitized.length > 0 && sanitized.length <= 255
    return { isValid, sanitized }
  }
}

// Validation utilities
export const validate = {
  // Task title validation
  taskTitle: (title: string): { isValid: boolean; error?: string } => {
    const sanitized = sanitizeInput.text(title)
    if (!sanitized || sanitized.length === 0) {
      return { isValid: false, error: 'Title is required' }
    }
    if (sanitized.length > 200) {
      return { isValid: false, error: 'Title must be less than 200 characters' }
    }
    return { isValid: true }
  },

  // Task description validation
  taskDescription: (description: string): { isValid: boolean; error?: string } => {
    if (description.length > 1000) {
      return { isValid: false, error: 'Description must be less than 1000 characters' }
    }
    return { isValid: true }
  },

  // Comment validation
  comment: (content: string): { isValid: boolean; error?: string } => {
    const sanitized = sanitizeInput.text(content)
    if (!sanitized || sanitized.length === 0) {
      return { isValid: false, error: 'Comment cannot be empty' }
    }
    if (sanitized.length > 500) {
      return { isValid: false, error: 'Comment must be less than 500 characters' }
    }
    return { isValid: true }
  },

  // File validation
  file: (file: File): { isValid: boolean; error?: string } => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'File size must be less than 10MB' }
    }

    // Check file type - only allow safe types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' }
    }

    // Validate filename
    const filenameResult = sanitizeInput.filename(file.name)
    if (!filenameResult.isValid) {
      return { isValid: false, error: 'Invalid filename' }
    }

    return { isValid: true }
  },

  // Tag validation
  tag: (tag: string): { isValid: boolean; error?: string } => {
    const sanitized = sanitizeInput.text(tag)
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Tag cannot be empty' }
    }
    if (sanitized.length > 50) {
      return { isValid: false, error: 'Tag must be less than 50 characters' }
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(sanitized)) {
      return { isValid: false, error: 'Tag can only contain letters, numbers, hyphens, and underscores' }
    }
    return { isValid: true }
  }
}

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || []
    
    // Remove requests outside the window
    userRequests = userRequests.filter(time => time > windowStart)
    
    // Check if under limit
    if (userRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    userRequests.push(now)
    this.requests.set(identifier, userRequests)
    
    return true
  }

  getRetryAfter(identifier: string): number {
    const userRequests = this.requests.get(identifier) || []
    if (userRequests.length === 0) return 0
    
    const oldestRequest = Math.min(...userRequests)
    const retryAfter = oldestRequest + this.windowMs - Date.now()
    return Math.max(0, Math.ceil(retryAfter / 1000)) // Return in seconds
  }
}

// Content Security Policy generator
export const generateCSP = (): string => {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://esm.sh",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ]
  
  return policies.join('; ')
}

// Environment validation
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName]
    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`)
    } else {
      // Validate URL format for Supabase URL
      if (varName === 'VITE_SUPABASE_URL' && !validator.isURL(value)) {
        errors.push(`Invalid URL format for ${varName}`)
      }
      
      // Validate key format for Supabase key
      if (varName === 'VITE_SUPABASE_ANON_KEY' && value.length < 32) {
        errors.push(`Invalid key format for ${varName}`)
      }
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}