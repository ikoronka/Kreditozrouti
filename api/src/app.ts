import Config from '@api/Config/Config'
import ErrorHandler from '@api/Error/ErrorHandler'
import SubjectsRoutes from '@api/Routes/SubjectsRoutes'
import compression from 'compression'
import cors, { CorsOptions } from 'cors'
import express from 'express'
import session, { type SessionOptions } from 'express-session'
import helmet from 'helmet'
import morgan from 'morgan'
import responseTime from 'response-time'

const app = express()

const corsOptions: CorsOptions = {
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    origin: Config.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}

// Handle preflight (OPTIONS) for all routes
// Use a path pattern accepted by the router/path-to-regexp package
// (bare '*' can raise "Missing parameter name" in some versions)
// Handle preflight (OPTIONS) for all routes without registering a route
// (avoids path-to-regexp errors when using wildcard route strings)
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return cors(corsOptions)(req, res, next)
    }

    return next()
})

// Use the same options but enable credentials for non-preflight requests
app.use(
    cors({
        ...corsOptions,
        credentials: true
    })
)

app.use(helmet())

app.disable('x-powered-by')

const sessionOptions: SessionOptions = {
    secret: Config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}

if (!Config.isEnvDevelopment()) {
    app.set('trust proxy', 1)
    sessionOptions.cookie!.secure = true
    sessionOptions.cookie!.httpOnly = true
    sessionOptions.cookie!.domain = Config.domain
    sessionOptions.cookie!.sameSite = 'none' // Required for cross-site cookies
}

app.use(session(sessionOptions))

app.use(compression({}))

app.use(morgan(Config.isEnvDevelopment() ? 'dev' : 'combined')) // Log different format on dev
app.use(responseTime())

app.use('/subjects', SubjectsRoutes)

// Global error handler
app.use(ErrorHandler)

export default app
