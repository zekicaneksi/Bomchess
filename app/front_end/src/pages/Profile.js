import React, { useEffect, useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Profile.css';

const Profile = () => {

    const isInitialMount = useRef(true);
    let routerParams = useParams();

    const [profileInfo, setProfileInfo] = useState();

    useEffect(() => {
        // ComponentDidMount
        if (isInitialMount.current) {
            isInitialMount.current = false;

            

            let responseFunction = (httpRequest) => {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                  if (httpRequest.status === 200) {
                    setProfileInfo(JSON.parse(httpRequest.response));
                  } else if (httpRequest.status === 404) {
                    setProfileInfo('notFound');
                  } else {
                    alert("unknown error from server");
                  }
                }
            }

            HelperFunctions.ajax('/profile?username='+routerParams.username,'GET',responseFunction);

        } else {
            // ComponentDidUpdate

        }
        
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
          
        }
    },[]);


    if(profileInfo === undefined){
        return(<p>Loading...</p>);
    } else if( profileInfo === 'notFound'){
        return(<p>User couldn't be found</p>);
    } else {
        if(profileInfo.userIsMe){
            console.log(profileInfo.messages);
            return(<p>Found and the user is me! {profileInfo.username}</p>);
        } else {
            return(<p>Found! user is {profileInfo.username}</p>);
        }
    }

};

export default Profile;