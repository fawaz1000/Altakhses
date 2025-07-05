// Front-end/src/config.js - Updated with separate media categories
export const API_BASE      = process.env.REACT_APP_API_BASE || 'http://localhost:5050'

// Hero slider configuration
export const HERO_CATEGORY = 'hero'
export const HERO_SLIDE_INTERVAL = parseInt(process.env.REACT_APP_HERO_SLIDE_INTERVAL, 10) || 8000

// Media channel configuration  
export const MEDIA_CATEGORY = 'general'
export const MEDIA_SLIDE_INTERVAL = parseInt(process.env.REACT_APP_MEDIA_SLIDE_INTERVAL, 10) || 6000

// Legacy support
export const SLIDE_CATEGORY = HERO_CATEGORY
export const SLIDE_INTERVAL = HERO_SLIDE_INTERVAL