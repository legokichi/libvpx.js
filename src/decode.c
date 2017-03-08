#include "../libvpx/vpx/vpx_decoder.h"
#include "../libvpx/vpx/internal/vpx_codec_internal.h"
#include "../libvpx/vp8/decoder/onyxd_int.h"
#include "../libvpx/vp8/vp8_dx_iface.c"

#include <stdio.h>

vpx_codec_ctx_t codec;

void die_codec(vpx_codec_ctx_t *ctx, const char *s) {
  const char *detail = vpx_codec_error_detail(ctx);

  printf("%s: %s\n", s, vpx_codec_error(ctx));
  if (detail) printf("    %s\n", detail);
  exit(1);
}

int init(int argc, char **argv) {
  printf("Using %s\n", vpx_codec_iface_name(vpx_codec_vp8_dx()));
  if (vpx_codec_dec_init(&codec, vpx_codec_vp8_dx(), NULL, 0)){
    die_codec(&codec, "Failed to initialize decoder.");
  }
  return 0;
}

int decode(const unsigned char *frame, size_t frame_size){
  if (vpx_codec_decode(&codec, frame, (unsigned int)frame_size, NULL, 0)){
    die_codec(&codec, "Failed to decode frame.");
  }
  /*
  // struct vpx_codec_alg_priv @ vp8/vp8_dx_iface.c
  // vp8_decode(vpx_codec_alg_priv_t *ctx, ...)'s ctx
  vpx_codec_alg_priv_t* ctx = (vpx_codec_alg_priv_t *)codec.priv;

  // onyxd_int.h: struct VP8D_COMP { ... } VP8D_COMP;
  VP8D_COMP* pbi = ctx->yv12_frame_buffers.pbi[0];

  for (int row = 0; row < pbi->common.mb_rows; ++row) {
    for (int col = 0; col < pbi->common.mb_cols; ++col) {
      const int i = row * pbi->common.mode_info_stride + col;
      const short _row = pbi->common.mi[i].mbmi.mv.as_mv.row;
      const short _col = pbi->common.mi[i].mbmi.mv.as_mv.col;
    }
  }
  */
  return 0;
}

int destroy(void){
  if (vpx_codec_destroy(&codec)){
    die_codec(&codec, "Failed to destroy codec");
  }
  return 0;
}