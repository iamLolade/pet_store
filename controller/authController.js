const User = require("../models/User");
const jwt = require("jsonwebtoken");

//handle errors
const handleErrors = (error) => {
    console.log(error.message, error.code);
    let errors = { email: "", password: "" };

    //duplicate error
    if(error.code === 11000) {
        errors.email = "Email already in use";
        return errors;
    }

    //incorrect email
    if(error.message == "Incorrect email") {
        errors.email = "This email is not registered";
        return errors;
    }

    //incorrect password
    if(error.message == "Incorrect password") {
        errors.password = "Password is incorrect";
        
    }

    //Validation errors
    if(error.message.includes("user validation failed")) {
        Object.values(error.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

//Lifecycle
const maxAge = 3 * 24 * 60 * 60;

//Create token
const createToken = (id) => {
    return jwt.sign({ id }, "caveman jwt secret", {
        expiresIn: maxAge
    });
}

module.exports.signup_get = (req, res) => {
    res.render("signup");
}

module.exports.login_get = (req, res) => {
    res.render("login");
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;
    //Create new user
    try {

        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ user: user._id })

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({ err })
    }
}


module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.login(email, password)
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({user: user._id})

    } catch (error) {
        const err = handleErrors(error)
        res.status(400).json({ err });
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
}