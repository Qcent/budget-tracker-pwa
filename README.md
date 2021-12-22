
# Budget Tracker PWA
 
 ![MIT](https://img.shields.io/badge/License-MIT-orange)  ![Node.js](https://img.shields.io/badge/Tech-Node.js-lightblue)  ![Express.js](https://img.shields.io/badge/Tech-Express.js-lightblue)  ![MongoDB](https://img.shields.io/badge/Tech-MongoDB-lightblue)  ![Mongoose](https://img.shields.io/badge/Tech-Mongoose-lightblue)  ![Heroku](https://img.shields.io/badge/Tech-Heroku-lightblue)  ![Webpack](https://img.shields.io/badge/Tech-Webpack-lightblue)  ![PWA](https://img.shields.io/badge/Tech-PWA-lightblue) 

## Description
Create a budget, add expenses and deposits. Fully functional offline but backed up by a cloud database when connected.  

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
2. On line 7 of the server.js file edit the uri string or set the MONGODB_URI environment variable as required to connect to your MongoDB server.  
 ```7 |     const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/budget"; ```  
3. That's it! You're good to start the server.

## Usage

Once the project has been installed and configured as outlined above, you can run the server by typing node server.js or npm start. Then navigate to your server's URL and start adding Deposits and withdrawls to your budget! 

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
                 

     