import { JwtPayload } from "jsonwebtoken";


export interface UserJwtPayload extends JwtPayload {
    _id: string
}
