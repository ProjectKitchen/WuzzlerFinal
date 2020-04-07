# Wuzzler for FHTW Mensa


The Smart Wuzzler is an augmented Tabletop-Soccer Game for the student restaurant of the University of Applied Sciences Technikum Wien. 
It features automatic goal counts, game session management via smart phone user login, audio-visual feedback of game progress and a high score list.
Users can register and login via smartphone - the game logic runs on a RaspberryPi4 which also provides a WiFi Hotspot.

## Credits

This project is based upon the work by [Alexander Peters](https://github.com/ProjectKitchen/TabletopSoccer/tree/master/documentation) who had the initial idea and made the first implementation in 2017, and [Ferdinand Unger](https://github.com/FerdinandUnger/WuzzlerFinal) who ported the project to a recent version of node.js and Angular.js.

## Architecture and tools

The Tabletop-Soccer game implementation consists of 3 parts, which are built using node.js (Version 12.13.1). 
The backend (server) connects to a Postgres database to store user and game session data. 
The graphical frontends (client and display) use and [Angular CLI](https://github.com/angular/angular-cli) version 8.2.2. 

* The Backend: connects to the database and to the low level hardware (via Cylon/Firmata, expects an Arduino with Firmata firmware running at port /dev/ttyUSB0). The GPIO pin connections for goal detection and pushbuttons can be found in file "robot.js". The backend detects goals and user interaction and updates the game state for client and display accordingly. 
* The Client: offers a responsive user interface in the web browser in order to create a new user, login, as well as challenge your friends into a 1 vs. 1 at tabletop soccer. The available players are displayed and can be challenged. 
* The Display: shows the progress of ongoing games and the high score list on a TV that is mounted behind the soccer table. 


## Installation and build procedure

1) Clone the git repository

1) Navigate to "client" folder and run "npm install" in terminal

2) Navigate to "display" folder and run "npm install" in terminal

3) Navigate to "backend" folder and run "npm install" in terminal

5) Create the database 

* Download and install the newest version of PostgreSQL. 

* Run following commands to create the database user and the wuzzler_db database, using the postgres tool:  

   ```
   sudo su postgres  
   createuser pi -P -s  (then input and confirm password 'raspberry')  
   createdb wuzzler_db  
   psql wuzzler_db -f wuzzler_db_9.1.sql  
   ```

* exit the postgres tool

* Optional: you can use the pgAdmin tool to graphically manage the database (see e.g. [here] (https://www.guru99.com/postgresql-create-database.html) for details)

6) Open the file "db.js" with a text editor. In line 8: Change "Password" to the database-related password you chose. 

7) Navigate to "client" folder and run "npm run dev" in terminal to start the server. All three apps will start automatically. Client and display should open in a webbrowser and the backend should connect to the database. The client is served from `http://localhost:4200/`
