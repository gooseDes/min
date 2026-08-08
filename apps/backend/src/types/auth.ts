export interface TokenPayload {
  id: number;
  name: string;
  email: string;
}

export interface SocketUser extends TokenPayload {
  avatar: string;
}
