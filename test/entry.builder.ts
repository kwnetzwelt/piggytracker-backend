import { IEntryModel, Entry } from "../server/api/models/entry";
import { TestRandom } from "./test.random";
import { RunData } from "./controller.utils";

export class EntryBuilder {
    private _fromUser: string;
    user(rundata: RunData) {
        this._fromUser = String(rundata.user._id);
        return this;
    }
    public static with() {
        return new EntryBuilder();
    }

    public static default() {
        return EntryBuilder.with().build();
    }

    public build(): IEntryModel {
        return new Entry({
            date: new Date(),
            value: TestRandom.r(4000, 0),
            remunerator: TestRandom.randomString(24, 're-'),
            category: TestRandom.randomString(6, 'cat-'),
            info: TestRandom.randomString(24),
            changed: new Date(),
            fromUser: this._fromUser,
        });
    }
}