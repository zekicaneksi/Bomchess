# The Journey

## How It All Started

To put on my portfolio, i wanted to make a web application that would show my understanding of basics. I didn't want to do neither heavy backend nor heavy front end app. But not easy either. I kept thinking and came to the conclusion that a fully functional chess site would be best.

I also wanted to document every step of the process from start to end. As of this moment, i have a notepad open and writing this and listening to Haul Away Joe by Topgallant Jack have nothing else. I will update this readme file as i progress.


## My Plan

So far, my plan goes like this;
- Decide for a name for the site, so i can open a github repository xd
- Decide what functionalities the web site will have.
- Design the web site on Figma.
- Decide which technologies i will use for the project.
- Research about how i'm gonna implement the required functionalities with the technologies i'm gonna use.
- Make a plan of building, so that i can build the site step by step and test whatever i built.
- Build

## The Name

I decided to call it Bomchess for no particular reason.

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

## The Design

So, i was planning to design the site to the fullest. BUT, i'm just really really bad at designing and it discourages me. So, i decided to just make the wireframe design so that i can see where and how i'm going to implement features. And once the app is finished including both front end and back end, i'll edit the front end to look better. And i think this approach is even better since the front end code won't bloat from all the styling stuff. My concern is though, changing stuff's places so that i'll have to refactor something. I guess we'll see...

Here's the wireframe design; (Figma file and pdf of frames are also in repo)

/Sign|/|/\<userName>(Users own page)
:-:|:-:|:-:
<img src="https://user-images.githubusercontent.com/59491631/175370379-a4e87480-0078-4372-8d87-0145728d5d27.png" style="display:inline; width:300px; height:300px;">  |  <img src="https://user-images.githubusercontent.com/59491631/175371130-1807fbc4-5fb0-4c08-b259-327520f809fe.png" style="display:inline; width:300px; height:300px;"> |   <img src="https://user-images.githubusercontent.com/59491631/175374065-9a0bafa2-2516-404c-8448-a6fa2cce7404.png" style="display:inline; width:300px; height:300px;"> 

/\<userName>(Other's page) | /admin | /PvP
:-:|:-:|:-:
<img src="https://user-images.githubusercontent.com/59491631/175374357-6915d22e-d7ee-4c49-9874-36a1babb4ae6.png" style="display:inline; width:300px; height:300px;"> | <img src="https://user-images.githubusercontent.com/59491631/175374815-ff8c8f6a-49c3-44e5-b4bf-fd22eab85716.png" style="display:inline; width:300px; height:300px;"> | <img src="https://user-images.githubusercontent.com/59491631/175375151-a06bd5dc-8018-4e14-b5d4-771e615af8d7.png" style="display:inline; width:300px; height:300px;">
  
/replay?id=<...>
:-:
  <img src="https://user-images.githubusercontent.com/59491631/175375402-00b46374-88fc-4b90-8915-ae4c12b96a6d.png" style="display:inline; width:300px; height:300px;">
  
  
## Technologies and Implementation

According to my plan, "technologies" and "implementation" were supposed to be two different steps. But as i was looking for which technologies to use, i realized that implementation affected my choose use of technology. So i just combined two steps. And the result is;

- Front end
  - React
    - create-react-app (yes, the app will be a SPA)
    - react-router-dom@6 (for routing)
- Backend
  - Nodejs
    - express (routing, serving, etc.)
    - mongoose (to access MongoDB and ODB)
    - jsonwebtoken (for JWT tokens (authentication))
    - dotenv (environment variables)
    - bcryptjs (to hash passwords)
    - ws (WebSocket library)
- Database
  - MongoDB

For the front end, the reason why i chose React is because it has a cool logo and is hip. Also, since i want the app to be a SPA, i'm just going to go with 'create-react-app'.

For the backend, i wanted to use Nodejs because it was also hip and also because i've used it before. Thought of using Next.js but didn't find it neccessary.

The reason i chose MongoDB as the database was because when i'm done with the project, i want to deploy to an EC2 (t2.micro) amazon vpc machine which has a 1 GB of RAM. SQL Server requires minimum of 2 GB and MySQL requires minimum of 4 GB. And i don't want to increase the RAM capacity since that'd cost me money. So, even though i wanted to use one of these, i had to go with MongoDB. I could use a cloud database like Atlas, Firebase, etc. But i wanted a local server because i didn't want to deal with pricing, authentication, etc.

If i switch, add, or remove a library / tecnology etc. I won't edit what i wrote in this section so it stays as i planned. And we'll see how well i've planned in the future.

I've never used MongoDB or React before. So, today, i finished tutorials on both of them using their offical docs and got the basic knowledge.

