export let apiPort = 4001;

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