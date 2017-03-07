import { StructType } from "./utils";
export * from "./vpx_codec";
export declare const VPX_DECODER_ABI_VERSION: number;
export declare const VPX_CODEC_CAP_PUT_SLICE = 65536;
export declare const VPX_CODEC_CAP_PUT_FRAME = 131072;
export declare const VPX_CODEC_CAP_POSTPROC = 262144;
export declare const VPX_CODEC_CAP_ERROR_CONCEALMENT = 524288;
/**
```c
typedef struct vpx_codec_dec_cfg {
  unsigned int threads;
  unsigned int w;
  unsigned int h;
} vpx_codec_dec_cfg_t;
```*/
export declare const vpx_codec_dec_cfg: StructType<string>;
/**
```c
vpx_codec_err_t vpx_codec_dec_init_ver(
  vpx_codec_ctx_t *ctx,
  vpx_codec_iface_t *iface,
  const vpx_codec_dec_cfg_t *cfg,
  vpx_codec_flags_t flags,
  int ver);
```*/
export declare const vpx_codec_dec_init_ver: (_ctx: number, _iface: number, _cfg: number, flags: number, ver: number) => number;
/**
```c
#define vpx_codec_dec_init(ctx, iface, cfg, flags) \
  vpx_codec_dec_init_ver(ctx, iface, cfg, flags, VPX_DECODER_ABI_VERSION)
```*/
export declare function vpx_codec_dec_init(_ctx: number, _iface: number, _cfg: number, flags: number): number;
/**
```c
vpx_codec_err_t vpx_codec_decode(
  vpx_codec_ctx_t *ctx,
  const uint8_t *data,
  unsigned int data_sz,
  void *user_priv,
  long deadline);
```*/
export declare const vpx_codec_decode: (_ctx: number, _data: number, data_sz: number, user_priv: number, deadline: number) => number;
/**
```c
vpx_image_t *vpx_codec_get_frame(vpx_codec_ctx_t *ctx, vpx_codec_iter_t *iter);

```*/
export declare const vpx_codec_get_frame: (_ctx: number, iter: number) => number;
