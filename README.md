# Bomchess



### About the BomchessBot

It is made for testing the private message system. If you send a private message to it, it will send your message back but in reverse in about 5 seconds.

## Functionalities

- Authentication
- Profile pages
- Sending messages to other users
- PvP
- Chat during PvP
- Playing with a bot
- Different match lengths
- Match Replay
- Reporting users, games, private messages.
- Admin panel; Banning users, inspecting reported games and private messages
  
  
## Technologies and Libraries

- Front end
  - React
    - create-react-app (the app will be a SPA)
    - react-router-dom@6 (for routing)
	- chess.js (chess engine)
	- react-chessboard (chess UI for react)
	- async-mutex
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
	bans:{Object {playing: {Number}, chat: {Number}, message: {Number}}},
	type:{String} (normal or admin)
}

matches
{
	_id: ObjectId,
	date: Number,
	length: String,
	white: ObjectId, (user id)
	black: ObjectId, (user id)
	moves: [{color: String, from: String, to: String , flags: String, piece: String, san: String, timestamp: Double}, ...],
	endedBy: String,
	winner: String (w or b)
}

reports
{
	_id: ObjectId,
	type: String, (bio, chat or game),
	content: String,
	sourceUsername: String,
	targetUsername: String,
	targetId: String (reported user's id)
}

privateMessages
{
	_id: ObjectId,
	sender: String,
	reciever: String,
	content: String,
	date: Number,
	isRead: Boolean		
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

Finally, running `npm start` in the `app/front_end`, <br>
and `node index.js` in the `app/backend` sets up the app for development.

the `SECRET` for sessions in the backend's .env file must be changed.

The ports of backend, frontend and database can be changed in `app/front_end/.env` and in `app/backend/.env` environment files.

#### Notes

Because backend listen on a different port, when making AJAX requests from the create-react-app those requests need to be proxied.<br>
To proxy them, this line is added to the create-react-app's package.json file (`app/front_end/package.json`); <br>
`"proxy": "http://localhost:4001"` The port, must be the backend api's port.

Admin panel is accessible at `/admin`. Only an user with `admin` type can access there. For that, an user's type must be manually changed in database from `normal` to `admin`

For the bot to work (`app/backend/BomchessBot.js`) to work, an user must be created (can be created from the site like a normal user), then the `email` and `username` fields in `BomchessBot.js` must be changed accordingly.<br>
(Providing a descriptive bio for the bot would be appropriate.)

If the bot is not wanted, simply delete the `BomchessBot.js` file, also the `Bomchessbot()` line and the import within the `app/backend/index.js` file.<br>

## Regarding Building

Considering required technologies and libraries are installed and running as described in `Regarding Development` section,

Running `npm run build` in `app/front_end` creates the static files in the `app/_build/public` folder. <br>
To serve the files, in the `app/_build` folder, run `npm install` to install the libraries and then `node index.js` to serve the files.

Running `node index.js` in `app/backend` sets up the backend.

If changed in development, backend's and front end's ports must be changed accordingly in the `app/_build/.env` file.
