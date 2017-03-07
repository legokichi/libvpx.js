"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const libvpx_1 = require("../libvpx");
const utils_1 = require("./utils");
const vpx_image_1 = require("./vpx_image");
__export(require("./vpx_image"));
exports.VPX_CODEC_ABI_VERSION = (4 + vpx_image_1.VPX_IMAGE_ABI_VERSION); /**<\hideinitializer*/
exports.VPX_CODEC_CAP_DECODER = 0x1; /**< Is a decoder */
exports.VPX_CODEC_CAP_ENCODER = 0x2; /**< Is an encoder */
exports.VPX_CODEC_CAP_HIGHBITDEPTH = 0x4;
/**
```c
typedef struct vpx_codec_ctx {
  const char *name;
  vpx_codec_iface_t *iface;
  vpx_codec_err_t err;
  const char *err_detail;
  vpx_codec_flags_t init_flags;
  union {
    const struct vpx_codec_dec_cfg *dec;
    const struct vpx_codec_enc_cfg *enc;
    const void *raw;
  } config;
  vpx_codec_priv_t *priv;
} vpx_codec_ctx_t;
```*/
exports.vpx_codec_ctx_t = new utils_1.StructType([
    ['*', 'name'],
    ['*', 'iface'],
    ['i32', 'err'],
    ['*', 'err_detail'],
    ["i64", "init_flags"],
    ['*', 'err_detail'],
    ['*', 'raw'],
    ['*', 'priv']
]);
/**
```c
const char *vpx_codec_version_str(void);
```
 */
exports.vpx_codec_version_str = libvpx_1.Module.cwrap('vpx_codec_version_str', 'string', []);
/**
```c
const char *vpx_codec_iface_name(vpx_codec_iface_t *iface);
```
 */
exports.vpx_codec_iface_name = libvpx_1.Module.cwrap('vpx_codec_iface_name', '*', ['string*']);
/**
```c
const char *vpx_codec_err_to_string(vpx_codec_err_t err);
```
 */
exports.vpx_codec_err_to_string = libvpx_1.Module.cwrap('vpx_codec_err_to_string', 'string', ['number']);
/**
```c
const char *vpx_codec_error(vpx_codec_ctx_t *ctx);
```
 */
exports.vpx_codec_error = libvpx_1.Module.cwrap('vpx_codec_error', 'number', ['number']);
/**
```c
const char *vpx_codec_error_detail(vpx_codec_ctx_t *ctx);
```
 */
exports.vpx_codec_error_detail = libvpx_1.Module.cwrap('vpx_codec_error_detail', 'string', ['*']);
/**
```c
vpx_codec_err_t vpx_codec_destroy(vpx_codec_ctx_t *ctx);
```*/
exports.vpx_codec_destroy = libvpx_1.Module.cwrap("vpx_codec_destroy", "number", ["*"]);
