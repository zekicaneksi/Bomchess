// Checks if the user is logged in
const auth = async (req, res, next) => {
    if(req.session.userID == undefined){
        return res.status(401).send();
    }
    else{
        next();
    }
}

export {auth};