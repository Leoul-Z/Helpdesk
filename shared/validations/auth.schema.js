const {z}= require('zod')

const registerSchema = z.object({
    name: z.string().min(3).max(20),
    email:z.string().email(),
    role:z.enum(['EMPLOYEE', 'TECHNICAL', 'MANAGER']).default('EMPLOYEE'),
    password:z.string().min(8)

})


const loginSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
})

module.exports={registerSchema, loginSchema}