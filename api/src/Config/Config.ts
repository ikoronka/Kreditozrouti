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
    env: 'development',

    port: 6767,
    uri: 'http://localhost:6767',
    domain: 'localhost',
    allowedOrigins: ['http://localhost:5173'],
    sessionSecret: 'development',

    isEnvDevelopment: () => config.env === 'development'
}

export default config
