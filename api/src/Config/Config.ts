interface Config {
    env: string

    port: number
    uri: string
    domain: string
    allowedOrigins: string[]
    sessionSecret: string

    isEnvDevelopment: () => boolean
}

const config: Config = {
    // Railway provides NODE_ENV, use it or default to 'development'
    env: process.env.NODE_ENV || 'development',

    // CRITICAL: Must use process.env.PORT in production
    port: process.env.PORT ? parseInt(process.env.PORT) : 6767,

    // Use the public URL provided by Railway variables or localhost fallback
    uri: process.env.PUBLIC_URL || 'http://localhost:6767',
    
    // In production, you likely need the real domain here, not localhost
    domain: process.env.RAILWAY_STATIC_URL || 'localhost',
    
    // Allow your specific frontend URL (you will need to set this env var in Railway)
    allowedOrigins: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:5173'],
    
    sessionSecret: process.env.SESSION_SECRET || 'development',

    isEnvDevelopment: () => (process.env.NODE_ENV || 'development') === 'development'
}

export default config
