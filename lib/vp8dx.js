"use strict";
const libvpx_1 = require("../libvpx");
/**
```c
vpx_codec_iface_t *vpx_codec_vp8_dx(void) { return &vpx_codec_vp8_dx_algo; }
```
 */
exports.vpx_codec_vp8_dx = libvpx_1.Module.cwrap('vpx_codec_vp8_dx', '*', []);
/**
```c
vpx_codec_iface_t vpx_codec_vp8_dx_algo = {
  "WebM Project VP8 Decoder" VERSION_STRING,
  VPX_CODEC_INTERNAL_ABI_VERSION,
  VPX_CODEC_CAP_DECODER | VP8_CAP_POSTPROC | VP8_CAP_ERROR_CONCEALMENT |
      VPX_CODEC_CAP_INPUT_FRAGMENTS,
  // vpx_codec_caps_t          caps;
  vp8_init,     // vpx_codec_init_fn_t       init;
  vp8_destroy,  // vpx_codec_destroy_fn_t    destroy;
  vp8_ctf_maps, // vpx_codec_ctrl_fn_map_t  *ctrl_maps;
  {
      vp8_peek_si,   // vpx_codec_peek_si_fn_t    peek_si;
      vp8_get_si,    // vpx_codec_get_si_fn_t     get_si;
      vp8_decode,    // vpx_codec_decode_fn_t     decode;
      vp8_get_frame, // vpx_codec_frame_get_fn_t  frame_get;
      NULL,
  },
  {
      /* encoder functions
      0, NULL, // vpx_codec_enc_cfg_map_t
      NULL,    // vpx_codec_encode_fn_t
      NULL,    // vpx_codec_get_cx_data_fn_t
      NULL,    // vpx_codec_enc_config_set_fn_t
      NULL,    // vpx_codec_get_global_headers_fn_t
      NULL,    // vpx_codec_get_preview_frame_fn_t
      NULL     // vpx_codec_enc_mr_get_mem_loc_fn_t
  }
};

```
 */
