import 'passport';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import userservice, { OAuthProvider } from '../api/services/user.service';
import passport from 'passport';
import L from '../common/logger'
import { toProfile } from '../api/models/user';
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2';


const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_KEY,
};

const strategy = new JwtStrategy(jwtOptions, async function (jwtPayload: any, next) {
  L.debug('payload received', jwtPayload);
  // usually this would be a database call:
  const user = await userservice.findById(jwtPayload.id);
  if (user) {
    next(null, toProfile(user));
  } else {
    next(null, false);
  }

});

passport.use(strategy);

const keycloakStrategy = new OAuth2Strategy({
  authorizationURL: process.env.OAUTH_AUTH_URL,
  tokenURL: process.env.OAUTH_TOKEN_URL,
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_CALLBACK_URL,
  scope: 'profile email',
}, async (accessToken: string, refreshToken: string, profile: any, verified: VerifyCallback) => {
  try {
    const user = await userservice.findOrCreate(OAuthProvider.Keycloak, profile);
    verified(null, user);
  } catch (err) {
    verified(err);
  }
});

keycloakStrategy.userProfile = function (accessToken: string, done: (err: any, profile?: any) => void) {
  // https://github.com/jaredhanson/passport-oauth2/issues/121
  // choose your own adventure, or use the Strategy's oauth client
  this._oauth2._request("GET", process.env.OAUTH_USERINFO_URL, { Authorization: 'Bearer ' + accessToken }, null, null /*accessToken*/, (err: any, data: any) => {
    if (err) { return done(err); }
    try {
      data = JSON.parse(data);
    }
    catch (e) {
      return done(e);
    }
    done(null, data);
  });
}

passport.use(keycloakStrategy);
