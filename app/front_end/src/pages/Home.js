import './Home.css'

function Home() {
    return (
      <div>
      <button onClick={function(){
        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = () => {

      if (httpRequest.readyState === XMLHttpRequest.DONE) {
          // Everything is good, the response was received.
          if (httpRequest.status === 200) {
            alert(httpRequest.responseText);
          } else if(httpRequest.status === 400){
            alert(httpRequest.responseText);
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
      }}>check if im logged in</button>



      <button onClick={function(){
        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = () => {

      if (httpRequest.readyState === XMLHttpRequest.DONE) {
          // Everything is good, the response was received.
          if (httpRequest.status === 200) {
            alert(httpRequest.responseText);
          }
          else {
            alert("unknown error from server");
          }
      } else {
          // Not ready yet.
      }

    }

    httpRequest.open('GET', '/api/logout', true);
    httpRequest.send();
      }}>logout</button>
      </div>
    );
  }
  
export default Home;
  