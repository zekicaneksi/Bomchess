import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Profile.css';

const Profile = () => {

    const isInitialMount = useRef(true);
    let routerParams = useParams();

    const [profileInfo, setProfileInfo] = useState();

    const NotFoundPopup = () => {

        const [navigate, setNavigate] = useState(false);

        if(navigate) return(<Navigate to='/' />);
        else{
            return(
                <div className='notfoundpopup'>
                    <p>The user couldn't be found</p>
                    <button onClick={ () => setNavigate(true)}>OK</button>
                </div>
            );
        }
    }

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
        return(<NotFoundPopup />);
    } else {
        
        if(profileInfo.userIsMe) console.log(profileInfo.messages);
        
        return(
            <div className='profile-container'>
                <div className='profile-bio-container'>
                    <h2>{profileInfo.username}</h2>
                    <div>
                        <p>{profileInfo.bio}</p>
                    </div>
                    <button>Edit</button>
                </div>
                <div className='profile-bottom-container'>
                    <div className='profile-messages-container'></div>
                    <div className='profile-match-history-container'></div>
                </div>
            </div>
        );
        
    }

};

export default Profile;