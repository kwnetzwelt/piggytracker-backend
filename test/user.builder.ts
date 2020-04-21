import { TestRandom } from "./test.random";
import { IUserModel, hashPassword, User } from "../server/api/models/user";

export class UserBuilder {
    private _username = TestRandom.randomString(12, 'usr-');
    private _fullname = TestRandom.randomString(24, 'f-');
    private _password = TestRandom.randomString(6, 'pw-');

    public static with() {
        return new UserBuilder();
    }

    public static default(passwordSetter?: (password: string) => void) {
        return UserBuilder.with().build(passwordSetter);
    }

    public build(passwordSetter?: (password: string) => void): IUserModel {
        if (passwordSetter) {
            passwordSetter(this._password);
        }
        return new User({
            username: this._username,
            fullname: this._fullname,
            password: hashPassword(this._password),
        })
    }
}