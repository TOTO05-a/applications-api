const express = require('express')
const applicationsController = require('../controllers/applications.controller')
const {
  createApplicationSchema,
  updateApplicationStatusSchema
} = require('../validators/application.validator')

const router = express.Router()

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid request data',
      errors: result.error.issues
    })
  }

  req.body = result.data
  next()
}

router.post(
  '/',
  validate(createApplicationSchema),
  applicationsController.createApplication
)

router.get('/', applicationsController.getApplications)

router.put(
  '/:id/status',
  validate(updateApplicationStatusSchema),
  applicationsController.updateApplicationStatus
)

module.exports = router