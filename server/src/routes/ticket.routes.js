const controller = require('../controllers/ticket.controller')
const authorize = require('../middleware/authorize')
const authenticate = require('../middleware/authenticate')
const {Router} = require('express')

const ticketRouter = Router()

ticketRouter.post('/tickets', authenticate , authorize('EMPLOYEE'), controller.createTicket)
ticketRouter.post('/tickets/:id/comments', authenticate, controller.addComment)

ticketRouter.get('/tickets', authenticate, controller.getTickets)
ticketRouter.get('/tickets/stats', authenticate, controller.getStats)
ticketRouter.get('/tickets/:id', authenticate, controller.getTicketsById)
ticketRouter.patch('/tickets/:id/status', authenticate, authorize('MANAGER', 'TECHNICAL'), controller.updateStatus)
ticketRouter.patch('/tickets/:id/confirm', authenticate, authorize('EMPLOYEE'), controller.confirmResolution)
ticketRouter.patch('/tickets/:id/assign', authenticate, authorize('MANAGER'), controller.assign)

module.exports = ticketRouter