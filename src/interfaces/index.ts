import { JwtPayload } from "jsonwebtoken";


export interface UserJwtPayload extends JwtPayload {
    _id: string
}
export * from "./Comment";
export * from "./User";
export * from "./Post";