export declare const sizes: {
    i64: number;
    i32: number;
    i16: number;
    i8: number;
    float: number;
    double: number;
    '*': number;
};
export declare type Type = keyof typeof sizes;
export declare type Fields<Member extends string> = [Type, Member][];
export declare function sizeof(type: Type): number;
export declare function offsetof<Member extends string>(fields: Fields<Member>, name: Member): number;
export declare class StructType<Member extends string> {
    size: number;
    fields: Fields<Member>;
    constructor(fields: Fields<Member>);
    create(ptr?: number): Struct<Member>;
}
export declare class Struct<Member extends string> {
    address: number | null;
    fields: Fields<Member>;
    constructor(address: number, fields: Fields<Member>);
    destroy(): void;
    getOffset(name: Member): number;
    getType(name: Member): string;
    get(name: Member): number;
    set(name: Member, value: number): void;
}
