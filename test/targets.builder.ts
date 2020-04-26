import { TestRandom } from "./test.random";
import { CreateOrUpdateModel } from "../server/api/models/target";
import { ICategoryAcount } from "../server/api/models/categoryaccount";

export class TargetsBuilder {
    private _numberOfTotals = TestRandom.r(6, 1);

    public static forTid(tid: number) {
        return new TargetsBuilder(tid);
    }

    constructor(private readonly tid: number) {
    }

    public numberOfTotals(n: number) {
        this._numberOfTotals = n;
        return this;
    }

    public build(): CreateOrUpdateModel {
        const totals: ICategoryAcount[] = [];
        for (let i = 0; i < this._numberOfTotals; i++) {
            totals.push({
                category: TestRandom.randomString(6, 'cat-'),
                value: TestRandom.r(250, 0),
            });
        }
        const r: CreateOrUpdateModel = {
            totals,
            tid: this.tid
        };

        return r;
    }
}