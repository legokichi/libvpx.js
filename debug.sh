#rm -f libvpx.a vp8/vp8_dx_iface.c.o vpx/src/vpx_codec.c.o
#emmake make  
\cp -f ../src/decode.c ./
emcc -s EXPORTED_FUNCTIONS="['_init', '_decode', '_destroy']" -g -g4 -I. ./decode.c libvpx.a -o ../decode.js