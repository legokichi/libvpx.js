rm -f decode.* > /dev/null 2>&1
rm -f pthread-main.js > /dev/null 2>&1
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
  --disable-multithread \
  --extra-cflags="-O2"
# --disable-multithread
# --extra-cflags="-g -O0"
# --disable-optimizations
emmake make
exported_functions=$(node --eval "console.log(JSON.stringify(require('../exported_functions.json')).split('\"').join('\''))")
\cp -f ../src/decode.c ./
emcc \
  -s TOTAL_MEMORY=67108864 \
  -s SIMD=1 \
  -O2 --llvm-lto 3 \
  -s EXPORTED_FUNCTIONS="$exported_functions" \
  -I. \
  ./decode.c libvpx.a \
  -o ../decode.js

# simd つかうとき
# -s SIMD=1
# https://kripken.github.io/emscripten-site/docs/porting/simd.html

# pthread つかうとき
# --disable-multithread を取り除く
# -s USE_PTHREADS=1 -s PTHREAD_POOL_SIZE=4
# https://kripken.github.io/emscripten-site/docs/porting/pthreads.html
# https://bugs.chromium.org/p/chromium/issues/detail?id=678410
# https://www.chromestatus.com/feature/4570991992766464
# Uncaught DOMException: Failed to execute 'postMessage' on 'Worker': A SharedArrayBuffer could not be cloned. するので
# worker.postMessage({cmd:"load",url:currentScriptUrl,buffer:HEAPU8.buffer,tempDoublePtr:tempDoublePtr,TOTAL_MEMORY:TOTAL_MEMORY,STATICTOP:STATICTOP,DYNAMIC_BASE:DYNAMIC_BASE,DYNAMICTOP_PTR:DYNAMICTOP_PTR,PthreadWorkerInit:PthreadWorkerInit},[HEAPU8.buffer]);
# して shared な HEAPU8.buffer  を transferable にする
# 現状 wasm と pthread は両立できないっぽい

# wasm のとき
# -s WASM=1 -s "BINARYEN_METHOD='native-wasm'" \
# https://github.com/kripken/emscripten/wiki/WebAssembly

# asmjs のとき
# --memory-init-file 0 : .js.mem 吐かない
# -s ALLOW_MEMORY_GROWTH=1 : 可変ヒープ
# -s TOTAL_MEMORY=67108864 \

# 最適化
# -g -g4 : デバッグ
# -O2 --llvm-lto 3
# https://kripken.github.io/emscripten-site/docs/tools_reference/emcc.html

# dynamic linking
# -s SIDE_MODULE=1
echo "fin"
cd ..
