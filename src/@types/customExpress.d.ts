interface ITokenPayload {
  id: number;
}

declare namespace Express {
  export interface Request {
    tokenPayload?: ITokenPayload;
  }
}
