import { IEntryModel, Entry } from "../server/api/models/entry";
import { TestRandom } from "./test.random";

export class EntryBuilder {
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
            changed: new Date()
        });
    }
}