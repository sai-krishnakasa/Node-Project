const { Router } = require('express')
const db = require('../models')
const handleErrors = require('../utils/handleErrors')

const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const bcrypt = require('bcrypt')
const User = db.undefined.User;
// //console.log(User.create)
const maxAge = 24 * 60 * 60 * 3;
const createToken = (id) => {
    return jwt.sign({ id }, 'secret salt', {
        expiresIn: maxAge
    });
}

module.exports.verifyOTP_get = (req, res) => {
    const OTP = Math.floor(Math.random() * 9000) + 1000;
    console.log("OTP");
    console.log(OTP);
    req.session.OTP = OTP;
    console.log("otp gen:", req.session.OTP)
    req.session.OTP_gen_time = new Date().getTime()
    res.render('verifyOTP', { 'user': null })
}

module.exports.verifyOTP_post = (req, res) => {
    //console.log(req.body)
    const { OTP } = req.body;
    console.log("Entered OTP: ", OTP);
    console.log("Session OTP: ", req.session.OTP);
    const cur_time = new Date().getTime()
    try {
        if (req.session.OTP_gen_time - cur_time > (60000 * 5)) {
            throw new Error(JSON.stringify({ "otp": "OTP EXPIRED!" }))
        }
        if (req.session.OTP !== OTP) {
            throw new Error(JSON.stringify({ "otp": "Invalid OTP!" }))
        }
        else {
            delete req.session.OTP;
            res.send({ "success": "OTP validated Successfully" })
        }

    } catch (err) {
        const errros = handleErrors(err);
        res.send({ "errors": errros });
    }
}

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (password.length < 6) {
        throw new Error(JSON.stringify({ "password": "password length must be > = 6" }))
    }
    if (!passwordRegex.test(password)) {
        throw new Error(JSON.stringify({ "password": "password validation Failed" }))
    }

}

module.exports.resetPassword_post = async (req, res) => {
    //console.log(req.body);
    let { password, cpassword } = req.body
    try {
        if (password !== cpassword) {
            throw new Error(JSON.stringify({ "error": " password != confirm password" }))
        }
        else {
            validatePassword(password);
            const user_id = req.session.user_id;
            //console.log(user_id)
            if (!user_id) {
                throw new Error(JSON.stringify({ "error": "something went wrong" }))
            }
            const user = await User.findOne({
                where: {
                    id: user_id
                }
            })
            //console.log(user);
            if (!user) {
                throw new Error(JSON.stringify({ "error": "user not found" }))
            }
            const salt = await bcrypt.genSalt();
            password = await bcrypt.hash(password, salt);
            await user.update({ password });
            delete req.session.user_id;
            res.status(200).json({ "success": "Password Updated Successfully" })
        }

    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ "errors": errors });
    }
}

module.exports.resetPassword_get = (req, res) => {
    res.render('resetPassword', { user: null });
}




module.exports.singup_get = (req, res) => {
    res.render('singup', { 'user': null })
}

module.exports.forgotPassword_get = (req, res) => {
    res.render('forgotPassword', { user: null });
}

module.exports.forgotPassword_post = async (req, res) => {
    //console.log(req.body)
    const { email } = req.body;
    const user = await User.findOne({
        where: {
            email: email
        }
    })
    try {
        if (user) {
            req.session.user_id = user.id;
            res.send({ user: user });
        }
        else {
            throw new Error(JSON.stringify({ "email": "Email is Not Registered!" }))
        }
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ "errors": errors });
    }

}

module.exports.singup_post = async (req, res) => {
    //console.log(req.body);
    const { email, password, name } = req.body;
    try {
        const user = await User.create({ userName: name, email, password })
        // const token = createToken(user.id);
        // res.cookie('jwt', token, {
        //     maxAge: maxAge * 1000
        // })
        res.status(201).json({ user: user.id })
    }
    catch (errs) {
        // //console.log("errors ", errs);
        const errors = handleErrors(errs);
        res.status(400).json({ errors })
    }
    // res.redirect('login');
    // res.render('singup')
}

module.exports.login_get = async (req, res) => {
    res.render('login', { 'user': null })
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        //console.log("user._id");
        //console.log(user._id);
        const token = createToken(user.id);
        res.cookie('jwt', token,
            {
                httpOnly: true,
                maxAge: maxAge * 1000
            });
        res.status(200).json({ user: user.id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors: errors })
    }
}

module.exports.logout = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.render('login', { user: null })
}




