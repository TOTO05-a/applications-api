const { z } = require('zod')

const createApplicationSchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  vacancyId: z.coerce.number().int().positive(),
  coverLetter: z.string().min(1),
  source: z.enum(['REFERRAL', 'INTERNAL', 'JOB_BOARD', 'OTHER'])
})

const updateApplicationStatusSchema = z.object({
  status: z.enum(['RECEIVED', 'IN_REVIEW', 'REJECTED', 'HIRED'])
})

module.exports = {
  createApplicationSchema,
  updateApplicationStatusSchema
}