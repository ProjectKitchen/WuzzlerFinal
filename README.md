# Wuzzler

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.2.2.

## Generally

In general we can split the Wuzzler app into three different apps. Every app has it's own task but it is necessary that all three are working, otherwise you would not be able to play correctly. 

First of all there is the client which is a user interface to create a new user as well as challenge your friends into a 1 vs. 1 at tabletop soccer. If you wanna challenge your friends you have to create your own user and login. After that you are able to see all players which are available and logged in as well. 

The next app we are going to talk is called display. The display app shows the current result of the two players which are playing tabletop soccer at the time on a TV that is also included in the cafetaria. As well as the result that is shown, after a game finished you are able to see a high-score list of all users that played tabletop soccer after logging in. 

Last but not least there is the backend. The backend is responsible for all things that happens in background. Saving data from a user or a game as well as communicating with the database. The backend is also responsible for communicating with the Arduino which is necessary because the Arduino can tell if someone scored a goal or is pressing a button on the table. 


## How to install the project on another computer

1) Clone the git project into an empty folder

2) Navigate into "backend" folder and run "npm install" in terminal

3) Navigate into "display" folder and run "npm install" in terminal

4) Navigate into "client" folder and run "npm install" in terminal

5) Download the newest Version of PostgreSQL. 

6) Create a Database called "wuzzler_db". If you don't know how to start a Database in PostgreSQL. Follow the steps in this link. https://www.guru99.com/postgresql-create-database.html

7) Open the App pgAdmin. Enter a password YOU choose. 

8) Open the Database you already made. 

9) Enter another Database related password.

10) Press right click on your Database and CREATE Script. 

11) Delete everything what is inside the script and start to install all scripts from file "wuzzlerFinal/backend/wuzzler_db.sql"

12) Create only one table after another e.g.: CREATE TABLE users(); and press "lightning" button in the menu bar.

13) After creating all tables from the "wuzzler_db.sql" file, open file "wuzzlerFinal/backend/db.js".

14) In row 8: Change "Password" to the database related password you chose. 

15) Go into folder "client" and run "npm run dev" in terminal to start the server.

16) "Npm run dev" leads to that all three apps will start automatically. The Client and Display will open in a Webbrowser and the Backend will start the server and connect to the database.  

## Development server

Run `npm run dev` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

