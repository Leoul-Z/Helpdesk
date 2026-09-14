const {env} = require('../../env')
const jwt = require('jsonwebtoken')

function authenticate (req, res, next){
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')){
        return res.status(401).json({message:'Missing Header'})
    }
    const token = header.split(' ')[1]

    if(!token){
        return res.status(401).json({message:'Invalid Token'})
    }

    try{
        const decoded = jwt.verify(token, env.jwtSecret)
        req.user=decoded
        next()
    }catch(err){
        return res.status(401).json({message:'Invalid or expired Token'})
    }

}
module.exports = authenticate