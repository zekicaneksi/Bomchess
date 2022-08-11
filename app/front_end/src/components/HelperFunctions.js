export let apiPort = process.env.REACT_APP_BACKEND_API_PORT;


/**
 * @param route /api will added to the route automatically. ex:/login
 * @param type 'GET' or 'POST'
 * @param responseFunction will be assigned to onreadystatechange of the request
 * @param payloadJson payload for 'POST' requests, don't give anything for GET requests.
 */
export function ajax(route, type, responseFunction, payloadJson) {
    let httpRequest = new XMLHttpRequest();
    
    httpRequest.onreadystatechange = () => {responseFunction(httpRequest);}

    httpRequest.open(type, '/api'+ route, true);

    if(type == 'POST'){
        httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        httpRequest.send(JSON.stringify(payloadJson));
    }
    else{
        httpRequest.send();
    }
}

export function milisecondsToChessCountDown(miliseconds) {
    let miliseconds_min = parseInt(miliseconds/60000);
    let miliseconds_sec = parseInt((miliseconds-(miliseconds_min*60000))/1000);

    let toShow_min = (miliseconds_min>=10 ? String(miliseconds_min) : "0"+ String(miliseconds_min));
    let toShow_sec = (miliseconds_sec>=10 ? String(miliseconds_sec) : "0"+ String(miliseconds_sec));

    return toShow_min + ':' + toShow_sec;
}

export function epochToDate(epoch){
    let date = new Date(epoch);
    let toReturn = date.getDay() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " ";
    let hour= date.getHours();
    let minute = date.getMinutes();
    if(hour < 10) hour = '0' + hour;
    if(minute < 10) minute = '0' + minute;
    toReturn += hour + ':' + minute;
    return toReturn;
}