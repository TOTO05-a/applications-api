const applicationsService = require('../services/applications.service')

const createApplication = async (req, res, next) => {
  try {
    const application = await applicationsService.createApplication(req.body)

    res.status(201).json(application)
  } catch (error) {
    next(error)
  }
}

const getApplications = async (req, res, next) => {
  try {
    const { status, vacancyId } = req.query

    const applications = await applicationsService.getApplications({
      status,
      vacancyId
    })

    res.status(200).json(applications)
  } catch (error) {
    next(error)
  }
}

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await applicationsService.updateApplicationStatus(
      req.params.id,
      req.body.status
    )

    res.status(200).json(application)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createApplication,
  getApplications,
  updateApplicationStatus
}