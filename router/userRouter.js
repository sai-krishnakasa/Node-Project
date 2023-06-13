const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

module.exports = (uploadProfilePic) => {
    router.get('/profile', userController.profile_get);
    router.put('/profile', uploadProfilePic.single('profile_pic'), userController.profile_put);
    return router;
}
