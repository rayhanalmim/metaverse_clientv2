export interface ResponseData<T> {
  message: string;
  data: T;
  statusCode: number;
  result?: T;
}
