export interface Response {
  success: boolean;
  statusCode: number;
  message: string;
  data?: string[] | Object;
}
