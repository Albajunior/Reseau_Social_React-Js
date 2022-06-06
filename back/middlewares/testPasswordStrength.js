module.exports = (req, res, next) => {
    const passwordStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    //(?=.*[a-z]) : The string must contain at least 1 lowercase alphabetical character
    //(?=.*[A-Z]) : The string must contain at least 1 uppercase alphabetical character
    //(?=.*[0-9]) : The string must contain at least 1 numeric character
    //(?=.*[!@#$%^&*]) : The string must contain at least one special character, but we are escaping reserved regex characters to avoid conflict
    //(?=.{8,})	The string must be eight characters or longer
    let password = "";
    if(req.body.password){
        password = req.body.password;
    }
    else if(req.body.newPassword){
        password = req.body.newPassword;
    }
    if(!passwordStrong.test(password)){
        res.status(400).json({message : 'Password is too weak !'});
    }
    else{
        next();
    }

};