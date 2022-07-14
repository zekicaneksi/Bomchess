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
	- chess.js (chess engine)
	- react-chessboard (chess UI for react)
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
    - chess.js (chess engine)
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
	date: Number,
	length: String,
	white: ObjectId,
	black: ObjectId,
	moves: [{Object}, {Object}, ...],
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

Considering required technologies; Node.js (npm) and MongoDB are installed and running, <br>
and collections (users, matches, reports, ...) in MongoDB are created,

Running `npm install` in `app/backend` and in `app/front_end` installs the libraries,

Finally, running "npm start" in the `app/front_end`, <br>
and "node index.js" in the `app/backend` sets up the app for development.

the `SECRET` for sessions in the backend's .env file must be changed.

The ports of backend, frontend and database can be changed in `app/front_end/.env` and in `app/backend/.env` environment files.

#### Notes

Because backend listen on a different port, when making AJAX requests from the create-react-app those requests need to be proxied.<br>
To proxy them, this line is added to the create-react-app's package.json file (`app/front_end/package.json`); <br>
`"proxy": "http://localhost:4001"` The port, must be the backend api's port.

## Regarding Building

Considering required technologies and libraries are installed are running as described in `Regarding Development` section,

Running `npm run build` in `app/front_end` creates the static files in the `app/_build/public` folder. <br>
To serve the files, in the `app/_build` folder, run `npm install` to install the libraries and then `node index.js` to serve the files.

Running `node index.js` in `app/backend` sets up the backend.

If changed in development, backend's and front end's ports must be changed accordingly in the `app/_build/.env` file.