# Wuzzler

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.2.2.

## How to start the project on different computer

1) Clone the project into an empty folder

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

15) Go into folder "client" and run "npm run dev" in terminal to start the server. The app will automatically navigate to your localhost website. 

## Development server

Run `npm run dev` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

