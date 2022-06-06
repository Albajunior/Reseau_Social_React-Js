module.exports = (req, res, next) => {
    const emailValid = /^[A-Za-z0-9_-]+@\w+\.[a-z]+$/;
    let email = "";
    if(req.body.email){
        email = req.body.email;
    }
    else if(req.body.newEmail){
        email = req.body.newEmail;
    }
    if(!emailValid.test(email)){
        res.status(400).json({error : 'Invalid email format'});
    }
    else{
        next();
    }

};