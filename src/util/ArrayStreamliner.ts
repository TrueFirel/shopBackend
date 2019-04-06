import dotProp from "dot-prop";

export default class ArrayStreaminer {

    [key: string]: any;

    public static compareDates(dotPropField: string) {
        return {
            comparatorAsc: (a: any, b: any) => {
                a = new Date(dotProp.get(a, dotPropField));
                b = new Date(dotProp.get(b, dotPropField));
                return  a < b ? -1 : a > b ? 1 : 0;
            },
            comparatorDesc: (a: any, b: any) => {
                a = new Date(dotProp.get(a, dotPropField));
                b = new Date(dotProp.get(b, dotPropField));
                return  a > b ? -1 : a < b ? 1 : 0;
            },
        };
    }

    public static compareNumbers(dotPropField: string) {
        return {
            comparatorAsc: (a: any, b: any) => {
                return dotProp.get(a, dotPropField) - dotProp.get(b, dotPropField);
            },
            comparatorDesc: (a: any, b: any) => {
                return dotProp.get(b, dotPropField) - dotProp.get(a, dotPropField);
            },
        };
    }

    public static compareStrings(dotPropField: string) {
        return {
            comparatorAsc: (a: any, b: any) => {
                return dotProp.get(a, dotPropField).localeCompare(dotProp.get(b, dotPropField));
            },
            comparatorDesc: (a: any, b: any) => {
                return !dotProp.get(a, dotPropField).localeCompare(dotProp.get(b, dotPropField));
            },
        };
    }

    public data: any;

    constructor(data: any) {
        this.data = data;
    }

    public searchByString(searchField: string, value: number) {
        this.data = this.data.filter((element: any) => {
            return element[searchField] && element[searchField].match(value);
        });
    }

    public filterMoreNumbers(dotPropField: string, value: number) {
        this.data = this.data.filter((element: any) => dotProp.get(element, dotPropField) >= value);
    }

    public filterLessNumbers(dotPropField: string, value: number) {
        this.data = this.data.filter((element: any) => dotProp.get(element, dotPropField) <= value);
    }

    public filterByString(dotPropField: string, value: string) {
        this.data = this.data.filter((element: any) => dotProp.get(element, dotPropField) === value);
    }

    public sortByDate(dotPropField: string, order?: string) {
        if (order === "desc") this.data.sort(ArrayStreaminer.compareDates(dotPropField).comparatorDesc);
        else this.data.sort(ArrayStreaminer.compareDates(dotPropField).comparatorAsc);
        return this;
    }

    public sortByNumber(dotPropField: string, order?: string) {
        if (order === "desc") this.data.sort(ArrayStreaminer.compareNumbers(dotPropField).comparatorDesc);
        else this.data.sort(ArrayStreaminer.compareNumbers(dotPropField).comparatorAsc);
        return this;
    }

    public sortByString(dotPropField: string, order?: string) {
        if (order === "desc") this.data.sort(ArrayStreaminer.compareStrings(dotPropField).comparatorDesc);
        else this.data.sort(ArrayStreaminer.compareStrings(dotPropField).comparatorAsc);
        return this;
    }
}
