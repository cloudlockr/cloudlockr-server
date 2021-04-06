# CloudLockr — TypeScript Express.js Server

CloudLockr is an innovative data storage system. This repo contains the backend server code, 
which accepts requests from both the React Native application and the DE1 firmware to
facilitates user authentication, file management, and database CRUD operations.

### Main Technologies

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- TypeORM
- Redis
- Jest

---
## Execution Details

### Running Server Locally
1. Clone this repository and cd into it
2. Create a `.env` file in directory which contains `package.json` and fill in the following fields
  - `NODE_ENV={server state, probably "dev"}`
  - `PORT={desired server port}`
  - `DB_URL={URL of dockerized postgres development database, port must be 5433 to match docker-compose.yml}`
  - `DB_AUTH_TEST_URL={URL of dockerized postgres integration test database 0, expect to be similar to DB_URL except database name is different}`
  - `DB_FILE_TEST_URL={URL of dockerized postgres integration test database 1, expect to be similar to DB_URL except database name is different}`
  - `REDIS_PORT=6000`
  - `TOKEN_SECRET={your access token secret}`
  - `REFRESH_SECRET={your refresh token secret}`
3. Create a `database.env` file in the same directory and fill in the following fields such that they match the `.env DB_URL` field
  - `POSTGRES_USER={matching username as DB_URL}`
  - `POSTGRES_PASSWORD={matching password as DB_URL}`
  - `POSTGRES_DB={matching database as DB_URL}`
4. Run `docker-compose -f docker-compose.yml up -d`
5. Run `yarn install`
6. Run `yarn build && yarn start`
  - The server should now be started, please refer to [API Documentation](#api-documentation) for instructions on how to call server API endpoints

### Running Tests
1. Create the 2 dockerized PostgreSQL test databases, matching `DB_AUTH_TEST_URL` and `DB_FILE_TEST_URL`
2. Run `yarn test`
  - Or run `yarn test --coverage` to see test coverage, should be 100% statement and branch coverage except for `src/index.ts` and `src/config/*.ts`, as these are configuration files for the server, and the test files have their own configuration

---
## API Documentation

### User
Note: The server port will be the `PORT` you chose in `.env`, the following documentation assumes port 5000
- `POST http://localhost:5000/user/register`
  - Creates a new user account
  - **Request requirements**:
    - Header:
      - `email`: Email the user wants to register with, must not be used for another account already
      - `password`: Desired password, must be at least 10 characters long
      - `password1`: Confirmation password, must match `password`
  - **Response**:
    - Success: 
      - Status code: `201`
      - Body:
        - `userId`: ID associated with the newly created account
        - `accessToken`: Authorization token that must be sent in the request header for some API endpoints
        - `refreshToken`: Token that can be sent to the `refresh` API endpoint to acquire a new access token
        - `token_type`: Authorization token type, should be "bearer"
        - `expires`: Number of seconds until access token expires
        - `message`: A success message
    - Fail:
      - Status code: `422`
      - Body: List of errors if any of the request requirements are violated
- `POST http://localhost:5000/user/login`
  - Logs in a user
  - **Request requirements**:
    - Header:
      - `email`: Email of the user, must be associated with an account
      - `password`: Password of the user, must be the same as the password used to register for the account
  - **Response**:
    - Success:
      - Status code: `200`
      - Body: Exactly the same as `register` endpoint
    - Fail:
      - Status code: `422`
      - Body: List of errors if any of the request requirements are violated
- `POST http://localhost:5000/user/logout`
  - Logs out a user
  - Requires authorized permission 
  - **Request requirements**:
    - Header:
      - `authorization`: `{token_type} {accessToken}` (from the response body of `register`, `login`, or `refresh`)
      - `refreshtoken`: `{refreshToken}` (from the response body of `register` or `login`)
  - **Response**:
    - Success:
      - Status code: `200`
      - Body: Success message
    - Fail:
      - Status code:
        - `401`: If no `authorization` header
        - `403`: If access token in `authorization` header is invalid/expired/malformed/forged
        - `422`: If no `refreshtoken` header
      - Body: List of errors if any of the request requirements are violated
- `POST http://localhost:5000/user/refresh`
  - Grants a new access token
  - **Request requirements**:
    - Header:
      - `refreshtoken`: `{refreshToken}` (from response body of `register` or `login`)
      - `userid`: `{userId}` (from response body of `register` or `login`). Must match the user ID associated with the refresh token
  - **Response**:
    - Success:
      - Status code: `200`
      - Body: 
        - `accessToken`: Authorization token that must be sent in the request header for some API endpoints
        - `token_type`: Authorization token type, should be "bearer"
        - `expires`: Number of seconds until access token expires
        - `message`: A success message
    - Fail:
      - Status code:
        - `401`: If any required headers are missing
        - `403`: If refresh token is invalid/expired/malformed/forged
      - Body: List of errors if any of the request requirements are violated
- `DELETE http://localhost:5000/user`
  - Deletes a user and all files owned by user
  - Requires authorized permission
  - **Request requirements**:
    - Header:
      - `authorization`: `{token_type} {accessToken}` (from the response body of `register`, `login`, or `refresh`)
      - `refreshtoken`: `{refreshToken}` (from the response body of `register` or `login`)
  - **Response**:
    - Success:
      - Status code: `200`
      - Body: Success message
    - Fail:
      - Status code:
        - `401`: If no `authorization` header
        - `403`: If access token in `authorization` header is invalid/expired/malformed/forged
        - `422`: If no `refreshtoken` header
      - Body: List of errors if any of the request requirements are violated
- `GET http://localhost:5000/user/files`
  - Retrieves the metadata of the files owned by a user
  - Requires authorized permission
  - **Request requirements**:
    - Header:
      - `authorization`: `{token_type} {accessToken}` (from the response body of `register`, `login`, or `refresh`)
  - **Response**:
    - Success:
      - Status code: `200`
      - Body:
        - `filesMetadata`: Array of files (just the metadata) that the user owns
        - `message`: A success message
    - Fail:
      - Status code:
        - `401`: If any required headers are missing
        - `403`: If refresh token is invalid/expired/malformed/forged
        - `422`: If no user is associated with the access token. Possible if user deletes account while getting files
      - Body: List of errors if any of the request requirements are violated

### File
- `POST http://localhost:5000/file`
  - Creates the base metadata for a new file
  - Requires authorized permission
  - **Request requirements**:
    - Header:
      - `authorization`: `{token_type} {accessToken}` (from the response body of `register`, `login`, or `refresh`)
    - Body:
      - `fileName`: Name of the file
      - `fileType`: Extension of the file
  - **Response**:
    - Success:
      - Status code: `200`
      - Body:
        - `fileId`: ID associated with newly created file
        - `fileName`: Name of the file
        - `fileType`: Extension of the file
    - Fail:
      - Status code:
        - `401`: If no `authorization` header
        - `403`: If access token in `authorization` header is invalid/expired/malformed/forged
        - `404`: If any of the required request body fields are missing, or if no user is associated with the access token. Possible if user deletes account while creating file
      - Body: List of errors if any of the request requirements are violated
- `POST http://localhost:5000/file/{fileId}/{blobNumber}`
  - Stores a new blob of data associated with the fileId for the given blobNumber
  - **Request requirements**:
    - Query parameter:
      - `fileId`: Must be a valid UUID, and must be associated with a file in the database
      - `blobNumber`: The index of the file blob to retrieve file data from, must be a valid index to the blob array (not negative and not too big)
    - Body:
      - `fileData`: The file data to be stored in the blob
  - **Response**:
    - Success:
      - Status code: `200`
      - Body: Success message
    - Fail:
      - Status code: `404`: If `fileId` is not valid UUID, or if `fileId` is not assocated with a file in the database, or if `blobNumber` is invalid (negative or too large)
      - Body: List of errors if any of the request requirements are violated
- `GET http://localhost:5000/file/{fileId}`
  - Retrieves the base metadata of a file
  - **Request requirements**:
    - Query parameter:
      - `fileId`: Must be a valid UUID, and must be associated with a file in the database
  - **Response**:
    - Success:
      - Status code: `200`
      - Body: 
        - `numBlobs`: Number of total file blobs
    - Fail:
      - Status code: `404`: If `fileId` is not valid UUID, or if `fileId` is not assocated with a file in the database
- `GET http://localhost:5000/file/{fileId}/{blobNumber}`
  - Retrieves a blob of data associated with the fileId for the given blobNumber
  - **Request requirements**:
    - Query parameter:
      - `fileId`: Must be a valid UUID, and must be associated with a file in the database
      - `blobNumber`: The index of the file blob to retrieve file data from, must be a valid index to the blob array (not negative and not too big)
  - **Response**:
    - Success:
      - Status code: `200`
      - Body: 
        - `fileData`: The file data associated with the `fileId` and `blobNumber`
    - Fail:
      - Status code: `404`: If `fileId` is not valid UUID, or if `fileId` is not assocated with a file in the database, or if `blobNumber` is invalid (negative or too large)
      - Body: List of errors if any of the request requirements are violated
- `DELETE http://localhost:5000/file/{fileId}`
  - Deletes a file
  - Requires authorized permission
  - **Request requirements**:
    - Header:
      - `authorization`: `{token_type} {accessToken}` (from the response body of `register`, `login`, or `refresh`)
    - Query parameter:
      - `fileId`: Must be a valid UUID
  - **Response**:
    - Success:
      - Status code: `200`
      - Body: Success message
    - Fail:
      - Status code: 
        - `401`: If no `authorization` header
        - `403`: If access token in `authorization` header is invalid/expired/malformed/forged
        - `404`: If `fileId` is not valid UUID
      - Body: List of errors if any of the request requirements are violated
