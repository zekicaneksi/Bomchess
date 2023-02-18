import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import * as HelperFunctions from './../components/HelperFunctions.js'
import './LoginViaGoogle.css';

export default function LoginViaGoogle(props) {


    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [username, setUsername] = useState('');

    function checkSession() {
        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    setIsLoggedIn('true');
                } else if (httpRequest.status === 401) {
                    setIsLoggedIn('false');
                } else {
                    alert("unknown error from server");
                }
            }
        }
        HelperFunctions.ajax('/checkGoogleSession', 'GET', responseFunction);
    }

    useEffect(() => {
        checkSession();
    }, [])

    function handleOnClick() {
        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    setIsLoggedIn('navigate');
                } else if (httpRequest.status === 406) {
                    alert('username is in use');
                } else {
                    alert("unknown error from server");
                }
            }
        }
        HelperFunctions.ajax('/set-google-username', 'POST', responseFunction, { "username": username });
    }

    function onKeyUp(e) {
        if (e.key === 'Enter') {
            handleOnClick();
        }
    }

    if (isLoggedIn == '') return (<p>Loading...</p>)
    if (isLoggedIn == 'false') return (<Navigate to={'/sign'} />);
    if (isLoggedIn == 'navigate') return (<Navigate to='/' />);

    return (
        <div id="sign-google">
            <h1>Enter an username</h1>
            <input onKeyUp={onKeyUp} value={username} onChange={(e) => { setUsername(e.target.value) }}></input>
            <button onClick={handleOnClick}>continue</button>
        </div>
    );
}