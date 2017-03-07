import {Module} from "../libvpx";

// https://github.com/kripken/emscripten/blob/master/src/preamble.js#L294
export const sizes = {
  i64: 8,
  i32: 4,
  i16: 2,
  i8: 1,
  float: 4,
  double: 8,
  '*': 4,
  '*i64': 4,
  '*i32': 4,
  '*i16': 4,
  '*i8': 4,
  '*float': 4,
  '*double': 4
};

export type Type = keyof typeof sizes;
export type Fields<Member extends string> = [Type, Member][];

export function sizeof(type: Type) {
  if(typeof sizes[type] === "number"){
    return sizes[type];
  }
	throw new Error("No such type: " + type);
}

export function offsetof<Member extends string>(fields: Fields<Member>, name: Member): number {
  let offset = 0;
  for (let i=0; i<fields.length; i++) {
    const [type, _name] = fields[i];
    if (_name == name) {
      return offset;
    }
    offset += sizeof(type);
  }
  throw new Error("No such member: " + name);
}


export class StructType<Member extends string> {
  size: number;
  fields: Fields<Member>;
  constructor(fields: Fields<Member>){
    this.size = 0;
    this.fields = fields;
    fields.forEach(([type, name]) => {
      this.size += sizeof(type);
    });
  }
  create(ptr?: number){
    if (typeof ptr !== "number") {
    	ptr = Module._malloc(this.size);
    }
    return new Struct(ptr, this.fields);
  }
}


export class Struct<Member extends string> {
  address: number | null;
  fields: Fields<Member>;
  constructor(address: number, fields: Fields<Member>){
    this.address = address;
    this.fields = fields;
  }
  destroy(): void {
    if(typeof this.address !== "number"){
      throw new Error("this address is already free");
    }
    Module._free(this.address);
    this.address = null;
  }
  getOffset(name: Member): number {
    return offsetof(this.fields, name);
  }
  getType(name: Member): string {
    for (let i=0; i<this.fields.length; i++) {
      const [type, _name] = this.fields[i];
      if(name === _name){
        return type;
      }
    }
    throw new Error("No such member: " + name);
  }
  get(name: Member): number {
    const offset = this.getOffset(name);
    const type = this.getType(name);
    return Module.getValue(this.address + offset, type);
  }
  set(name: Member, value: number): void {
    const offset = this.getOffset(name);
    const type = this.getType(name);
    Module.setValue(this.address + offset, value, type);
  }
}


