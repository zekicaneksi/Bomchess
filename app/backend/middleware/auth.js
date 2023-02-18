import { User } from "../model/user.js";
import mongoose from "mongoose";

// Checks if the user is logged in
const auth = async (req, res, next) => {
    if(req.session.userID == undefined){
        return res.status(401).send();
    }
    else{

        let id = mongoose.Types.ObjectId(req.session.userID);
        const user = await User.findOne({ '_id': id });
        if (user.username == '') return res.status(401).send();

        next();
    }
}

export {auth};