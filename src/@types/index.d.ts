import "http";

declare module "http" {
  interface IncomingHttpHeaders {
    email?: string;
    password?: string;
    password1?: string;
    userid?: string;
    refreshtoken?: string;
  }
}
