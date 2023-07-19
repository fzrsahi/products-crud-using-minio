export interface Response {
  statusCode: number;
  message: string;
  data?: string[] | Object;
}

export interface ResponseWithToken extends Response {
  token: string;
}
