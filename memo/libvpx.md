doxygen って何
なんかドキュメントかくものっぽいぞ？


```[docs.mk]
CODEC_DOX :=    mainpage.dox \
		keywords.dox \
		usage.dox \
		usage_cx.dox \
		usage_dx.dox \
```

を読めということらしい

```[usage.dox]
\subsection usage_ctxs Contexts

...

Most operations require an initialized codec context. Codec context
instances are codec specific. That is, the codec to be used for the encoded
video must be known at initialization time. See #vpx_codec_ctx_t for further
information.

\subsection usage_ifaces Interfaces

...

Each supported codec will expose an interface structure to the application
as an <code>extern</code> reference to a structure of the incomplete type
#vpx_codec_iface_t.


 \section usage_features Features
Several "features" are defined that are optionally implemented by codec
algorithms. Indeed, the same algorithm may support different features on
different platforms. The purpose of defining these features is that when
they are implemented, they conform to a common interface. The features, or
capabilities, of an algorithm can be queried from it's interface by using
the vpx_codec_get_caps() method. Attempts to invoke features not supported
by an algorithm will generally result in #VPX_CODEC_INCAPABLE.

...

\section usage_init Initialization

...

To prevent cases of confusion where the ABI of the library changes,
the ABI is versioned. The ABI version number must be passed at
initialization time to ensure the application is using a header file that
matches the library. The current ABI version number is stored in the
preprocessor macros #VPX_CODEC_ABI_VERSION, #VPX_ENCODER_ABI_VERSION, and
#VPX_DECODER_ABI_VERSION. For convenience, each initialization function has
a wrapper macro that inserts the correct version number. These macros are
named like the initialization methods, but without the _ver suffix.


The available initialization methods are:
\if encoder
\li #vpx_codec_enc_init (calls vpx_codec_enc_init_ver())
\li #vpx_codec_enc_init_multi (calls vpx_codec_enc_init_multi_ver())
\endif
\if decoder
\li #vpx_codec_dec_init (calls vpx_codec_dec_init_ver())
\endif


```


```[usage_dx.dox]
The vpx_codec_decode() function is at the core of the decode loop. It
processes packets of compressed data passed by the application, producing
decoded images. The decoder expects packets to comprise exactly one image
frame of data. Packets \ref MUST be passed in decode order. If the
application wishes to associate some data with the frame, the
<code>user_priv</code> member may be set. The <code>deadline</code>
parameter controls the amount of time in microseconds the decoder should
spend working on the frame. This is typically used to support adaptive
\ref usage_postproc based on the amount of free CPU time. For more
information on the <code>deadline</code> parameter, see \ref usage_deadline.
```

diable にすべき configure オプション

./configure --disable-vp9 --disable-unit_tests --disable-multithread --disable-install_bins --disable-install_libs --disable-encode_perf_tests --disable-decode_perf_tests --disable-vp8_encoder  --target=asmjs-unknown-emscripten

```diff[configure.sh]
       ;;
   esac
 
+  case ${toolchain} in
+    asmjs-unknown-emscripten)
+      # /Users/u01749/Github/emsdk_portable/clang/fastcomp/build_incoming_64/bin/clang
+      # /Users/u01749/Github/emsdk_portable/emscripten/incoming/emcc
+      echo "=======" $tgt_isa $tgt_os $tgt_cc $toolchain
+      CC=/Users/u01749/Github/emsdk_portable/emscripten/incoming/emcc
+      CXX=/Users/u01749/Github/emsdk_portable/emscripten/incoming/em++
+      AR=/Users/u01749/Github/emsdk_portable/emscripten/incoming/emar
+      LD=/Users/u01749/Github/emsdk_portable/emscripten/incoming/emcc
+      AS=/Users/u01749/Github/emsdk_portable/emscripten/incoming/emcc
+      STRIP=/Users/u01749/Github/emsdk_portable/emscripten/incoming/emcc
+      NM=/Users/u01749/Github/emsdk_portable/emscripten/incoming/emcc
+      #add_cflags
+      #add_ldflags
+      #add_asflags 
+      ;;
+  esac
   # Process ARM architecture variants
   case ${toolchain} in
     arm*)
```

```diff[configure]
 all_platforms="${all_platforms} x86_64-win64-vs12"
 all_platforms="${all_platforms} x86_64-win64-vs14"
 all_platforms="${all_platforms} generic-gnu"
+all_platforms="${all_platforms} asmjs-unknown-emscripten"
 
 # all_targets is a list of all targets that can be configured
 # note that these should be in dependency order for now.
```

だいたい上のようにすればよい？


TOOLCHAIN = asmjs-unknown-emscripten

configure で config.mk に toolchain 情報、

target = libs, exampls, tools など
$(target)-$(TOOLCHAIN).mk に emcc 情報が載ってる

* docs-asmjs-unknown-emscripten.mk
  * make する必要性あるの？
* examples-asmjs-unknown-emscripten.mk
  * 便利そう
* libs-asmjs-unknown-emscripten.mk
  * libvpx 本体
  * EXE_SFX, AS_SFX あたりいじれそう
  * libs.mk も関係ある？
* tools-asmjs-unknown-emscripten.mk
  * cli tool ？ 必要なさそう
* config.mk 
  * libs　以外のビルドターゲットを消すにははここをいじる


libs.mk と examples.mk　と config.mk をいじれば大体うまくいきそう
拡張子をbc使うには Makefile つかわなきゃかもだけれど

# route9.js(brodway.js)

* ここでつかわれている libvpx フォークは vp8/.gitmodules に書かれていたここにありそう - https://Benjamin.M.Schwartz@code.google.com/r/benjaminmschwartz-libvpx-emscripten
  * もう存在しない

vp8/README に書かれているとおり

```
To compile libvpx:
cd libvpx
(PATH=$PATH:~/local_clang/bin/) ./configure --disable-vp8-encoder --disable-examples --disable-multithread --target=js1-none-clang_emscripten
(PATH=$PATH:~/local_clang/bin/) make
```

の `target --target=js1-none-clang_emscripten` が気になる。なぜなら https://bitbucket.org/desmaj/libvpx.js の `all_platforms="${all_platforms} js1-none-emcc"` とよく似ているからだ


# desmaj/libvpx.js

```
cd libvpx
patch -p1 -i ../vpx.js/configure.patch
emconfigure ./configure --target=js1-none-emcc --disable-examples --disable-docs --disable-multithread --disable-runtime-cpu-detect --disable-optimizations --extra-cflags="-O2"
../vpx.js/build.sh
cp libvpx.js ../vpx.js/
```

* `js1-none-emcc` のようだ


```diff[desmaj/libvpx.js/configure.patch]
diff --git a/build/make/configure.sh b/build/make/configure.sh
index bb7ab41..508209d 100755
--- a/build/make/configure.sh
+++ b/build/make/configure.sh
@@ -431,7 +431,7 @@ NM=${NM}
 
 CFLAGS  = ${CFLAGS}
 CXXFLAGS  = ${CXXFLAGS}
-ARFLAGS = -rus\$(if \$(quiet),c,v)
+ARFLAGS = rus\$(if \$(quiet),c,v)
 LDFLAGS = ${LDFLAGS}
 ASFLAGS = ${ASFLAGS}
 extralibs = ${extralibs}
@@ -1154,7 +1154,23 @@ EOF
             ;;
         esac
     ;;
-    universal*|*-gcc|generic-gnu)
+	js1-*)
+	    case  ${tgt_cc} in
+		emcc)
+		    CC=emcc
+		    LD=llvm-link
+		    AR=llvm-ar
+		    AS=llvm-as
+		    NM=llvm-nm
+		    tune_cflags=""
+		    tune_asflags=""
+		    disable multithread
+		    add_cflags -emit-llvm
+		    HAVE_GNU_STRIP=no
+		    ;;
+            esac
+    ;;
+        universal*|*-gcc|generic-gnu)
         link_with_cc=gcc
         enable_feature gcc
     setup_gnu_toolchain
diff --git a/configure b/configure
index a252081..849a9fa 100755
--- a/configure
+++ b/configure
@@ -99,6 +99,7 @@ all_platforms="${all_platforms} armv7-linux-rvct"    #neon Cortex-A8
 all_platforms="${all_platforms} armv7-linux-gcc"     #neon Cortex-A8
 all_platforms="${all_platforms} armv7-none-rvct"     #neon Cortex-A8
 all_platforms="${all_platforms} armv7-win32-vs11"
+all_platforms="${all_platforms} js1-none-emcc"
 all_platforms="${all_platforms} mips32-linux-gcc"
 all_platforms="${all_platforms} ppc32-darwin8-gcc"
 all_platforms="${all_platforms} ppc32-darwin9-gcc"

```

* `build/make/configure.sh` の `ARFLAGS` を書き換える必要はあるか？
* man ar
  * -c Whenever an archive is created, an informational message to that effect is written to standard error.  If the -c option is specified, ar creates the archive silently.
  * -r Replace or add the specified files to the archive.  If the archive does not exist a new archive file is created.  Files that replace existing files do not change the order of the files within the archive.  New files are appended to the archive unless one of the options -a, -b or -i is specified.
  * -u Update files.  When used with the -r option, files in the archive will be replaced only if the disk file has a newer modification time than the file in the archive.  When used with the -x option, files in the archive will be extracted only if the archive file has a newer modification time than the file on disk.
  * -s Write an object-file index into the archive, or update an existing one, even if no other change is made to the archive.  You may use this modifier flag either with any operation, or alone.  Running `ar s' on an archive is equivalent to running `ranlib' on it.
  * -c エラー表示しない
  * -r ファイル追記かファイル置換
  * -u 常にファイル置換
  * -s オブジェクトファイルのインデックスを書き換え
  * -v verbose
* llvm-ar --help 
  * OPERATIONS:
    * r[abfiuRsS]  - replace or insert file(s) into the archive
  * MODIFIERS (operation specific)
    * [u] - update only files newer than archive contents
    * [s] - create an archive index (cf. ranlib)
  * MODIFIERS (generic)
    * [c] - do not warn if the library had to be created
    * [v] - be verbose about actions taken
* desmaj/libvpx.js libvpx の置換前 `ARFLAGS = -rus\$(if \$(quiet),c,v)`
* desmaj/libvpx.js libvpx の置換後 `ARFLAGS = rus\$(if \$(quiet),c,v)`
* 最新の libvpx `ARFLAGS = -crs\$(if \$(quiet),,v)`
* llvm-ar 使う上で `-` をつけるかどうかの問題っぽい

```sh[build.sh]
#!/bin/bash
cd ../libvpx
exported_functions="['_vpx_codec_version_str', '_vpx_codec_dec_init_ver', '_vpx_codec_enc_init_ver', '_vpx_codec_vp8_dx', '_vpx_codec_vp9_dx', '_vpx_codec_iface_name', '_vpx_codec_err_to_string', '_vpx_codec_error_detail', '_vpx_codec_error', '_vpx_codec_decode', '_vpx_codec_get_frame', '_vpx_codec_vp8_cx', '_vpx_codec_encode', '_vpx_codec_get_cx_data', '_vpx_img_alloc']"
emmake make && emcc -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS="$exported_functions" libvpx.a --post-js ../vpx.js/epilogue.libvpx.js -o libvpx.js
cp libvpx.js ../vpx.js/
cp libvpx.js.map ../vpx.js/
cd -
```

* epilogue.libvpx.js これ重要、 js とのインターフェース定義
* 結局 emconfigure, emmake って何するの？
  * configure の中に emcc が出てきたときにパスを解決するっぽい

### epilogue.libvpx.js

```js[epilogue.libvpx.js]
Module['vpx_codec_version_str'] = Module.cwrap('vpx_codec_version_str', 'string');
```

```c[vpx/vpx_codec.h]
const char *vpx_codec_version_str(void)
```

* `exported_functions="['_vpx_codec_version_str']"` を `function vpx_codec_version_str(): string` なる JS 関数に変更している
* Module は `window.Module`
* https://bitbucket.org/desmaj/libvpx.js/src/1ea3218282b6eb129061341831d23409dd539054/examples/browser/encode.js?at=default&fileviewer=file-view-default も合わせてよむ


## 現在の知見

https://chromium.googlesource.com/webm/libvpx/+/904b957ae965bd3d67f15a75cd9db7954f810d33

```patch[configure.patch]
diff --git a/build/make/configure.sh b/build/make/configure.sh
index ac60f50..f95dbdc 100644
--- a/build/make/configure.sh
+++ b/build/make/configure.sh
@@ -456,7 +456,7 @@ NM=${NM}
 
 CFLAGS  = ${CFLAGS}
 CXXFLAGS  = ${CXXFLAGS}
-ARFLAGS = -crs\$(if \$(quiet),,v)
+ARFLAGS = crs\$(if \$(quiet),,v)
 LDFLAGS = ${LDFLAGS}
 ASFLAGS = ${ASFLAGS}
 extralibs = ${extralibs}
@@ -1337,6 +1337,22 @@ EOF
           ;;
       esac
       ;;
+    asmjs-unknown-emscripten)
+      # echo "@ " $toolchain " = asmjs-unknown-emscripten""
+      # echo "@ " $tgt_isa "-" $tgt_os "-" $tgt_cc
+      CC=emcc
+      LD=llvm-link
+      AR=llvm-ar
+      AS=llvm-as
+      NM=llvm-nm
+      tune_cflags=""
+      tune_asflags=""
+      add_cflags -emit-llvm
+      #add_ldflags
+      #add_asflags 
+      disabled multithread
+      HAVE_GNU_STRIP=no
+      ;;
     *-gcc|generic-gnu)
       link_with_cc=gcc
       enable_feature gcc
diff --git a/configure b/configure
index 379c2f4..deb0965 100755
--- a/configure
+++ b/configure
@@ -155,6 +155,7 @@ all_platforms="${all_platforms} x86_64-win64-vs11"
 all_platforms="${all_platforms} x86_64-win64-vs12"
 all_platforms="${all_platforms} x86_64-win64-vs14"
 all_platforms="${all_platforms} generic-gnu"
+all_platforms="${all_platforms} asmjs-unknown-emscripten"
 
 # all_targets is a list of all targets that can be configured
 # note that these should be in dependency order for now.
```


```
patch -p1 -i ./configure.patch
source /path/to/emsdk_env.sh
emsdk activate latest
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
  --disable-vp8_encoder \
  --target=asmjs-unknown-emscripten \
  --extra-cflags="-O2"
emmake make
exported_functions="['_vpx_codec_version_str', '_vpx_codec_dec_init_ver', '_vpx_codec_enc_init_ver', '_vpx_codec_vp8_dx', '_vpx_codec_iface_name', '_vpx_codec_err_to_string', '_vpx_codec_error_detail', '_vpx_codec_error', '_vpx_codec_decode', '_vpx_codec_get_frame', '_vpx_codec_encode', '_vpx_codec_get_cx_data', '_vpx_img_alloc']"
emcc \
  -O2 \
  -s ASM_JS=1 \
  -s SIDE_MODULE \
  -s EXPORTED_FUNCTIONS="$exported_functions" \
  --pre-js ./libvpx.pre.js \
  --post-js ./libvpx.post.js \
  libvpx.a \
  -o libvpx.js
# -O1 
# -O2 の代わりに -s ALLOW_MEMORY_GROWTH=1 が必要かもしれない
# --post-js ./libvpx.post.js が必要
```



# emsdk_protable/emscripten/incoming/site/source/

* ここにドキュメントがある


## 共有ライブラリとか
* satoriya-shiori/satoriya/satori/makefile.emscripten
* `# CXXFLAGSは必要無ければ空でも良いが、LDFLAGSはdlopen可能なライブラリを作れる設定にしなければならない。darwinなら-bundle、LinuxやBSDなら-shared`
* `CXXFLAGS = -O2 -Wall -std=c++11 -fPIC`
  * `-fPIC -shared` は UNIX 環境での共有ライブラリの設定なので emscripten には関係ない
* -s MAIN\_MODULE -s SIDE_MODULE って何？ 
  * SIDE\_MODULE - 最低限のasmjsしか含まない。 MAIN_MODULE から読んで、その中にある emscripten のコードが必要
    * SIDE\_MODULE は MAIN\_MODULE から `dlopen` するか `Module["dynamicLibraries"]=["path/to/side.js"]` する
      * `emlink.py:    print >> sys.stderr, 'usage: emlink.py [main module] [side module] [output name]`
      * https://github.com/kripken/emscripten/wiki/Linking ここ嫁
  * -s MAIN\_MODULE=2 なる設定があるらしい
* -shared
* --memory-init-file 0
  * -O0 or -O1 link-time optimization flags するとデフォで 0
    * ここでいう link-time はたぶん bc から js へのことだと思うけれども
  * 1 Emit a separate memory initialization file in binary format.
    * `Module.memoryInitializerRequest` するとかなんとか