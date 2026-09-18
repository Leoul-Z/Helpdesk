const prisma = require('../../prisma/database')
const {env}= require('../../env')
const jwt = require('jsonwebtoken')
const bycrpt = require('bcryptjs')
const {registerSchema, loginSchema} = require('../../../shared/validations/auth.schema')


async function register (req, res){
    const validate = registerSchema.safeParse(req.body)
    if(!validate.success){
        return res.status(400).json({message: 'Validation Failed'})
    }

    const {name, email, role, password} = req.body
    const exist= await prisma.user.findUnique({
        where: {email}
    });
    if (exist){
        return res.status(409).json({message :'User already exists'})
    }else{
    const hashed = await bycrpt.hash(password, 10)
    const user = await prisma.user.create({
        data:{
            name,
            email,
            passwordHash: hashed,
            role: role ? role.toUpperCase() : 'EMPLOYEE'
        }
    })

    const accessToken= jwt.sign(
        {userId: user.id, role: user.role}, env.JWT_SECRET, {expiresIn: '1d'}
    )

    const refreshToken= jwt.sign({userId: user.id, role: user.role}, env.JWT_REFRESH_SECRET, {expiresIn: '7d'}
    )

    const result = {
        user:{id:user.id, email:user.email, role:user.role},
        accessToken,
        refreshToken
    }
    return res.status(201).json(result)
    }
    
}

async function login(req, res){
    const validate = loginSchema.safeParse(req.body)
    if(!validate.success){
        return res.status(400).json({message: 'Validation Failed', errors: validate.error.issues})
    }

   const {email, password}= req.body
   
   const user= await prisma.user.findUnique({
    where: {email}
   });
    if (!user) {
        return res.status(403).json({message: 'Invalid email or password'})
    }

    const checkPassword = await bycrpt.compare(password, user.passwordHash)
    if (!checkPassword) {
        return res.status(403).json({message: 'Invalid email or password'})
    }
   
   const accessToken= jwt.sign(
        {userId: user.id, role: user.role}, env.JWT_SECRET, {expiresIn: '1d'}
    )

    const refreshToken= jwt.sign({userId: user.id, role: user.role}, env.JWT_REFRESH_SECRET, {expiresIn: '7d'}
    )

    const result = {
        user:{id:user.id, email:user.email, role:user.role},
        accessToken,
        refreshToken
    }
    return res.status(200).json(result)
}


async function logout (req, res){
    return res.status(200).json({message: 'Logout Succesful'})

}

module.exports ={register, login, logout}