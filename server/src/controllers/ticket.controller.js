const prisma = require('../../prisma/database')
const {ticketSchema, assignTicket, updateTicketStatus} = require('../../../shared/validations/ticket.schema')
const canTransition = require('../../../shared/transitions')


async function createTicket(req, res){
    const validate = ticketSchema.safeParse(req.body)

    if(!validate.success){
        return res.status(400).json({message:'Failed in Validation'})
    }
    const{title, description, priority, category}=validate.data
    const count = await prisma.ticket.count()
    const ticketNumber = `TKT-${String(count +1).padStart(3, '0')}`;
    const ticket =await prisma.ticket.create(
        {data:{
            title,
            description,
            category,
            priority,
            createdById: req.user.userId,
            ticketNumber
        }}
    )
    return res.status(201).json({ticket, message:'Created Successfully'})

}

async function assign(req,res){
    const validate = assignTicket.safeParse(req.body)

    if(!validate.success){
        return res.status(400).json({message:'Failed in Validation', errors: validate.error.issues})
    }

    const {technicalId} = validate.data

    const found = await prisma.user.findFirst({
        where: {id: technicalId,
                role: 'TECHNICAL'
        }
    })

    if (!found){
       return res.status(404).json({message: 'Not found'})
    }

    const ticket = await prisma.ticket.findUnique({
        where:{
            id:req.params.id
        }
    })

    if(!ticket){
        return res.status(404).json({message: 'Not found'})
    }

    const assign= await prisma.ticket.update({
        data:{
            assignedToId:technicalId,
            status: 'ASSIGNED',
        },
        where:{
            id:ticket.id
        }
    })

    const activity = await prisma.activity.create({
        data:{
        ticketId:ticket.id,
        userId:req.user.userId ,
        type: 'ASSIGNMENT',
        fromStatus: ticket.status,
        toStatus: 'ASSIGNED'
    }
    })

    return res.status(200).json({assign, activity, message:'Assigned Successfully'})

}

async function updateStatus(req,res){
    const validate = updateTicketStatus.safeParse(req.body)

    if(!validate.success){
        return res.status(400).json({message:'Failed in Validation'})
    }

    const ticket = await prisma.ticket.findUnique({
        where:{
            id:req.params.id
        }
    })

    if(!ticket){
        return res.status(404).json({message: 'Not found'})
    }

    const {status} = validate.data
    const role = req.user.role

    const can = canTransition(role,ticket.status, status)

    if (!can){
        return res.status(403).json({message:'Forbidden'})
    }
    

    const result = await prisma.ticket.update({
        where:{id:ticket.id},
        data:{
            status: status
        }
    })

    const activity = await prisma.activity.create({
        data:{
        ticketId:ticket.id,
        userId:req.user.userId ,
        type: 'STATUS_CHANGE',
        fromStatus: ticket.status,
        toStatus: status
    }
    })

    return res.status(200).json({result, activity, message:'Status Updated Successfully'})

}


async function confirmResolution(req,res){
    const ticket = await prisma.ticket.findUnique({
        where:{
            id:req.params.id
        }
    })

    if(!ticket){
        return res.status(404).json({message: 'Not found'})
    }

    if ((ticket.status !== 'RESOLVED') || (req.user.role !== 'EMPLOYEE') || (ticket.createdById !== req.user.userId)){
        return res.status(403).json({message: 'Forbidden'})
    }

    const close = await prisma.ticket.update({
        where:{id: ticket.id},
        data:{status:'CLOSED'}
    })


    const activity = await prisma.activity.create({
        data:{
        ticketId:ticket.id,
        userId:req.user.userId ,
        type: 'STATUS_CHANGE',
        fromStatus: ticket.status,
        toStatus: 'CLOSED'
    }
    })

    return res.status(200).json({close, activity, message:'Status Updated Successfully'})
}

async function getTickets(req, res){
    const {role} = req.user
    const {status, priority, category, search , order, sort} = req.query

    const allowedSortFields = ['priority', 'createdAt', 'status', 'title']
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt'
    const sortOrder = order === 'asc' ? 'asc' : 'desc'

    switch (role){
        case 'EMPLOYEE':
                const empResult = await prisma.ticket.findMany({
                    where:{
                        createdById: req.user.userId,
                        status: status,
                        priority: priority,
                        category: category,
                        title:{contains: search, mode: 'insensitive'}
                    },
                    orderBy:{
                        [sortField] : sortOrder
                    }
                    });
                
                return res.status(200).json({empResult, message: 'Fetched Successfully'})
        case 'TECHNICAL':
                const techResult = await prisma.ticket.findMany({
                    where:{
                        assignedToId: req.user.userId,
                        status: status,
                        priority: priority,
                        category: category,
                        title:{contains: search, mode: 'insensitive'}
                    },
                     orderBy:{
                        [sortField] : sortOrder
                    }
                });
                return res.status(200).json({techResult, message: 'Fetched Successfully'})
            
        case 'MANAGER':
                const result = await prisma.ticket.findMany(
                    {
                    where:{
                        status: status,
                        priority: priority,
                        category: category,
                        title:{contains: search, mode: 'insensitive'}
                    },
                     orderBy:{
                        [sortField] : sortOrder
                    }
                }
                );
                return res.status(200).json({result, message: 'Fetched Successfully'})
        default: return res.status(403).json({message: 'Forbidden Role'})

    }
}

async function getTicketsById(req, res){
    const result = await prisma.ticket.findUnique({
        where:{
            id:req.params.id
        }
    });

    const activity = await prisma.activity.findMany({
        where:{
            ticketId: req.params.id
        }
    })
    if (!result){
        return res.status(404).json({message:'No Tickets Found'})
    }
    return res.status(200).json({result, message: 'Fetched Successfully'})
}

async function addComment(req, res){
    const {comment} = req.body

    if (!comment){
        return res.status(400).json({message: 'Empty Comment'})
    }

    const ticket = await prisma.ticket.findUnique({
        where:{
            id:req.params.id
        }
    })

    if(!ticket){
        return res.status(404).json({message: 'No Tickets Found'})
    }

    const activity = await prisma.activity.create({
        data:{
            ticketId:req.params.id,
            userId:req.user.userId ,
            type: 'COMMENT',
            content:comment
    }})

    return res.status(201).json({activity, message:'Comment Added Successfully'})
    
}

async function getStats(req, res){
    const role = req.user.role
    const userId = req.user.userId

    switch (role){
        case 'TECHNICAL': {
            const myTickets = await prisma.ticket.count({
                where: { assignedToId: userId }
            })

            const myOpenTickets = await prisma.ticket.count({
                where: {
                    assignedToId: userId,
                    status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
                }
            })

            return res.status(200).json({
                myTickets,
                myOpenTickets
            })
        }
        case 'EMPLOYEE': {
            const myTickets = await prisma.ticket.count({
                where: { createdById: userId }
            })

            const myOpenTickets = await prisma.ticket.count({
                where: {
                    createdById: userId,
                    status: { in: ['RESOLVED'] }
                }
            })

            return res.status(200).json({
                myTickets,
                myOpenTickets
            })
        }
        case 'MANAGER': {
            const tickets = await prisma.ticket.count()

            const openTickets = await prisma.ticket.count({
                where: {
                    status: { in: ['ASSIGNED', 'IN_PROGRESS', 'OPEN'] }
                }
            })

            const resolvedTickets = await prisma.ticket.count({
                where: {
                    status: { in: ['RESOLVED'] }
                }
            })
            const closedTickets = await prisma.ticket.count({
                where: {
                    status: { in: ['CLOSED'] }
                }
            })

            return res.status(200).json({
                tickets,
                openTickets,
                resolvedTickets,
                closedTickets
            })
        }


        default:
            return res.status(403).json({message: 'Forbidden Role'})
    }
}

module.exports ={createTicket, addComment , assign, updateStatus, confirmResolution, getTickets, getTicketsById, getStats}