import './Home.css'

function Home() {
    return (
      <button onClick={function(){
        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = () => {

      if (httpRequest.readyState === XMLHttpRequest.DONE) {
          // Everything is good, the response was received.
          if (httpRequest.status === 200) {
            alert(httpRequest.responseText);
          } else if(httpRequest.status === 400){
            alert("invalid credentials");
          }
          else {
            alert("unknown error from server");
          }
      } else {
          // Not ready yet.
      }

    }

    httpRequest.open('GET', '/api/test', true);
    httpRequest.send();
      }}>check token validity</button>
    );
  }
  
export default Home;
  