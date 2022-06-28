## Functionalities

- Authentication
- Profile pages
- Sending messages to other users
- PvP
- Chat during PvP
- Duel with a Player
- Playing with a bot
- Different match lengths
- Match Replay
- Admin panel; Banning users, inspecting reported games and private messages
- Reporting users, games, private messages.

## The Design (wireframe)

<b>(Figma file and pdf of frames are also in repo)</b>

/Sign|/|/\<userName>(Users own page)
:-:|:-:|:-:
<img src="https://user-images.githubusercontent.com/59491631/175370379-a4e87480-0078-4372-8d87-0145728d5d27.png" style="display:inline; width:300px; height:300px;">  |  <img src="https://user-images.githubusercontent.com/59491631/175371130-1807fbc4-5fb0-4c08-b259-327520f809fe.png" style="display:inline; width:300px; height:300px;"> |   <img src="https://user-images.githubusercontent.com/59491631/175374065-9a0bafa2-2516-404c-8448-a6fa2cce7404.png" style="display:inline; width:300px; height:300px;"> 

/\<userName>(Other's page) | /admin | /PvP
:-:|:-:|:-:
<img src="https://user-images.githubusercontent.com/59491631/175374357-6915d22e-d7ee-4c49-9874-36a1babb4ae6.png" style="display:inline; width:300px; height:300px;"> | <img src="https://user-images.githubusercontent.com/59491631/175374815-ff8c8f6a-49c3-44e5-b4bf-fd22eab85716.png" style="display:inline; width:300px; height:300px;"> | <img src="https://user-images.githubusercontent.com/59491631/175375151-a06bd5dc-8018-4e14-b5d4-771e615af8d7.png" style="display:inline; width:300px; height:300px;">
  
/replay?id=<...>
:-:
  <img src="https://user-images.githubusercontent.com/59491631/175375402-00b46374-88fc-4b90-8915-ae4c12b96a6d.png" style="display:inline; width:300px; height:300px;">
  
  
## Technologies and Libraries

- Front end
  - React
    - create-react-app (the app will be a SPA)
    - react-router-dom@6 (for routing)
  - Nodejs
    - express
    - express-http-proxy
- Backend
  - Nodejs
    - express (routing, serving, etc.)
    - express-session (authentication)
    - mongoose (to access MongoDB and use of object model)
    - connect-mongo (storage for express-session)
    - dotenv (environment variables)
    - bcryptjs (to hash passwords)
    - ws (WebSocket library)
- Database
  - MongoDB

Database scheme;

```
users
{
	_id: ObjectId,
	email: String,
	username: String,
	password: String,
	bio: String,
	bans:{playing: Boolean, chat: Boolean, message: Boolean}
}

matches
{
	_id: ObjectId,
	date: String,
	players: [{id: String, side: String}, {id: String, side: String}],
	length: String,
	moves: [{timeBlack: String, timeWhite: String, move: String}, ...],
	endedBy: String,
	winner: String,
	loser: String
}

reports
{
	_id: ObjectId,
	type: String,
	targetId: String
}

privateMessages
{
	_id: ObjectId,
	sender: String,
	reciever: String,
	content: String,
	date: String		
}

sessions
{
	_id: String,
	expires: Date,
	session: {
		cookie: {...},
		userID: String
	}
}
```


## Regarding Development

Considering required technologies and libraries are installed and running,

Running "npm start" in the app/front_end, <br>
and running "node index.js" in the app/backend sets up the app for development.

#### Notes

Because the front end (create-react-app) listens on the port 3000, and the backend listens on port 4001, when making AJAX requests from the create-react-app those requests go to the port 3000.<br>
To proxy them, this line is added to the create-react-app's package.json file; <br>
"proxy": "http://localhost:4001"

## Regarding Building

Considering required technologies and libraries are installed and running,

Running "npm run build" in app/front_end creates the static files in the app/_build/client folder. To serve the files, run "node index.js" in the _build folder.

Running "node index.js" in app/backend sets up the backend.