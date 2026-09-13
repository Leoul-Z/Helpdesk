const {z} = require('zod')

const ticketSchema= z.object({
    title: z.string().min(10).max(25),
    description: z.string().min(10).max(100),
    priority:z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    category: z.enum(['HR', 'FACILITIES','OTHER', 'IT_SUPPORT'])

})

module.exports={ticketSchema}