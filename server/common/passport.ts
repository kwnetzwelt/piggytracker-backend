import 'passport';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import userservice from '../api/services/user.service';
import passport from 'passport';
import L from '../common/logger'
import { toProfile } from '../api/models/user';


const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.PWD_SALT,
};

var strategy = new JwtStrategy(jwtOptions, async function (jwt_payload, next) {
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
