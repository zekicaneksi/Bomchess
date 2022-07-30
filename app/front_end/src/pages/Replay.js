import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Replay.css';


const Replay = (props) => {

    const isInitialMount = useRef(true);

    let routerParams = useParams();

    const [matchInfo, setMatchInfo] = useState();


    function getMatchInfo(){

        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                setMatchInfo(JSON.parse(httpRequest.response));
              } else if (httpRequest.status === 404) {
                setMatchInfo('notFound');
              } else {
                alert("unknown error from server");
              }
            }
        }

        HelperFunctions.ajax('/replay?matchId='+routerParams.matchId,'GET',responseFunction);

    }

    useEffect(() => {
        // ComponentDidMount
        if (isInitialMount.current) {
            isInitialMount.current = false;

            getMatchInfo();

        } else {
            // ComponentDidUpdate
            
        }
        
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
          
        }
    },[]);


    if(matchInfo === undefined){
        return(<p>Loading...</p>);
    }
    else if(matchInfo === 'notFound'){
        return(
            <div>
                <p>Match with the {routerParams.matchId} id couldn't be found.</p>
                <button onClick={() => setMatchInfo('home')}>Go Back</button>
            </div>
        )
    }
    else if(matchInfo === 'home'){
        return(<Navigate to='/' />);
    }
    else {
        return(
            <p>{JSON.stringify(matchInfo)}</p>
        );
    }
};

export default Replay;