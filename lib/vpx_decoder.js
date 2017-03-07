"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const libvpx_1 = require("../libvpx");
const utils_1 = require("./utils");
const vpx_codec_1 = require("./vpx_codec");
__export(require("./vpx_codec"));
exports.VPX_DECODER_ABI_VERSION = (3 + vpx_codec_1.VPX_CODEC_ABI_VERSION);
exports.VPX_CODEC_CAP_PUT_SLICE = 0x10000;
exports.VPX_CODEC_CAP_PUT_FRAME = 0x20000;
exports.VPX_CODEC_CAP_POSTPROC = 0x40000;
exports.VPX_CODEC_CAP_ERROR_CONCEALMENT = 0x80000;
/**
```c
typedef struct vpx_codec_dec_cfg {
  unsigned int threads;
  unsigned int w;
  unsigned int h;
} vpx_codec_dec_cfg_t;
```*/
exports.vpx_codec_dec_cfg = new utils_1.StructType([
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
exports.vpx_codec_dec_init_ver = libvpx_1.Module.cwrap("vpx_codec_dec_init_ver", "number", ["*", "*", "*", "number", "number"]);
/**
```c
#define vpx_codec_dec_init(ctx, iface, cfg, flags) \
  vpx_codec_dec_init_ver(ctx, iface, cfg, flags, VPX_DECODER_ABI_VERSION)
```*/
function vpx_codec_dec_init(_ctx, _iface, _cfg, flags) {
    return exports.vpx_codec_dec_init_ver(_ctx, _iface, _cfg, flags, exports.VPX_DECODER_ABI_VERSION);
}
exports.vpx_codec_dec_init = vpx_codec_dec_init;
/**
```c
vpx_codec_err_t vpx_codec_decode(
  vpx_codec_ctx_t *ctx,
  const uint8_t *data,
  unsigned int data_sz,
  void *user_priv,
  long deadline);
```*/
exports.vpx_codec_decode = libvpx_1.Module.cwrap("vpx_codec_decode", "number", ["*", "*", "number", "*", "number"]);
/**
```c
vpx_image_t *vpx_codec_get_frame(vpx_codec_ctx_t *ctx, vpx_codec_iter_t *iter);

```*/
exports.vpx_codec_get_frame = libvpx_1.Module.cwrap("vpx_codec_get_frame", "*", ["*", "*"]);
