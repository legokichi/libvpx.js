import {Module} from "../libvpx";
import {StructType} from "./utils";

import{VPX_CODEC_ABI_VERSION} from "./vpx_codec";

export * from "./vpx_codec";

export const VPX_DECODER_ABI_VERSION = (3 + VPX_CODEC_ABI_VERSION);
export const VPX_CODEC_CAP_PUT_SLICE = 0x10000;
export const VPX_CODEC_CAP_PUT_FRAME = 0x20000;
export const VPX_CODEC_CAP_POSTPROC = 0x40000;
export const VPX_CODEC_CAP_ERROR_CONCEALMENT = 0x80000;

/**
```c
typedef struct vpx_codec_dec_cfg {
  unsigned int threads;
  unsigned int w;      
  unsigned int h;      
} vpx_codec_dec_cfg_t; 
```*/
export const vpx_codec_dec_cfg = new StructType<string>([
  ["i32", "threads"],
  ["i32", "w"],
  ["i32", "h"],
]);
/**
```c
vpx_codec_err_t vpx_codec_dec_init_ver(
  vpx_codec_ctx_t *ctx,
  vpx_codec_iface_t *iface,
  const vpx_codec_dec_cfg_t *cfg,
  vpx_codec_flags_t flags,
  int ver);
```*/
export const vpx_codec_dec_init_ver: (_ctx: number, _iface: number, _cfg: number, flags: number, ver: number) => number =
  Module.cwrap("vpx_codec_dec_init_ver", "number", ["*", "*", "*", "number", "number"]);
/**
```c
#define vpx_codec_dec_init(ctx, iface, cfg, flags) \
  vpx_codec_dec_init_ver(ctx, iface, cfg, flags, VPX_DECODER_ABI_VERSION)
```*/
export function vpx_codec_dec_init(_ctx: number, _iface: number, _cfg: number, flags: number){
  return vpx_codec_dec_init_ver(_ctx, _iface, _cfg, flags, VPX_DECODER_ABI_VERSION);
}

/**
```c
vpx_codec_err_t vpx_codec_decode(
  vpx_codec_ctx_t *ctx,
  const uint8_t *data,
  unsigned int data_sz,
  void *user_priv,
  long deadline);
```*/
export const vpx_codec_decode: (_ctx: number, _data: number, data_sz: number, user_priv: number, deadline: number) => number =
  Module.cwrap("vpx_codec_decode", "number", ["*", "*", "number", "*", "number"]);
/**
```c
vpx_image_t *vpx_codec_get_frame(vpx_codec_ctx_t *ctx, vpx_codec_iter_t *iter);

```*/
export const vpx_codec_get_frame: (_ctx: number, iter: number) => number =
  Module.cwrap("vpx_codec_get_frame", "*", ["*", "*"]);



