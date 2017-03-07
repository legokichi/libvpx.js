import { StructType } from "./utils";
export * from "./vpx_image";
export declare const VPX_CODEC_ABI_VERSION: number;
export declare const VPX_CODEC_CAP_DECODER = 1;
export declare const VPX_CODEC_CAP_ENCODER = 2;
export declare const VPX_CODEC_CAP_HIGHBITDEPTH = 4;
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
export declare const vpx_codec_ctx_t: StructType<string>;
/**
```c
const char *vpx_codec_version_str(void);
```
 */
export declare const vpx_codec_version_str: () => string;
/**
```c
const char *vpx_codec_iface_name(vpx_codec_iface_t *iface);
```
 */
export declare const vpx_codec_iface_name: (_iface: number) => string;
/**
```c
const char *vpx_codec_err_to_string(vpx_codec_err_t err);
```
 */
export declare const vpx_codec_err_to_string: (err: number) => string;
/**
```c
const char *vpx_codec_error(vpx_codec_ctx_t *ctx);
```
 */
export declare const vpx_codec_error: (_ctx: number) => number;
/**
```c
const char *vpx_codec_error_detail(vpx_codec_ctx_t *ctx);
```
 */
export declare const vpx_codec_error_detail: (_ctx: number) => string;
/**
```c
vpx_codec_err_t vpx_codec_destroy(vpx_codec_ctx_t *ctx);
```*/
export declare const vpx_codec_destroy: (_ctx: number) => number;
