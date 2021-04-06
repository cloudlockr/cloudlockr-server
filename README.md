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

### Running Tests

---
## API Documentation

### User
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
  - **Request requirements**:
    - Header:
      - `authorization`: `{token_type} {accessToken}` (from the response body of `register`, `login`, or `refresh`)
    - Body:
      - `fileName`: The name of the file
      - `fileType`: The extension of the file
  - **Response**:
    - Success:
    - Fail:
- `POST http://localhost:5000/file/{fileId}/{blobNumber}`
  - Stores a new blob of data associated with the fileId for the given blobNumber
  - **Request requirements**:
    - Header:
  - **Response**:
    - Success:
    - Fail:
- `GET http://localhost:5000/file/{fileId}`
  - Retrieves the base metadata of a file
  - **Request requirements**:
    - Header:
  - **Response**:
    - Success:
    - Fail:
- `GET http://localhost:5000/file/{fileId}/{blobNumber}`
  - Retrieves a blob of data associated with the fileId for the given blobNumber
  - **Request requirements**:
    - Header:
  - **Response**:
    - Success:
    - Fail:
- `DELETE http://localhost:5000/file/{fileId}`
  - Deletes a file
  - **Request requirements**:
    - Header:
  - **Response**:
    - Success:
    - Fail:
