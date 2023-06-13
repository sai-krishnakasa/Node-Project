const { Router } = require('express')
const authController = require('../controllers/authController')

const router = Router()

router.get('/signup', authController.singup_get)
router.post('/signup', authController.singup_post)
router.get('/login', authController.login_get)
router.post('/login', authController.login_post)
router.get('/logout', authController.logout)
router.get('/forgotPassword', authController.forgotPassword_get)
router.post('/forgotPassword', authController.forgotPassword_post)
router.get('/verifyOTP', authController.verifyOTP_get)
router.get('/resetPassword', authController.resetPassword_get)
router.post('/resetPassword', authController.resetPassword_post)
router.post('/verifyOTP', authController.verifyOTP_post)

module.exports = router; 