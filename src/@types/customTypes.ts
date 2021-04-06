/**
 * This module defines the types which are used throughout the project.
 *
 * payloadType: Defines the fields contained within both the access and refresh
 *  JSON Web Tokens (JWT).
 *
 * returnType: Defines the return type of service methods within "auth.ts" and "file.ts".
 */

type payloadType = {
  id: string;
  iat: number;
  exp: number;
};

type returnType = {
  code: number;
  body: {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    token_type?: string;
    expires?: number;
    filesMetadata?: Array<any>;
    message?: string;
  };
};
