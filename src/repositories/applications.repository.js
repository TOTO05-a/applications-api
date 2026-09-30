const { pool } = require('../config/database')

const findById = async (id, client = pool) => {
  const query = `
    SELECT
      id,
      candidate_id,
      vacancy_id,
      cover_letter,
      source,
      score,
      priority,
      status,
      created_at,
      status_updated_at
    FROM applications
    WHERE id = $1
  `

  const { rows } = await client.query(query, [id])

  return rows[0] || null
}

const findLatestByCandidateAndVacancy = async (
  candidateId,
  vacancyId,
  client = pool
) => {
  const query = `
    SELECT
      id,
      candidate_id,
      vacancy_id,
      status,
      created_at,
      status_updated_at
    FROM applications
    WHERE candidate_id = $1
      AND vacancy_id = $2
    ORDER BY created_at DESC
    LIMIT 1
  `

  const { rows } = await client.query(query, [candidateId, vacancyId])

  return rows[0] || null
}

const countActiveInOtherVacancies = async (
  candidateId,
  vacancyId,
  client = pool
) => {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM applications
    WHERE candidate_id = $1
      AND vacancy_id <> $2
      AND status IN ('RECEIVED', 'IN_REVIEW')
  `

  const { rows } = await client.query(query, [candidateId, vacancyId])

  return rows[0].count
}

const create = async (application, client = pool) => {
  const query = `
    INSERT INTO applications (
      candidate_id,
      vacancy_id,
      cover_letter,
      source,
      score,
      priority,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'RECEIVED')
    RETURNING
      id,
      candidate_id,
      vacancy_id,
      cover_letter,
      source,
      score,
      priority,
      status,
      created_at,
      status_updated_at
  `

  const values = [
    application.candidateId,
    application.vacancyId,
    application.coverLetter,
    application.source,
    application.score,
    application.priority
  ]

  const { rows } = await client.query(query, values)

  return rows[0]
}

const findAll = async ({ status, vacancyId } = {}, client = pool) => {
  const conditions = []
  const values = []

  if (status) {
    values.push(status)
    conditions.push(`a.status = $${values.length}`)
  }

  if (vacancyId) {
    values.push(vacancyId)
    conditions.push(`a.vacancy_id = $${values.length}`)
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const query = `
    SELECT
      a.id,
      a.candidate_id,
      c.name AS candidate_name,
      c.email AS candidate_email,
      a.vacancy_id,
      v.title AS vacancy_title,
      a.cover_letter,
      a.source,
      a.score,
      a.priority,
      a.status,
      a.created_at,
      a.status_updated_at
    FROM applications a
    INNER JOIN candidates c ON c.id = a.candidate_id
    INNER JOIN vacancies v ON v.id = a.vacancy_id
    ${where}
    ORDER BY a.score DESC, a.created_at ASC
  `

  const { rows } = await client.query(query, values)

  return rows
}

const updateStatus = async (id, status, client = pool) => {
  const query = `
    UPDATE applications
    SET
      status = $1,
      status_updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      candidate_id,
      vacancy_id,
      cover_letter,
      source,
      score,
      priority,
      status,
      created_at,
      status_updated_at
  `

  const { rows } = await client.query(query, [status, id])

  return rows[0] || null
}

module.exports = {
  findById,
  findLatestByCandidateAndVacancy,
  countActiveInOtherVacancies,
  create,
  findAll,
  updateStatus
}