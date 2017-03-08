type _Module = typeof Module;

declare module VPX {
  export var Module: _Module;
}

declare module "libvpx" {
  export = VPX;
}

export = VPX;