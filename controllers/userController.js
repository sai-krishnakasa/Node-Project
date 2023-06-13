const { Router } = require('express')
const User = require('../models').undefined.User;
//console.log("user:", User)
const handleErrors = require('../utils/handleErrors')
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const bcrypt = require('bcrypt')

module.exports.profile_get = (req, res) => {
    //console.log(res.locals.user)
    res.render('profile', { user: res.locals.user });
}


module.exports.profile_put = async (req, res) => {
    const user = res.locals.user;
    //console.log("=======================req.body================================")
    //console.log(req.file)
    const { mobile_no, userName, email } = req.body;
    try {
        const dup_user = await User.findOne({
            where: {
                email: email
            }
        });

        let pattern = /^[6-9]\d{9}$/
        if (!pattern.test(mobile_no)) {
            throw new Error(JSON.stringify({ "mobile_no": "Invalid Mobile Number" }))
        }
        if (dup_user && user.id != dup_user.id) {
            throw new Error(JSON.stringify({ "email": "Email is Already Registred with another Account" }))
        }

        if (req.file) {
            await user.update({
                mobile_no,
                email,
                userName,
                profile_pic: req.file.path.split('uploads\\')[1]
            })

        }
        else {

            await user.update({
                mobile_no,
                email,
                userName
            })
        }

        res.status(200).json({ "success": "Profile Updated Successfully" })
    }
    catch (err) {
        //console.log("==============================")
        //console.log(err);
        //console.log("==============================")
        const errors = handleErrors(err);
        res.json({ "errors": errors })
    }
}

