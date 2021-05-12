# website-backend

to run:
nodemon server.js


https://www.npmjs.com/package/sanitize-html

nextcloud for hosting file


for backend https://www.npmjs.com/package/helmet

to host server local truenas server


 npm cors https://www.npmjs.com/package/cors
npm dotenv  https://www.npmjs.com/package/dotenv

npm moment  https://www.npmjs.com/package/moment
npm ms https://www.npmjs.com/package/ms
npm jsonwebtoken https://www.npmjs.com/package/jsonwebtoken

Bcrypto for hashing passwords https://www.npmjs.com/package/bcrypt
mongoose and mongo db for database management

for secure uuid generation and tokens
nanoid https://www.npmjs.com/package/nanoid

mongoose sanitize for express https://www.npmjs.com/package/express-mongo-sanitize


amazon s3 storage with multer



.env file:

JWT_SECRET – Use it to create JWT access token and refresh token.
ACCESS_TOKEN_LIFE – Define the life of the access token so we can use it to set the expiry time of the access token. We have considered the 15 mins (15m).
REFRESH_TOKEN_LIFE – Same as the access token we will define the life of the refresh token. It should be longer than the access token so we have considered the 30 days (30d).
COOKIE_SECRET – We’ll use this secret key for cookie parsing as we discussed in the above topic.
NODE_ENV – It’s used to set the environment of the project.

To use all these variables, we have to add require('dotenv').config();









style guide:


naming:
Filename: all lowercase and only underscores ie: file_name
React Class: CamelCase upper

javascript variable naming:
class = CamelCase;
variable: lower camelCase;

javascript function names:
variable: lower camelCase;

url naming:
all lower case and only hyphens ie: url-something
for parameters use ?value, value corresponding paramter is given after symbol =, multiple paramters seperated by &

dataabse/form names:
all lowercase, underscores allowed.

database dates are stored as ISO 8601