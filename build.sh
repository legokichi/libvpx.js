cd libvpx
emmake make clean > /dev/null 2>&1
git reset --hard
patch -p1 -i ../configure.patch
emconfigure ./configure \
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
  --extra-cflags="-02"
# --extra-cflags="-g -O0"
# --disable-optimizations \
emmake make
exported_functions=$(node --eval "console.log(JSON.stringify(require('../exported_functions.json')).split('\"').join('\''))")
\cp -f ../src/decode.c ./
emcc \
  -s TOTAL_MEMORY=67108864 \
  -O2 \
  -s EXPORTED_FUNCTIONS="$exported_functions" \
  -I. \
  ./decode.c libvpx.a \
  -o ../decode.js 
# -g -g4 : デバッグ
# -O2 : 最適化
# --memory-init-file 0 : .js.mem 吐かない
# -s ALLOW_MEMORY_GROWTH=1 : 可変ヒープ
# -s TOTAL_MEMORY=X : ヒープ指定
# -s SIDE_MODULE=1
echo "fin"
cd ..