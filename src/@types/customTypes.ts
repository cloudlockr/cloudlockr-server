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
    message?: string;
  };
};
