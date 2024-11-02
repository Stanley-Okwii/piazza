import { model, Schema, Document } from 'mongoose';


export const PostSchema: Schema = new Schema({
    user:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    hashtag:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
});

export const Post = model<Document>('Post', PostSchema);

// module.exports = mongoose.model('posts',PostSchema);

// export interface User {
//     _id: string;
//     email: string;
//     password: string;
//   }


// import { model, Schema, Document } from 'mongoose';
// // import { User } from '@interfaces/users.interface';


// const userSchema: Schema = new Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
// });

// const userModel = model<User & Document>('User', userSchema);

// export default userModel;
