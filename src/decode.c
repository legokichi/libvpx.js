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

#define CM ((vpx_codec_alg_priv_t *)codec.priv)->yv12_frame_buffers.pbi[0]->common
int show_frame(){ return CM.show_frame; }
int width(){ return CM.Width; }
int height(){ return CM.Height; }
int mb_rows(){ return CM.mb_rows; }
int mb_cols(){ return CM.mb_cols; }
int mode_info_stride(){ return CM.mode_info_stride; }
#define MI(NAME, OP) \
  NAME (int row, int col){ \
    const int idx = row * CM.mode_info_stride + col; \
    MODE_INFO *mi = &CM.mi[idx]; \
    return (OP); \
  }

int MI(mbmi_ref_frame, mi->mbmi.ref_frame)
int MI(mbmi_mode, mi->mbmi.mode)
int MI(mbmi_partitioning, mi->mbmi.partitioning)
int MI(mbmi_uv_mode, mi->mbmi.uv_mode)
int MI(mbmi_is_4x4, mi->mbmi.is_4x4)
int MI(mbmi_row, mi->mbmi.mv.as_mv.row)
int MI(mbmi_col, mi->mbmi.mv.as_mv.col)

int splitmv_row (int row, int col, int i){
  const int idx = row * CM.mode_info_stride + col;
  MODE_INFO *mi = &((vpx_codec_alg_priv_t *)codec.priv)->yv12_frame_buffers.pbi[0]->common.mi[idx];
  return mi->bmi[i].mv.as_mv.row;
}

int splitmv_col (int row, int col, int i){
  const int idx = row * CM.mode_info_stride + col;
  MODE_INFO *mi = &((vpx_codec_alg_priv_t *)codec.priv)->yv12_frame_buffers.pbi[0]->common.mi[idx];
  return mi->bmi[i].mv.as_mv.col;
}

int decode(const unsigned char *frame, size_t frame_size){
  printf("frame_size: %d \n",(unsigned int)frame_size);
  if (vpx_codec_decode(&codec, frame, (unsigned int)frame_size, NULL, 0)){
    die_codec(&codec, "Failed to decode frame.");
  }
  return 0;
}


int show(){
  // struct vpx_codec_alg_priv @ vp8/vp8_dx_iface.c
  // vp8_decode(vpx_codec_alg_priv_t *ctx, ...)'s ctx
  vpx_codec_alg_priv_t *ctx = (vpx_codec_alg_priv_t *)codec.priv;

  // onyxd_int.h: struct VP8D_COMP { ... } VP8D_COMP;
  VP8D_COMP *pbi = ctx->yv12_frame_buffers.pbi[0];
  VP8_COMMON *cm = &pbi->common;

  for (int row = 0; row < cm->mb_rows; ++row) {
    for (int col = 0; col < cm->mb_cols; ++col) {
      const int idx = row * cm->mode_info_stride + col;
      MODE_INFO *mi = &cm->mi[idx];
      printf("(%d, %d)", row, col);
      printf(", ");
      switch(mi->mbmi.ref_frame){
        case INTRA_FRAME: printf("ref_frame: %s", "INTRA_FRAME"); break;
        case LAST_FRAME: printf("ref_frame: %s", "LAST_FRAME"); break;
        case GOLDEN_FRAME: printf("ref_frame: %s", "GOLDEN_FRAME"); break;
        case ALTREF_FRAME: printf("ref_frame: %s", "ALTREF_FRAME"); break;
        case MAX_REF_FRAMES: printf("ref_frame: %s","MAX_REF_FRAMES"); break;
      }
      printf(", ");
      switch(mi->mbmi.mode){
        case DC_PRED: printf("mode: %s", "DC_PRED"); break;
        case V_PRED: printf("mode: %s", "V_PRED"); break;
        case H_PRED: printf("mode: %s", "H_PRED"); break;
        case TM_PRED: printf("mode: %s", "TM_PRED"); break;
        case B_PRED: printf("mode: %s", "B_PRED"); break;
        case NEARESTMV: printf("mode: %s", "NEARESTMV"); break;
        case NEARMV: printf("mode: %s", "NEARMV"); break;
        case ZEROMV: printf("mode: %s", "ZEROMV"); break;
        case NEWMV: printf("mode: %s", "NEWMV"); break;
        case SPLITMV: printf("mode: %s", "SPLITMV"); break;
        case MB_MODE_COUNT: printf("mode: %s", "MB_MODE_COUNT"); break;
      }
      printf(", ");
      printf("partitioning: %d", mi->mbmi.partitioning);
      printf(", ");
      //mi->mbmi.uv_mode;
      //mi->mbmi.is_4x4;

      if(mi->mbmi.mode == SPLITMV) {
        // Block Mode Info (SplitMV)
        for(int i=0; i<16; i++){
          // keyframe => B_PREDICTION_MODE as_mode;, !keyframe, int_mv mv;
          const short _row = mi->bmi[i].mv.as_mv.row;
          const short _col = mi->bmi[i].mv.as_mv.col;
          printf("Block: %d, mv: (%d, %d)\n", i, _row, _col);
        }
        break;
      }
      // Macroblock Mode Info      
      // 16x16 MB MV
      const short _row = mi->mbmi.mv.as_mv.row;
      const short _col = mi->mbmi.mv.as_mv.col;
      
      printf("mv: (%d, %d)\n", _row, _col);
    }
  }

  return 0;
}

int destroy(void){
  if (vpx_codec_destroy(&codec)){
    die_codec(&codec, "Failed to destroy codec");
  }
  return 0;
}