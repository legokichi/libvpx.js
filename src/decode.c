#include "../libvpx/vpx/vpx_decoder.h"

vpx_codec_ctx_t codec;

int main(int argc, char **argv) {
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

  // struct vpx_codec_alg_priv @ vp8/vp8_dx_iface.c
  // vp8_decode(vpx_codec_alg_priv_t *ctx, ...)'s ctx
  vpx_codec_alg_priv_t* ctx = (vpx_codec_alg_priv_t *)codec->priv;

  // onyxd_int.h: struct VP8D_COMP { ... } VP8D_COMP;
  VP8D_COMP* pbi = ctx->yv12_frame_buffers.pbi[0];

  // onyxd_int.h: typedef struct { MACROBLOCKD mbd; } MB_ROW_DEC;
  MB_ROW_DEC* mb_row_di = pbi->mb_row_di;

  // vp8/common/blockd.h: struct macroblockd {} MACROBLOCKD;
  MACROBLOCKD* mbd = mb_row_di->mbd;

  // vp8/common/ typedef struct { ... } MV;
  MV mv = mbd->mode_info_context->mbmi->mv->as_mv;
  mv->row;
  mv->col;

  return 0;
}



int destroy(void){
  if (vpx_codec_destroy(&codec)){
    die_codec(&codec, "Failed to destroy codec");
  }
  return 0;
}