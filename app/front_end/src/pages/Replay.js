import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Replay.css';


const Replay = (props) => {

    const isInitialMount = useRef(true);

    let routerParams = useParams();

    useEffect(() => {
        // ComponentDidMount
        if (isInitialMount.current) {
            isInitialMount.current = false;


        } else {
            // ComponentDidUpdate
            
        }
        
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
          
        }
    },[]);


    return(
        <p>hello from replay of matchId: {routerParams.matchId}</p>
    );
};

export default Replay;