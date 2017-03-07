"use strict";
const libvpx_1 = require("../libvpx");
// https://github.com/kripken/emscripten/blob/master/src/preamble.js#L294
exports.sizes = {
    i64: 8,
    i32: 4,
    i16: 2,
    i8: 1,
    float: 4,
    double: 8,
    '*': 4,
};
function sizeof(type) {
    if (typeof exports.sizes[type] === "number") {
        return exports.sizes[type];
    }
    throw new Error("No such type: " + type);
}
exports.sizeof = sizeof;
function offsetof(fields, name) {
    let offset = 0;
    for (let i = 0; i < fields.length; i++) {
        const [type, _name] = fields[i];
        if (_name == name) {
            return offset;
        }
        offset += sizeof(type);
    }
    throw new Error("No such member: " + name);
}
exports.offsetof = offsetof;
class StructType {
    constructor(fields) {
        this.size = 0;
        this.fields = fields;
        fields.forEach(([type, name]) => {
            this.size += sizeof(type);
        });
    }
    create(ptr) {
        if (typeof ptr !== "number") {
            ptr = libvpx_1.Module._malloc(this.size);
        }
        return new Struct(ptr, this.fields);
    }
}
exports.StructType = StructType;
class Struct {
    constructor(address, fields) {
        this.address = address;
        this.fields = fields;
    }
    destroy() {
        if (typeof this.address !== "number") {
            throw new Error("this address is already free");
        }
        libvpx_1.Module._free(this.address);
        this.address = null;
    }
    getOffset(name) {
        return offsetof(this.fields, name);
    }
    getType(name) {
        for (let i = 0; i < this.fields.length; i++) {
            const [type, _name] = this.fields[i];
            if (name === _name) {
                return type;
            }
        }
        throw new Error("No such member: " + name);
    }
    get(name) {
        if (typeof this.address !== "number") {
            throw new Error("this address is already free");
        }
        const offset = this.getOffset(name);
        const type = this.getType(name);
        return libvpx_1.Module.getValue(this.address + offset, type);
    }
    set(name, value) {
        if (typeof this.address !== "number") {
            throw new Error("this address is already free");
        }
        const offset = this.getOffset(name);
        const type = this.getType(name);
        libvpx_1.Module.setValue(this.address + offset, value, type);
    }
}
exports.Struct = Struct;
