import 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import userservice from '../api/services/user.service';
import passport from 'passport';
import L from '../common/logger'
import { toProfile } from '../api/models/user';


const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_KEY,
};

const strategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
  L.debug('payload received', jwt_payload);
  // usually this would be a database call:
  const user = await userservice.findById(jwt_payload.id);
  if (user) {
    next(null, toProfile(user));
  } else {
    next(null, false);
  }

});

passport.use(strategy);


// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
  function (accessToken, refreshToken, profile, done) {
    userservice.findOrCreate(profile, function (err, user) {
      return done(err, user);
    });
  }
));
