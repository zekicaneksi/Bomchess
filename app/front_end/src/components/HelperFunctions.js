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

export function decisecondsToChessCountDown(deciseconds) {
    let deciseconds_min = parseInt(deciseconds/600);
    let deciseconds_sec = parseInt((deciseconds-(deciseconds_min*600))/10);

    let toShow_min = (deciseconds_min>=10 ? String(deciseconds_min) : "0"+ String(deciseconds_min));
    let toShow_sec = (deciseconds_sec>=10 ? String(deciseconds_sec) : "0"+ String(deciseconds_sec));

    return toShow_min + ':' + toShow_sec;
}