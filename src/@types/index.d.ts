/**
 * This module modifies the default types of built-in or third party modules.
 *
 * IncomingHttpHeaders: Fields along with their types are added to the HTTP request headers,
 *  so there is proper intellisense and static type safety when these fields are accessed in
 *  the project.
 */
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
