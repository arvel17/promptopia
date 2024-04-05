import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import User from '@models/user';
import { connectToDB } from '@utils/database';

//google authentication
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    //mengatur session user setelah berhasil login
    async session({ session }) {
      //cari user dengan alamat email yg sesuai
      const sessionUser = await User.findOne({
        email: session.user.email,
      });

      //add id ke session sesuai id di db
      session.user.id = sessionUser._id.toString();
      return session;
    },
    async signIn({ profile }) {
      try {
        await connectToDB();
        //check if user already exist
        const userExist = await User.findOne({ email: profile.email });
        //if not, create a new user
        if (!userExist) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(/ /g, '').toLowerCase(),
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});
//handler menghandle GET dan POST
export { handler as GET, handler as POST };
