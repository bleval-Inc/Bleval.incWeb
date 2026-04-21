import { Router } from 'express'
import { getLeads, updateLeadStatus } from './leadsService.js'
import { requireMasterKey } from '../../middleware/auth.js'

export const leadsRouter = Router()

leadsRouter.get('/', requireMasterKey, async (req, res, next) => {
  try {
    const leads = await getLeads(req.client.id, req.query.status)
    res.json({ leads })
  } catch (err) { next(err) }
})

leadsRouter.patch('/:id/status', requireMasterKey, async (req, res, next) => {
  try {
    const { status } = req.body
    const lead = await updateLeadStatus(req.params.id, req.client.id, status)
    if (!lead) return res.status(404).json({ error: 'Lead not found' })
    res.json(lead)
  } catch (err) { next(err) }
})