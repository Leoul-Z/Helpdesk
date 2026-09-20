const {z} = require('zod')

const ticketSchema= z.object({
    title: z.string().min(10).max(25),
    description: z.string().min(10).max(100),
    priority:z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    category: z.enum(['HR', 'FACILITIES','OTHER', 'IT_SUPPORT'])
    

})
const updateTicketStatus= z.object({
    status: z.enum(['IN_PROGRESS','ASSIGNED','RESOLVED', 'CLOSED'])
})

const assignTicket =z.object
({
    TechnicalId: z.string().min(5)
})

module.exports={ticketSchema, updateTicketStatus, assignTicket}