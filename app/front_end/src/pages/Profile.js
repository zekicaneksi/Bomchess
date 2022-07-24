import React from 'react';
import { useParams } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Profile.css';

const Profile = () => {
    let routerParams = useParams();
    let username=routerParams.username;
    return(<p>hello {username}</p>);
};

export default Profile;