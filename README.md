# This is a CRUD Web Application that has a developed filtering system

For the Full Stack Application, Angular was used to develop this Frontend while Express was used for the Backend.\
Odoo's System and Features was a large inspiration in the creation of this system.

Repository of the Express Backend for this application: https://github.com/Swasbuckler/filter-search-crud-server \
It will detail the features, database and packages used, which includes details of the PostgreSQL Database and Express Server.

The demo of this Frontend can be accessed here: https://swasbuckler.github.io/filter-search-crud-angular/ \
This demo mimics the functionalities of the Full Stack Application on your browser through the use of storing and manipulating data in localhost. Please do play around in the demo to view the functions of this project.

Repository of the Alternatively made React Frontend for this application: <i>Work in Progress</i>

I will return to working on this project at a later date, as I wish to focus my attention to other interested projects.

## What have I Achieved and Learnt through this Project

Through the development cycle of this project I have learnt a lot of key concepts related to Angular, Express and PostgreSQL.

For Angular specifically, I have gained a greater understand of it's Component Lifecycle, Directives and Pipes, which throughout the Development Process helped guide me to simplify the creation of certain Application Features. I hope to carry over this knowledge to future projects.

For Express, I have developed the Backend Server roughly using the Model-View-Controller (MVC) architecture. Although it is not exactly following MVC, it helped guided me in creating a file structure that helped in development clarity. Using this structure, in an environment where it was not neccessary taught me the significance of setting an architecture and how it helps in development. I hope to carry over this understanding when planning for future projects.

For PostgreSQL, this was the first time I had used and experienced managing a PostgreSQL database in a Personal Project. I have learnt a lot in terms of database communication with the backend server as well as the differences it has to MySQL. In the case where I have to use PostgreSQL for other projects in the future, I hope to used this gathered knowledge.

One of the major challenges I had faced in development was handling Project Scope and Requirements.\
Initially this Application was envisioned to be part of a larger Full Stack Application as I wanted to create an Inventory management Application. However due to the Project Timeframe I had given myself and the large number of Bugs encountered which expectedly lead to Delays. Thanks to this I had Restructured this project 3 times, cutting down the Project Scope and Requirements each time.\
With this experience, I now know how to better plan for future projects with a set Timeline even if the Project was a Personal Project that does not have strict guidelines.

In the end, I was able to develop a full stack application that was able to meet my satisfaction and final requirements.

### Included Features

1. C.R.U.D | Application includes all CRUD Actions 
2. Filtering System | Application includes customizable filters
3. PostgreSQL Database | Application includes Seeding, Dropping and Manipulating the Database

### Excluded Features

1. User Login | Was Out of Scope
2. Charts and Graphs | Was Out of Scope

## Packages Used for the Application

1. Angular v19 | For the Frontend Framework
2. Luxon | For Datetime management
3. Font Awesome | For UI Icons
4. Express | For the Backend Server
5. pg | For communication to PostgreSQL Database

## Main Features of the Application

Below showcases 3 of the main features of the Full Stack Application. The database was seeded with data related to seed Vendors for an imagined business.

### C.R.U.D

The Full Stack Application provides all of the basic CRUD actions on the data stored in the Database.

C - Create | The creation of a new Vendor.

<video src="https://github.com/user-attachments/assets/b209881c-b034-482f-820a-77e1ea59445c" />\

Video Example of Creating a new Vendor.

R - Read | Reading of Vendor Data and Grouping Functionality

<video src="https://github.com/user-attachments/assets/baf724e4-27ca-4467-8f0e-d777ac3aba51" >\

Video Example of presenting data from the database to the User.

U - Update | The update of an existing Vendor's data.

<video src="https://github.com/user-attachments/assets/e38f9f6d-ec26-42d8-a128-cdc7a5521ac2" >\

Video Example of Updating an existing Vendor.

D - Delete | The deletion of an existing Vendor.

<video src="https://github.com/user-attachments/assets/43819ef2-6b3a-4d69-bd84-9525919588f6" >\

Video Example of Deleting an existing Vendor.

### Filtering System

The filtering system included allows the user to create custom filter rules and group them accordingly.\
Below includes an image and video of how a user would implement the rules viewed in the image in the Application.

<img src="git_images/filter diagram.jpg" height="300px" />\
The image of the filter rules in a form of a tree.

<video src="https://github.com/user-attachments/assets/38197781-1d64-42a5-b987-c965bc416d2f" >\

Video Example of a User creating the Filter.

## Additional Features of the Frontend

Below showcases the other features of the Frontend.

### Search Bar

The application provides a search bar where specific Filter Rules can be quickly added.

<video src="https://github.com/user-attachments/assets/0bd41b94-07ac-44f4-b3ef-64dda05830f5" >\

Video Example of using the Search Bar.

### Pagination

The application provides pagination to allow the user to go through set number / rows of the data at a time. 

<video src="https://github.com/user-attachments/assets/439194b1-af77-42f8-b723-fb8698bd1e3e" >\

Video Example of using the Pagination Function.

### PostgreSQL Database

The database was seeded with data related to seed Vendors for an imagined business.\
There is a singular database with 2 Tables. One for holding the Types of Vendors and the other to hold all of the data of the Vendors.

<img src="git_images/vendor_types_details.png" height="100px" />\
The image of the "vendor types" table.

<img src="git_images/vendors_details.png" height="300px" />\
The image of the "vendors" table.