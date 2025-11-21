import FindSubjectsController from '@api/Controllers/Subjects/FindSubjectsController'
import { ParserJSONMiddleware } from '@api/Middlewares/ParserMiddleware'
import { Router } from 'express'

const SubjectsRoutes = Router()

SubjectsRoutes.post('/find', ParserJSONMiddleware, FindSubjectsController)

export default SubjectsRoutes
