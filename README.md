# Personal Website Backend

## Project Description
This project is to develop my personal website's backend to serve APIs to the frontend. This is a NodeJS ExpressJS backend server with a MongoDB database. The backend APIs use a variety of techonologies such as AWS S3 and AWS CloudFront to serve images, upload and store files. It also uses nodemailer and EJS for email purposes.

## Technologies
The backend uses the following frameworks and technologies:
- [ExpressJS](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [AWS S3](https://material-ui.com/)
- [AWS CloudFront](https://fontawesome.com/)
- [NodeJS](https://lodash.com/)
- [Recaptcha](https://www.google.com/recaptcha/about/)
- [MomentJS](https://momentjs.com/)
- [axios](https://www.axios.com/)
- [NodeMailer](https://nodemailer.com/about/)
- [EJS](https://ejs.co/)

## NPM Packages
This application uses the following npm packages:

### ExpressJS
- express
- body-parser
- cookie-paser
- cors
- dotenv
- node-fetch

### MongoDB
- mongodb
- mongoose
- express-mongo-sanitize

### AWS 
- aws-sdk
- multer

### GoogleAPIS:
- googleapis

### Authentication and Security
- jsonwebtoken
- helmet
- bcrypt
- nanoid
- moment
- ms

### Email:
- nodemailer
- ejs

### Utilities:
- lodash

## Requirements
This project is not meant to be used outside of my personal use without the environmental variable file.

## How to Run the project
1. Clone the project to your local directory:

2. install all npm packages
``` 
    $ npm install
```
3.  To run the project in development mode with auto restart:
``` 
    $ npm run dev_start
```
3.  To run the project:
``` 
    $ npm run start
```

## To refresh email testing
1. Go to Oauth Playground
2. Find the cog button at top right.
3. Check the Use your own OAuth Credentials and enter them.
4. Under the Step 1 Select & Authorize API, find "Gmail API v1" and select https://mail.google.com/
5. Click on authorize APIs
6. If any pages that follows to allow google oauth 2.0 playground to your gmail account allow
7. After being redirected back to the OAuth 2.0 Playground,
click the Exchange authorization code for tokens button under the Exchange authorization code for tokens section.
8. Once refresh and token is generated copy the data and save it into your .env file.
[guide](https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a)
