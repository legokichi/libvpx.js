// https://github.com/ucisysarch/opencvjs/blob/master/bindings.cpp
// emscripten/tests/embind/embind_test.cpp

#include "../libvpx/vpx/vpx_decoder.h"
#include "../libvpx/vpx/internal/vpx_codec_internal.h"
#include "../libvpx/vp8/decoder/onyxd_int.h"

#include <stdio.h>
#include <emscripten/bind.h>

using emscripten::function;
using emscripten::value_object;
using emscripten::allow_raw_pointers;
using emscripten::allow_raw_pointer;
using emscripten::ret_val;

vpx_codec_iface_t *vpx_codec_vp8_dx(void);

EMSCRIPTEN_BINDINGS(VPX) {
  // vpx/vpx_codec.h
  //value_object<vpx_codec_ctx_t>("vpx_codec_ctx_t")
    //.field("name",       &vpx_codec_ctx_t::name ) // const char *name;
    //.field("err_detail", &vpx_codec_ctx_t::err_detail, allow_raw_pointers() ) // const char *err_detail;
    //.field("priv",       &vpx_codec_ctx_t::priv) // vpx_codec_alg_priv_t
    ;
/*
  // vp8/vp8_dx_iface.c
  value_object<vpx_codec_alg_priv_t>("vpx_codec_alg_priv_t") // struct vpx_codec_alg_priv { ... };
    .field("yv12_frame_buffers", &vpx_codec_alg_priv_t::yv12_frame_buffers) // struct frame_buffers yv12_frame_buffers;
    ;

  // vp8/common/onyxd_int.h
  value_object<frame_buffers>("frame_buffers") // struct frame_buffers { ... };
    .field("pbi", &frame_buffers::pbi) // struct VP8D_COMP *pbi[MAX_FB_MT_DEC];
    ;

  // vp8/common/onyxd_int.h
  value_object<VP8D_COMP>("VP8D_COMP") // typedef struct VP8D_COMP { ... } VP8D_COMP;
    .field("common", &VP8D_COMP::common) // DECLARE_ALIGNED(16, VP8_COMMON, common);
    ;

  // vp8/common/onyxc_int.h
  value_object<VP8Common>("VP8Common") // typedef struct VP8Common { ... } VP8_COMMON;
    .field("Width",            &VP8Common::Width) // int Width;
    .field("Height",           &VP8Common::Height) // int Height;
    .field("mb_rows",          &VP8Common::mb_rows) // int mb_rows;
    .field("mb_cols",          &VP8Common::mb_cols) // int mb_cols;
    .field("mode_info_stride", &VP8Common::mode_info_stride) // int mode_info_stride;
    .field("mi",               &VP8Common::mi) // MODE_INFO *mi;
    ;

  // vp8/common/block.h
  value_object<modeinfo>("modeinfo") // typedef struct modeinfo { ... } MODE_INFO;
    .field("mbmi", &modeinfo::mbmi) // MB_MODE_INFO mbmi;
    //.field("bmi",  &MODE_INFO::bmi) // union b_mode_info bmi[16];
    ;

  // vp8/common/block.h
  value_object<MB_MODE_INFO>("MB_MODE_INFO") // typedef struct { ... } MB_MODE_INFO;
    .field("mode",      &MB_MODE_INFO::mode) // uint8
    .field("uv_mode",   &MB_MODE_INFO::uv_mode) // uint8
    .field("ref_frame", &MB_MODE_INFO::ref_frame) // uint8
    .field("mv",        &MB_MODE_INFO::mv) // int_mv
    ;

  // vp8/common/mv.h
  value_object<int_mv>("int_mv") // typedef union int_mv { ... } int_mv;
    .field("as_mv", &int_mv::as_mv) // MV as_mv;
    ;

  value_object<MV>("MV") // typedef struct { ... } MV;
    .field("row", &MV::row) // short row;
    .field("col", &MV::col) // short col;
    ;
*/
  function("vpx_codec_vp8_dx",       &vpx_codec_vp8_dx,       allow_raw_pointer<ret_val>() );
  function("vpx_codec_dec_init_ver", &vpx_codec_dec_init_ver, allow_raw_pointer<ret_val>() );
  function("vpx_codec_decode",       &vpx_codec_decode,       allow_raw_pointer<ret_val>() );
  function("vpx_codec_destroy",      &vpx_codec_destroy,      allow_raw_pointer<ret_val>() );
}