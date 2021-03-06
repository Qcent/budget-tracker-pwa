
# Budget Tracker PWA
 
 ![MIT](https://img.shields.io/badge/License-MIT-orange)  ![HTML](https://img.shields.io/badge/Tech-HTML-lightblue)  ![CSS](https://img.shields.io/badge/Tech-CSS-lightblue)  ![Bootstrap](https://img.shields.io/badge/Tech-Bootstrap-lightblue)  ![JavaScript](https://img.shields.io/badge/Tech-JavaScript-lightblue)  ![jQuery](https://img.shields.io/badge/Tech-jQuery-lightblue)  ![Node.js](https://img.shields.io/badge/Tech-Node.js-lightblue)  ![Express.js](https://img.shields.io/badge/Tech-Express.js-lightblue)  ![MongoDB](https://img.shields.io/badge/Tech-MongoDB-lightblue)  ![Mongoose](https://img.shields.io/badge/Tech-Mongoose-lightblue)  ![Heroku](https://img.shields.io/badge/Tech-Heroku-lightblue)  ![PWA](https://img.shields.io/badge/Tech-PWA-lightblue)  ![express%20session](https://img.shields.io/badge/Tech-express%20session-lightblue)  ![connect%20mongo](https://img.shields.io/badge/Tech-connect%20mongo-lightblue)  ![bcrypt](https://img.shields.io/badge/Tech-bcrypt-lightblue)  ![morgan](https://img.shields.io/badge/Tech-morgan-lightblue)  ![cookie%20parser](https://img.shields.io/badge/Tech-cookie%20parser-lightblue)  ![Chart.js](https://img.shields.io/badge/Tech-Chart.js-lightblue) 



## Description
Create a user, create a budget, add expenses and deposits. Fully functional offline but backed up by a cloud database when connected.  

Screenshot
![App Screenshot](./assets/screenshots/app-screenshot-1.png)

Live Demo
https://qcent-budget-tracker.herokuapp.com/

## Table of Contents

* [Description](#description)
* [Table of Contents](#table-of-contents)
* [Installation](#installation)
* [Usage](#usage)
* [Contributing](#contributing)
* [Questions](#questions)
* [License](#license)

## Installation

This project requires that Node.js be installed on the target machine and that the user has write access to a MongoDB server.  
1. Copy the repository files and then run npm install to install all required dependencies.  
2. On line 13 of the `server.js` file edit the uri string or set the `MONGODB_URI` environment variable as required to connect to your MongoDB server.  
 ```
 13 |     const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/budget"; 
 ```  
3. For a little extra security set an environment variable `DB_SECRET` to a string that no one is likely to guess, or at least change the string on line 14 of `server.js` and don't post your change on GitHub.
4. You're now ready to start the server with `node server.js`. But, to enable a public budget, for users who don't want to login, you'll need to...
5. Create a user in the database and copy the `_id` associated with that user to line 15 of `server.js`. Or alternatively set the `_id` as the `GLOBAL_UserId` environment variable.

## Usage

Once the project has been installed and configured as outlined above, you can run the server by typing `node server.js` or `npm start`. Then navigate to your server's URL and start budgeting!

If the server has been configured to have a global user you can get straight to creating transactions and submitting them as either deposits or withdrawals. \
![App Screenshot](./assets/screenshots/app-screenshot-2.png)

Transactions can be removed by double clicking on them and then clicking on the trash can icon. \
![App Screenshot](./assets/screenshots/app-screenshot-3.png)

All of these transactions however will be part of the public record and could be viewed or altered by anyone with access to the server.

So why not create a private budget by signing up for your very own user account? It's as easy as entering a username, email address and a password. \
![App Screenshot](./assets/screenshots/app-screenshot-4.png)

Now you'll have your own private budget accessible only by those with the login credentials to access it. And enjoy all the perks of being a registered user... The functionality to reset your budget with one click. Or just straight up remove your account! \
![App Screenshot](./assets/screenshots/app-screenshot-5.png)

## Contributing

Any contributions are welcome. Just fork the project, test any code you add and request a merge! 

## Questions

[GitHub: Qcent](https://github.com/Qcent)  
dquinn8@cogeco.ca

   
## License

MIT License

Copyright (c) 2021 Dave Quinn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
