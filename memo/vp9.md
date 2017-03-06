
* Iframe Pframe Bframe - http://aviutl.info/keyframe/
* wikipedia https://commons.wikimedia.org/wiki/VP9
* ffmpeg option - http://agehatype0.blog50.fc2.com/blog-category-4.html
* ffmpeg usage - https://trac.ffmpeg.org/wiki/Debug/MacroblocksAndMotionVectors
* vp9 visualizer - http://www.streameye.elecard.com/
* vp9 bit stream format - https://storage.googleapis.com/downloads.webmproject.org/docs/vp9/vp9-bitstream-specification-v0.6-20160331-draft.pdf
  * VP9 takes advantage of these cases by using inter blocks. __An inter block contains a motion vector__ that specifies the __offset in the previous frame__ of the part of the image to use as a prediction for this block. So, for example, __still blocks will be represented by a zero motion vector__. The __motion vector contains information about both a vertical and horizontal offset__ to allow for both types of movement.
  * inter block 
* draft - http://downloads.webmproject.org/docs/vp9/vp9-bitstream_superframe-and-uncompressed-header_v1.0.pdf
* libvpx - https://chromium.googlesource.com/webm/libvpx/+/v1.6.1
* codecvisa - http://www.codecian.com/codecvisa.html
  * high precision motion vector
  * Block Structures
  * I/P/B block
* libvpx build - http://wiki.webmproject.org/ffmpeg/building-with-libvpx
* overview of vp9 - https://blogs.gnome.org/rbultje/2016/12/13/overview-of-the-vp9-video-codec/
* How VP9 works, technical details & diagrams - https://forum.doom9.org/showthread.php?t=168947
  * inter prediction - https://forum.doom9.org/showthread.php?p=1647087#post1647087
* inter prediction とか - http://www.sharp.co.jp/corporate/rd/25/pdf/90_05.pdf https://www.jstage.jst.go.jp/article/itej/67/3/67_240/_pdf
* ffmpeg.js - https://github.com/Kagami/ffmpeg.js/tree/master

## 訳出

### VP9について

https://forum.doom9.org/showthread.php?p=1647087#post1647087

* YUV 4:2:0 (full chroma subsampling) のみサポート
  * YUV 色空間 - https://ja.wikipedia.org/wiki/YUV
  * HEVC - http://www.soumu.go.jp/main_content/000230399.pdf
  * YUV (Y=luma/brightness, U/V=blue/red chroma difference)
  * 圧縮視点からYUVを魅力的にする理由は、ほとんどのエネルギーが輝度面(Y)に集中し、圧縮技術の焦点を私たちに提供することです。
  * また、我々の目は、輝度歪みよりも色の歪みに対して知覚されにくいので、彩度平面は、通常、より低い解像度を有する。 
  * YUV-4：2：0では、彩度平面は輝度平面の幅/高さの半分しかないので、4Kビデオ（3840×2160）の彩度分解能は1920×1080 / 平面
  * 
* 画像分割
  * super blocks (64x64-sized blocks) に分割
  * 左から右、上から下の順に処理される
  * SB は最大 4x4 まで分割できる
  * 細分化は(HEVC/H.265みたいに)再帰的な四分木
    * HEVC = H.265 - https://ja.wikipedia.org/wiki/H.265
  * HEVC とは異なり 垂直 or 水平の二分割もできるが、二分割の場合それ以上分割できない
  * 4x4が最小分割だが多くは8x8分割され mode info Unit になる
  * 8x8 より小さい場合 (8x4,4x8,4x4) は特殊ケースになる
    * 例えば、一対の4×8イントラ符号化ブロックは、2つのイントラモードを有する8×8ブロックのように扱われる
* タイル
  * VP9は、画像がスーパーブロック境界に沿ってタイルのグリッドに分割されるタイルもサポートしています。
  * タイルは 256 pixels 以上 4096 pixels 以下の２のべき乗
  * 4つ以上のタイル行はない
  * タイルは SB と同じく ラスタ順に処理される
  * ピクチャ内のスーパーブロックの順序付けは、タイル構造に依存する。
    * HEVC のタイル分割 - https://www.ituaj.jp/wp-content/uploads/2014/04/2014_05-6_hevc.pdf
    * 並列処理の単位
* コンテナ
  * Webm か IVF
    * ivf - https://wiki.multimedia.cx/index.php?title=IVF
  * コンテナなしではシーク不可能、 start code ないので
* VP9 bitstreams
  * keyframe で始まり、すべてのイントラコードされたブロックやデコーダのイントラ状態はリセットされる
  * デコーダはキーフレームから開始される。その後、任意の数の以前のフレームを参照データとして使うイントラフレームをデコードする
  * VP9 は bool-coder として知られる8ビットの算術符号化エンジンを使って bitstream を圧縮する
  * 確率モデルはフレーム全体で固定。フレームデータのデコードが始まる前に確率はわかっている(HEVC の CABAC のように適応的ではない)
    * cavac エントロピー符号化手法 - http://www.ipsj.or.jp/event/fit/fit2013/program/data/html/event/1-7-4.pdf
  * 確率は1バイトごとで、キーフレームには 1783 バイト,インターフレームには 1902 バイト（筆者の場合
  * 各確率はデフォルト値をもつ
  * フレームコンテキストと呼ばれるものにこれらの確率は格納される
  * デコーダはこれら4つのコンテキストとビットストリームを持つ
  * 各フレームは 3 つのセクションからなる
    * 非圧縮ヘッダ - ピクチャサイズ、ループフィルタの強さなどが含まれています。
    * 圧縮されたヘッダ - フレーム全体に使用される確率を送信するブールコーディングされたセクション。 それらはデフォルト値からの逸脱として送信されます。
    * 圧縮されたフレームデータ - このブール符号化されたデータは、ブロックパーティションサイズ、動きベクトル、イントラモード、および変換係数を含む、フレームを再構成するために必要なデータを含む。
  * VP8とは異なり、データ・パーティショニングはありません。すべてのデータ・タイプは、スーパーブロックのコーディング順序でインターリーブされます。
    * これは、ハードウェア設計者にとってより使いやすい設計の選択肢です。
  * フレームが復号された後、確率は任意に適合させることができる。
  * フレーム復号中の各特定シンボルの発生カウントに基づいて、フレームコンテキストバッファに記憶された新たな確率が導出され、将来のフレームに使用され得る。
* 残差符号化
  * 略。左上からうねうねするやつ。DCTとかしてる
* Intra prediction
  * イントラ予測 - http://www.soumu.go.jp/main_content/000230399.pdf
    * フレーム内符号化されるブロックに対して、符号化済みの隣接ブロックの画素値から予測画像を生成し、原画像との差分を符号化する画面内予測（イントラ予測）
  * イントラ予測 - https://www.ituaj.jp/wp-content/uploads/2014/04/2014_05-6_hevc.pdf
    * 画面内予測とは、上と左隣の再構築済みブロックの画素値から符号化対象ブロックを空間予測する技術である
  * intra frame - https://en.wikipedia.org/wiki/Intra-frame_coding
  * VP9におけるイントラ予測は、AVC / HEVCイントラ予測と同様であり、変換ブロックパーティションに従う。 従って、イントラ予測演算は常に正方形である。 例えば、8×8変換を伴う16×8ブロックは、2つの8×8輝度予測演算をもたらす。
  * 10種類の予測モードがあり、そのうちの8つは指向性(directional)です。
  * 他のコーデックと同様に、イントラ予測では、隣接するブロックの再構成された左上のピクセルと上のピクセルを含む2つの1Dアレイが必要です。
  * 左側の配列は現在のブロックの高さと同じ高さであり、 __上の配列は現在のブロックの幅の2倍__です。
  * しかしながら、4×4より大きいイントラブロックの場合、水平アレイの第2の半分は、単に第1の部分の最後のピクセル（通知値80）から拡張される。(http://i.imgur.com/0n7jgj4.png)
* Inter prediction
  * インター予測 - http://www.soumu.go.jp/main_content/000230399.pdf https://www.ituaj.jp/wp-content/uploads/2014/04/2014_05-6_hevc.pdf
  * inter frame - https://en.wikipedia.org/wiki/Inter_frame
  * VP9のインター予測では、他のほとんどの標準の2倍の1 / 8th pelモーション補償が使用されています。
  * ほとんどの場合、動き補償は単方向であり、ブロックごとに1つの動きベクトルを意味し、双予測は存在しません。
  * しかし、VP9は、実際には、ブロックごとに2つの動きベクトルが存在し、2つの結果として生じる予測サンプルが一緒に平均化される双予測のもう1つの単語である「複合予測」をサポートします。
  * 双方向予測に関する特許を回避するために、複合(compound)予測は、表示不可能とマークされたフレームでのみ有効にされる。
  * このようなフレームは、表示のために出力されることはありませんが、あとで参照するために使用することができます。
  * 実際には、後のフレームは、残余のない64x64ブロックと、この表示されていないフレームを指す0,0の動きベクトルとで構成され、事実上、それは後で非常に少ないデータを用いて出力される。
  * 表示されていないフレームは、VP9ビットストリームをコンテナに入れたときに問題が発生します。
  * これは、コンテナの各「フレーム」が表示可能なフレームになるためです。
  * これを解決するため、VP9ではスーパーフレームの概念が導入されています。
  * スーパーフレームは、単に1つまたは複数の非表示フレームであり、1つの表示可能フレームはすべて、コンテナ内のデータの1つのチャンクとしてまとめられている。
  * したがってデコーダはまだフレームを出力し、内部参照はすべて非表示フレームで更新されます。
  * 動き補償に戻ります。 上述したように、動き補償フィルタは1/8画素精度である
  * さらに、VP9は、各ブロックが3つの動き補償フィルタのうちの1つを選択できる巧妙な新機能を提供します。
    * Normal 8th pel
    * Smooth 8th pel, which lightly smoothes or blurs the prediction
    * Sharp 8th pel, which lightly sharpens the prediction.
  * 動きベクトルは、Last、Golden、またはAltRefとして知られる3つの可能な参照フレーム（以下の参照フレーム管理を参照）の1つを指し示します。
  * これらの名前は単なる名前であり、実際には何も示していません。 
  * lastは最後のフレームである必要はありませんが、通常は参照エンコーダからのストリームが使用されます。
  * 参照フレームは8x8の粒度で適用されるため、たとえばそれぞれ独自のMVを持つ2つの4x8ブロックは常に同じ参照フレームを指します。
  * VP9の動きベクトル予測はかなり複雑です。
  * HEVCと同様に、同じ参照ピクチャを使用する周辺ブロックの8つまでを使用して予測子の2エントリのリストが構築され、その後に時間的プレディクタ（同じ位置の前のフレームからの動きベクトル）が続きます。
  * この検索プロセスがリストを満たさない場合、周囲のブロックが再び検索されますが、今回は参照が一致する必要はありません。
  * 最後に、予測リストがまだ満たされていない場合、0,0ベクトルが推論される。
  * ブロックは、4つの動きベクトルモードのうちの1つを符号化する。
    * New MV – Use the first entry of this prediction list and add in a delta MV, transmitted in the bitstream
    * Nearest MV – use the first entry of this prediction list as is, no delta
    * Near MV – use the second entry of this prediction list as is, no delta
    * Zero MV – simply use 0,0 as the MV value.
* Reference frame management:
* Loop Filter:
  * ノイズ軽減
* Segmentation: 
  * segment ID - セグメントIDは、適応的な量子化/ループフィルタリングを可能にする、フレーム全体のデフォルトとは異なるブロック単位の量子化器および/またはループフィルタ強度レベルを選択することを可能にする。 セグメントIDは、固定参照を符号化することおよび/またはスキップされたブロックをマークすることも可能にする。これは、主に静的コンテンツ/背景に有用である。
  * skip flag - スキップフラグは、ブロックに残差係数がないことを示します（trueの場合）。
  * intra flag - イントラフラグは、どの予測タイプが予測に使用されるかを選択する。(intra or inter
    * イントラフラグが偽である場合、各ブロックは、動きベクトルと呼ばれる指定されたピクセルオフセットで1つまたは2つ前に符号化された参照フレームからピクセルをコピーすることによってピクセル値を予測する。
    * 2つの参照フレームが使用される場合、指定された動きベクトルピクセルオフセットにおける各参照フレームからの予測値は、最終予測子を生成するために平均化される。
    * 動きベクトルは1/8画素までの分解能を有する（すなわち、動きベクトル増分が1であることは、基準において1/8画素オフセットステップを意味する）、動き補償関数は、サブピクセル補間のために8タップフィルタを使用する。
    * 特に、VP9はHEVC / H.264には存在しない選択可能なモーションフィルタをサポートしています。 クロマプレーンは、ルマプレーンと同じ動きベクトルを使用します。
    * VP9では、インターブロックは以下の要素をコード化します。
    * 複合フラグは、予測に使用される参照の数を示します。 falseの場合、このブロックは1つの参照を使用し、trueの場合、このブロックは2つの参照を使用します。
    * the reference selects which reference(s) is/are used from the internal list of 3 active references per frame;
    * インターモードは、動きベクトルがどのようにコード化されるかを指定し、nearestmv、nearmv、zeromvおよびnewmvの4つの値を持つことができます。 
    * Zeromvは動きがないことを意味します。 
    * 他のすべての場合において、ブロックは、近傍のブロックおよび/または前のフレームのこのブロックからの基準動きベクトルのリストを生成する。 
    * インターモードがnearestmvまたはnearmvの場合、このブロックはこのリストの第1または第2の動きベクトルを使用します。 
    * インターモードがnewmvの場合、このブロックは新しい動きベクトルを持ちます。]
    * サブピクセルモーションフィルタは、3つの値を有することができるregular, sharp or smooth。
    * これは、参照フレームからのサブピクセル補間のために使用される8タップのフィルタ係数を定義し、主にオブジェクト間のエッジの出現に影響する。
    * 最後に、インターモードがnewmvである場合、動きベクトル残差が最も近いmv値に加算されて新しい動きベクトルが生成される。
    * 以前の変換/ブロック分解イメージの上にモーションベクトル（シアン、マゼンタ、オレンジを3つのアクティブな参照のそれぞれに使用）をオーバーレイすると、
    * モーションベクトルが本質的に現在のフレームと参照フレーム間のオブジェクトのモーションを記述していることに気付くのは簡単です。
    * パープル/シアンのモーションベクトルは、このフレームの前に（時間的に）1つの参照が配置されているのに対して、このフレームの後に（時間的に）配置されているため、
  * transform size - 最後に、変換サイズは、それを通る残差変換のサイズを定義する
    * 変換サイズの値に応じて、ブロックには複数の変換ブロック（青色）を含めることができます。 変換ブロックを前のブロック分解の上に重ねると、次のようになります。


https://blogs.gnome.org/rbultje/2016/12/13/overview-of-the-vp9-video-codec/


## http://downloads.webmproject.org/docs/vp9/vp9-bitstream_superframe-and-uncompressed-header_v1.0.pdf



を読む限り uncompressed header の intra_frame = false のときに motion vector を含む interframe であるらしい

FrameIsIntra　== 0 のときに compressed header の中に motion vector の情報が入っているらしい

```
read_inter_mode_probs
read_interp_filter_probs
read_is_inter_probs
frame_reference_mode
frame_reference_mode_probs

mv_probs
```


あたりが鍵


```
$ git grep mv_probs
vp9/common/vp9_entropymode.c:  vp9_init_mv_probs(cm);
vp9/common/vp9_entropymv.c:void vp9_adapt_mv_probs(VP9_COMMON *cm, int allow_hp) {
vp9/common/vp9_entropymv.c:void vp9_init_mv_probs(VP9_COMMON *cm) { cm->fc->nmvc = default_nmv_context; }
vp9/common/vp9_entropymv.h:void vp9_init_mv_probs(struct VP9Common *cm);
vp9/common/vp9_entropymv.h:void vp9_adapt_mv_probs(struct VP9Common *cm, int usehp);
vp9/decoder/vp9_decodeframe.c:static void update_mv_probs(vpx_prob *p, int n, vpx_reader *r) {
vp9/decoder/vp9_decodeframe.c:static void read_mv_probs(nmv_context *ctx, int allow_hp, vpx_reader *r) {
vp9/decoder/vp9_decodeframe.c:  update_mv_probs(ctx->joints, MV_JOINTS - 1, r);
vp9/decoder/vp9_decodeframe.c:    update_mv_probs(&comp_ctx->sign, 1, r);
vp9/decoder/vp9_decodeframe.c:    update_mv_probs(comp_ctx->classes, MV_CLASSES - 1, r);
vp9/decoder/vp9_decodeframe.c:    update_mv_probs(comp_ctx->class0, CLASS0_SIZE - 1, r);
vp9/decoder/vp9_decodeframe.c:    update_mv_probs(comp_ctx->bits, MV_OFFSET_BITS, r);
vp9/decoder/vp9_decodeframe.c:      update_mv_probs(comp_ctx->class0_fp[j], MV_FP_SIZE - 1, r);
vp9/decoder/vp9_decodeframe.c:    update_mv_probs(comp_ctx->fp, 3, r);
vp9/decoder/vp9_decodeframe.c:      update_mv_probs(&comp_ctx->class0_hp, 1, r);
vp9/decoder/vp9_decodeframe.c:      update_mv_probs(&comp_ctx->hp, 1, r);
vp9/decoder/vp9_decodeframe.c:    read_mv_probs(nmvc, cm->allow_high_precision_mv, &r);
vp9/decoder/vp9_decodeframe.c:        vp9_adapt_mv_probs(cm, cm->allow_high_precision_mv);
vp9/encoder/vp9_bitstream.c:    vp9_write_nmv_probs(cm, cm->allow_high_precision_mv, &header_bc,
vp9/encoder/vp9_encodemv.c:void vp9_write_nmv_probs(VP9_COMMON *cm, int usehp, vpx_writer *w,
vp9/encoder/vp9_encodemv.h:void vp9_write_nmv_probs(VP9_COMMON *cm, int usehp, vpx_writer *w,
vp9/encoder/vp9_encoder.c:      vp9_adapt_mv_probs(cm, cm->allow_high_precision_mv);
vp9/encoder/vp9_firstpass.c:  vp9_init_mv_probs(cm);
```

* https://storage.googleapis.com/downloads.webmproject.org/docs/vp9/vp9-bitstream-specification-v0.6-20160331-draft.pdf

### 5.6 Superblocks
## 6 Bitstream syntax
### 6.1 Frame syntax
* uncompressed_header
* compressed_header
* decode_tiles

### 6.2 Uncompressed header syntax
* frame_type
* frame_type == KEY_FRAME
  * frame_size
  * FrameIsIntra = 1
* frame_type != KEY_FRAME
  * show_frame == 0
    * intra_only = 1
  * show_frame != 0
    * intra_only = 0
* segmentation_params
* tile_info

### 6.3 Compressed header syntax
* FrameIsIntra == 0
  * mv_probs

#### 6.3.16 MV probs syntax
### 6.4 Decode tiles syntax
* tileCols
  * tileRows
    * decode_tile

#### 6.4.2 Decode tile syntax
* row
  * cols
    * decode_partition

#### 6.4.3 Decode partition syntax
* decode_block
* decode_partition

#### 6.4.4 Decode block syntax
* x
  * y
    * segment_id
    * RefFrames

#### 6.4.5 Mode info syntax
* FrameIsIntra
  * intra_frame_mode_info
* else
  * inter_frame_mode_info

#### 6.4.11 Inter frame mode info syntax
#### 6.4.12 Inter segment id syntax
#### 6.4.16 Inter block mode info syntax
#### 6.4.18 Assign MV syntax
#### 6.4.19 MV syntax
#### 6.4.20 MV component syntax
### 6.5 Motion vector prediction
## 7 Bitstream semantics
### 7.4 Tile level
#### 7.4.13 MV semantics
#### 7.4.14 MV component semantics
## 8 Decoding process
### 8.5 Prediction processes
#### 8.5.2 Inter prediction process
##### 8.5.2.1 Motion vector selection process
##### 8.5.2.2 Motion vector clamping process
##### 8.5.2.3 Motion vector scaling process


## call stack
* vpx_codec_decode -> vpx_codec_ctx_t > vpx_codec_iface_t > vpx_codec_dec_iface > decode
* vpx_codec_ctx > vpx_codec_iface_t
* CODEC_INTERFACE -> vpx_codec_iface_t -> vpx_codec_iface -> vpx_codec_dec_iface -> (vpx_codec_decode_fn_t -> decode ->  decoder_decode, vpx_codec_get_frame_fn_t -> get_frame -> decoder_get_frame)
* decoder_get_frame > vp9_get_raw_frame > vp9_post_proc_frame
* decoder_decode > init_decoder > frame_worker_hook > vp9_receive_compressed_data > vp9_decode_frame
* vp9_decode_frame > decode_tiles > decode_partition > decode_partition > ... > decode_block > vp9_read_mode_info
* vp9_read_mode_info > read_inter_frame_mode_info > (read_inter_segment_id, read_inter_block_mode_info > (read_ref_frames, read_inter_mode, dec_find_mv_refs ) )



```c
VpxVideoReader *reader = NULL;
reader = vpx_video_reader_open(argv[1]);
const VpxVideoInfo *info = NULL;
info = vpx_video_reader_get_info(reader);
const VpxInterface *decoder = NULL;
decoder = get_vpx_decoder_by_fourcc(info->codec_fourcc);
vpx_codec_ctx_t codec;
vpx_codec_dec_init(&codec, decoder->codec_interface(), NULL, 0)
while (vpx_video_reader_read_frame(reader)) {
  size_t frame_size = 0;
  const unsigned char *frame = vpx_video_reader_get_frame(reader, &frame_size);
  vpx_codec_decode(&codec, frame, (unsigned int)frame_size, NULL, 0)
  vpx_image_t *img = NULL;
  while ((img = vpx_codec_get_frame(&codec, &iter)) != NULL) {
    vpx_img_write(img, outfile);
  }
}
vpx_codec_destroy(&codec)
vpx_video_reader_close(reader);
```

## structure 
* VP9Decoder > MACROBLOCKD > intra_only
* VP9Decoder > MACROBLOCKD > VP9_COMMON > cur_frame: RefCntBuffer > mvs: MV_REF > int_mv mv[2]



* https://bitbucket.org/desmaj/libvpx.js/src
  * https://bitbucket.org/desmaj/libvpx.js/src/1ea3218282b6eb129061341831d23409dd539054/configure.patch?at=default&fileviewer=file-view-default
* https://github.com/Kagami/webm.js?utm_source=javascriptweekly&utm_medium=email
  * ffmpeg.js 使用
* https://people.xiph.org/~bens/route9/route9.html
  * http://badassjs.com/post/13551173773/route9js-a-vp8webm-decoder-in-javascript
  * https://github.com/bemasc/Broadway/tree/master/vp8
    * https://github.com/bemasc/Broadway/blob/master/vp8/make.py
    
    
