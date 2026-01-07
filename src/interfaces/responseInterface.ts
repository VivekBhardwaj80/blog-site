export interface IResponse {
  success: boolean;
  message: string;
  data: any | null;
  error?:string|null
}
