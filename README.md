# Bomchess
## [To test live: Click me](https://bomchess.zekicaneksi.com)

| Home Page  | Playing a Game  |  An other user's profile | 
| ------------- | ------------- | ------------- |
| ![image](https://user-images.githubusercontent.com/59491631/185667456-3e00b4e4-919b-4ed3-9331-b8d642af1de4.png)| ![image](https://user-images.githubusercontent.com/59491631/185667514-e19d6e0c-4a14-41b5-824f-c2e4b7cefab3.png) | ![image](https://user-images.githubusercontent.com/59491631/185667557-b73a35f4-3e47-4047-a24a-6ec82366bd8d.png) |

| Notification  | Viewing user's own profile  | 
| ------------- | ------------- |
| ![image](https://user-images.githubusercontent.com/59491631/185668220-33911d7f-b97b-4778-b9af-3db7a046bb16.png) | ![image](https://user-images.githubusercontent.com/59491631/185668290-3cce5ba0-5735-4fb5-841d-2359c01806f0.png) |

| Reporting a player  | Admin panel  | 
| ------------- | ------------- |
| ![image](https://user-images.githubusercontent.com/59491631/185668461-d827ba43-677c-472d-9709-5e67f9405729.png) | ![image](https://user-images.githubusercontent.com/59491631/185668541-8b22fae5-654c-4031-8716-0fd4ce85512a.png) |

| Signin  | Login  | Register  | 
| ------------- | ------------- | ------------- |
| ![image](https://user-images.githubusercontent.com/59491631/219881721-e1617a8b-ae14-4b64-94a1-75193c6cf626.png)|  ![image](https://user-images.githubusercontent.com/59491631/185667078-76542ad4-9fba-4f03-88bf-d8cb940d0a4f.png)| ![image](https://user-images.githubusercontent.com/59491631/185667112-fe62a2bf-2e48-4589-b008-f2e9ae13cc21.png)|
 
### About the BomchessBot that lurks in the Lobby Chat

It is made for testing the private message system. If you send a private message to it, it will send your message back but in reverse in about 5 seconds.

## Functionalities

- Authentication (Google Authentication as well)
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

Before everything, i want to let you know that backend and frontend must be both in the same host because of hardcoded "localhost"s in the code. This was because of my inexperience at the time of writing the project.

Considering required technologies (Node.js (npm) and MongoDB) are installed and running

Running `npm install` in `app/backend` and in `app/front_end` installs the libraries,

The `SECRET` for sessions in `app/backend/.env` file must be changed.

The ports of backend, frontend and database can be changed in `app/front_end/.env` and in `app/backend/.env` environment files.

Because backend listens on a different port, when making AJAX requests from the create-react-app those requests need to be proxied.<br>
To proxy them, this line is added to the create-react-app's package.json file (`app/front_end/package.json`); <br>
`"proxy": "http://localhost:4001"` The port, must be the backend's ```API_PORT``` port.

Setting up a google cloud project for google auth;
- Create a project in `Google Cloud Developer Console`
- Go to API's & Services -> Credentials and create a `OAuth client ID` credential
	- It will ask you to configure your consent screen first. When doing so, include the `email` scope. Also, we don't require a test user since we don't access any sensitive/restricted info.
	- When creating the credential, add `http://localhost:3000` to `Authorized JavaScript Origins` and `http://localhost:4001/api/login-via-google` to `Authorized redirect URIs` sections. (note that the ports must be your front-end port and backend port relatively)
- After creation, download your credential's JSON file, rename it as `google_login.json` and copy the file into `/app/backend`

Finally, running `npm start` in the `app/front_end`, <br>
and `node index.js` in the `app/backend` sets up the app for development.

#### Notes

Admin panel is accessible at `/admin`. Only an user with `admin` type can access there. For that, an user's type must be manually changed in database from `normal` to `admin`

If the bot is not wanted, simply delete the `BomchessBot.js` file, also the `Bomchessbot()` line and the import within the `app/backend/index.js` file.<br>

## Regarding Building/Deployment

Considering google cloud project is setup and required technologies and libraries are installed and running as described in `Regarding Development` section,

The google project's OAuth Client ID credential that was created in development section must be changed;
- Remove localhost and add your real host to `Authorized JavaScript Origins` section. (ex: https://mySubDomain.myDomain.com)
- Remove localhost and add your real host to `Authorized redirect URIs` section. (ex: https://mySubDomain.myDomain.com/api/login-via-google)
- Download the credential's JSON file, rename it to `google_login.json` and update the one in `/app/backend`

Running `npm run build` in `app/front_end` creates the static files in the `app/_build/public` folder. <br>
- If changed in development, backend's and front end's ports must be changed accordingly in the `app/_build/.env` file.

In the `app/_build` folder, run `npm install` to install the libraries and then `node index.js` to serve the files.

Running `node index.js` in `app/backend` sets up the backend.

## Extra Notes

Resources used for implementing google auth (OAtuh 2.0);<br>
https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest#oauth2
