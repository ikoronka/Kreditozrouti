import app from '@api/app'
import Config from '@api/Config/Config'
import { loadSubjectsData } from './subjects'

function start() {
    try {
        loadSubjectsData()

        const server = app.listen(Config.port, () => {
            console.log(`Environment: ${Config.env}`)
            console.log(`Server running on port ${Config.port}`)

            const shutdown = () => {
                console.log('Shutting down server...')

                server.close(() => {
                    console.log('Server shut down gracefully')

                    process.exit(0)
                })
            }

            process.on('SIGTERM', shutdown)
            process.on('SIGINT', shutdown)
        })
    } catch (error) {
        console.error('Failed to start the server:', error)

        process.exit(1)
    }
}

start()
