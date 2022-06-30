import './Home.css'

function Home() {
    return (
      <div id="content-container">

        <div id="home-top">
          <h1>Quick Play</h1>
          <button>Play against computer</button>
        </div>

        <div id="home-middle">
          <button>5 min</button>
          <button>10 min</button>
          <button>15 min</button>
        </div>

        <div id="home-bottom">

          <div id="home-duel-container">
            <h2>Duel</h2>
            <div id="home-duel-top">
              <button>5 min</button>
              <button>10 min</button>
              <button>15 min</button>
            </div>
            <div id="home-duel-bottom">
              <p>username:</p>
              <input></input>
              <button>Duel</button>
            </div>
          </div>

          <div id="home-chat">
            <div id="lobby-chat">
              <h2>Lobby Chat</h2>
              <div></div>
            </div>
            <div id="lobby-chat-online">
              <p>Online Users:</p>
            </div>

          </div>

        </div>

      </div>
    );
  }
  
export default Home;
  