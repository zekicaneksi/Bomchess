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