export default class RealmListConverter {
    public data: any;

    constructor(realmData: any) {
        this.data = Object.values(JSON.parse(JSON.stringify(realmData)));
    }
}
