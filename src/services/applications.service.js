const { pool } = require('../config/database')
const candidatesRepository = require('../repositories/candidates.repository')
const vacanciesRepository = require('../repositories/vacancies.repository')
const applicationsRepository = require('../repositories/applications.repository')

const calculateScore = ({
  candidate,
  vacancy,
  coverLetter,
  source,
  activeApplications
}) => {
  let score = 0

  if (candidate.years_of_experience >= vacancy.minimum_experience) {
    score += 4
  }

  if (source === 'REFERRAL') {
    score += 3
  }

  if (source === 'INTERNAL') {
    score += 2
  }

  const coverLetterLower = coverLetter.toLowerCase()

  if (
    coverLetterLower.includes('node') ||
    coverLetterLower.includes('sql') ||
    coverLetterLower.includes('api')
  ) {
    score += 2
  }

  if (coverLetter.length > 500) {
    score += 1
  }

  if (activeApplications >= 3) {
    score -= 2
  }

  return Math.max(score, 0)
}

const calculatePriority = (score) => {
  if (score <= 2) {
    return 'LOW'
  }

  if (score <= 4) {
    return 'MEDIUM'
  }

  if (score <= 6) {
    return 'HIGH'
  }

  return 'TOP'
}

const createApplication = async (data) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const candidate = await candidatesRepository.findById(
      data.candidateId,
      client
    )

    if (!candidate) {
      const error = new Error('Candidate not found')
      error.statusCode = 404
      throw error
    }

    const vacancy = await vacanciesRepository.findById(
      data.vacancyId,
      client
    )

    if (!vacancy) {
      const error = new Error('Vacancy not found')
      error.statusCode = 404
      throw error
    }

    if (vacancy.status !== 'OPEN') {
      const error = new Error('Vacancy is closed')
      error.statusCode = 409
      throw error
    }

    const previousApplication =
      await applicationsRepository.findLatestByCandidateAndVacancy(
        data.candidateId,
        data.vacancyId,
        client
      )

    if (previousApplication) {
      if (
        ['RECEIVED', 'IN_REVIEW', 'HIRED'].includes(
          previousApplication.status
        )
      ) {
        const error = new Error(
          'Candidate already has an active or hired application for this vacancy'
        )
        error.statusCode = 409
        throw error
      }

      if (previousApplication.status === 'REJECTED') {
        const rejectedAt = new Date(previousApplication.status_updated_at)
        const now = new Date()
        const daysSinceRejection =
          (now - rejectedAt) / (1000 * 60 * 60 * 24)

        if (daysSinceRejection < 30) {
          const error = new Error(
            'Candidate must wait 30 days before reapplying'
          )
          error.statusCode = 409
          throw error
        }
      }
    }

    const activeApplications =
      await applicationsRepository.countActiveInOtherVacancies(
        data.candidateId,
        data.vacancyId,
        client
      )

    const score = calculateScore({
      candidate,
      vacancy,
      coverLetter: data.coverLetter,
      source: data.source,
      activeApplications
    })

    const priority = calculatePriority(score)

    const application = await applicationsRepository.create(
      {
        candidateId: data.candidateId,
        vacancyId: data.vacancyId,
        coverLetter: data.coverLetter,
        source: data.source,
        score,
        priority
      },
      client
    )

    await client.query('COMMIT')

    return application
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const getApplications = async (filters) => {
  return applicationsRepository.findAll(filters)
}

const updateApplicationStatus = async (id, status) => {
  const application = await applicationsRepository.findById(id)

  if (!application) {
    const error = new Error('Application not found')
    error.statusCode = 404
    throw error
  }

  if (['REJECTED', 'HIRED'].includes(application.status)) {
    const error = new Error(
      'Final application status cannot be changed'
    )
    error.statusCode = 409
    throw error
  }

  return applicationsRepository.updateStatus(id, status)
}

module.exports = {
  createApplication,
  getApplications,
  updateApplicationStatus
}