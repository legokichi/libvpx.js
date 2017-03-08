cd libvpx
emmake make clean > /dev/null 2>&1
git reset --hard
patch -p1 -i ../configure.patch
emconfigure ./configure \
  --disable-optimizations \
  --disable-runtime-cpu-detect \
  --disable-examples \
  --disable-docs \
  --disable-vp9 \
  --disable-vp8-encoder \
  --disable-unit_tests \
  --disable-install_bins \
  --disable-install_libs \
  --disable-encode_perf_tests \
  --disable-decode_perf_tests \
  --target=asmjs-unknown-emscripten \
  --extra-cflags="-g"
# --extra-cflags="-02"
emmake make
#exported_functions=$(node --eval "console.log(JSON.stringify(require('../exported_functions.json')).split('\"').join('\''))")
# とりあえず side module でコンパイルしてみる
#emcc \
#  -O2 \
#  --memory-init-file 0 \
#  -s EXPORTED_FUNCTIONS="$exported_functions" \
#  -s SIDE_MODULE=1
#  libvpx.a \
#  -o ../libvpx.js
# or -s ALLOW_MEMORY_GROWTH=1
cp ../src/decode.c ./
emcc \
  -s EXPORTED_FUNCTIONS="['_init', '_decode', '_destroy']" \
  -g \
  -g4 \
  -I. \
  ./decode.c libvpx.a \
  -o ./decode.js 