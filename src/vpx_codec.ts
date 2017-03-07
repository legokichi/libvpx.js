import {Module} from "../libvpx";
import {StructType} from "./utils";

import {VPX_IMAGE_ABI_VERSION} from "./vpx_image";

export * from "./vpx_image";

export const VPX_CODEC_ABI_VERSION = (4 + VPX_IMAGE_ABI_VERSION); /**<\hideinitializer*/




export const VPX_CODEC_CAP_DECODER = 0x1; /**< Is a decoder */
export const VPX_CODEC_CAP_ENCODER = 0x2; /**< Is an encoder */
export const VPX_CODEC_CAP_HIGHBITDEPTH = 0x4;
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
export const vpx_codec_ctx_t = new StructType<string>([
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
export const vpx_codec_version_str: ()=> string =
  Module.cwrap('vpx_codec_version_str', 'string', []);
/**
```c
const char *vpx_codec_iface_name(vpx_codec_iface_t *iface);
```
 */
export const vpx_codec_iface_name: (_iface: number)=> string =
  Module.cwrap('vpx_codec_iface_name', '*', ['string*']);
/**
```c
const char *vpx_codec_err_to_string(vpx_codec_err_t err);
```
 */
export const vpx_codec_err_to_string: (err: number)=> string =
  Module.cwrap('vpx_codec_err_to_string', 'string',['number']);
/**
```c
const char *vpx_codec_error(vpx_codec_ctx_t *ctx);
```
 */
export const vpx_codec_error: (_ctx: number)=> number =
  Module.cwrap('vpx_codec_error', 'number', ['number']);
/**
```c
const char *vpx_codec_error_detail(vpx_codec_ctx_t *ctx);
```
 */
export const vpx_codec_error_detail: (_ctx: number)=> string =
  Module.cwrap('vpx_codec_error_detail', 'string', ['*']);
/**
```c
vpx_codec_err_t vpx_codec_destroy(vpx_codec_ctx_t *ctx);
```*/
export const vpx_codec_destroy: (_ctx: number) => number =
  Module.cwrap("vpx_codec_destroy", "number", ["*"]);
