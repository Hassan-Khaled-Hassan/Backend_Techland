// /* eslint-disable import/no-extraneous-dependencies */
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const UserModel = require("../Models/UserModel");

// // Configure Passport Google Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:8000/api/v1/Auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         console.log("Google Profile:", profile);

//         // Just pass the profile data to the callback
//         done(null, profile);
//       } catch (err) {
//         console.error("Error during Google OAuth callback:", err);
//         done(err, false);
//       }
//     }
//   )
// );

// // Serialize user to session
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // Deserialize user from session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await UserModel.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// module.exports = passport;



const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserModel = require("../Models/UserModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:8000/api/v1/Auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // let user = await UserModel.findOne({ googleId: profile.id });

        // if (!user) {
        //   user = new UserModel({
        //     name: profile.displayName,
        //     email: profile.emails[0].value,
        //     googleId: profile.id,
        //     profileImage: profile.photos[0].value,
        //   });
        //   await user.save();
        // }
       console.log("Google Profile:", profile);
        done(null, profile);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
