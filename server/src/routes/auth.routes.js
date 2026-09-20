const auth = require('../controllers/auth.controller')
const authenticate = require('../middleware/authenticate')
const {Router} = require('express')
const router= Router()

router.post('/register', auth.register)
router.post('/login', auth.login)
router.post('/logout', authenticate, auth.logout)
router.get('/users', authenticate, auth.getUsers)
router.patch('/users/:id/role', authenticate, auth.updateRole)

module.exports = router