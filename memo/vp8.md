コールスタック
* simple_decoder.h: vpx_codec_decode(&codec, frame, (unsigned int)frame_size, NULL, 0)
  * vpx_decoder.c: vpx_codec_err_t vpx_codec_decode(vpx_codec_ctx_t *ctx, const uint8_t *data, unsigned int data_sz, void *user_priv, long deadline)
    * ctx->iface->dec.decode(get_alg_priv(ctx), data, data_sz, user_priv, deadline);
    
* vp8/vp8_dx_iface.c: vpx_codec_decode_fn_t  decode -> CODEC_INTERFACE(vpx_codec_vp8_dx){ vp8_decode }
* vp8/vp8_dx_iface.c: vp8_decode > vp8dx_receive_compressed_data > vp8_decode_frame > vp8_decode_mode_mvs > decode_mb_mode_mvs > read_mb_features
  * static vpx_codec_err_t vp8_decode(vpx_codec_alg_priv_t *ctx, const uint8_t *data, unsigned int data_sz, void *user_priv, long deadline)
  
* decode_mb_mode_mvs > read_mb_features
* decode_mb_mode_mvs > read_mb_modes_mv
* read_mb_modes_mv
  * vp8_clamp_mv2
  * mv_bias
  * decode_split_mv
  * vp8_check_mv_bounds
  
構造体

vpx_codec_priv->yv12_frame_buffers->pbi[]->mb_row_di->mbd-> mode_info_context->modeinfo->mbmi->mv->row,col

* vpx_codec_alg_priv -> vpx_codec_priv
  * struct vpx_codec_alg_priv {}
    * struct frame_buffers yv12_frame_buffers;
* frame_buffers
  * struct VP8D_COMP *pbi[MAX_FB_MT_DEC];
* onyxd_int.h: struct VP8D_COMP {} VP8D_COMP;
  * MB_ROW_DEC *mb_row_di;
    * typedef struct { MACROBLOCKD mbd; } MB_ROW_DEC;
* vp8/common/onyxc_int.h typedef struct VP8Common {} VP8_COMMON;

* vp8/common/blockd.h: struct macroblockd {} MACROBLOCKD;
  * /* 16 Y blocks, 4 U, 4 V, 1 DC 2nd order block, each with 16 entries. */
  * BLOCKD block[25];
  * MODE_INFO *mode_info_context;
    * typedef struct modeinfo {} MODE_INFO;
      * MB_MODE_INFO mbmi;
        * struct {} MB_MODE_INFO
          * uint8_t mode, uv_mode;
          * uint8_t ref_frame;
          * int_mv mv;
            * typedef union int_mv {} int_mv;
              * uint32_t as_int;
              * MV as_mv;
                * typedef struct {} MV;
                   * short row;
                   * short col;
      * union b_mode_info bmi[16];
  * FRAME_TYPE frame_type;


## 備考
* MB はマクロブロックの意味らしい - http://blog.livedoor.jp/abars/archives/51844570.html
  * macroblock - https://en.wikipedia.org/wiki/Macroblock

## inside vp8 - http://blog.webmproject.org/2010/07/inside-webm-technology-vp8-intra-and.html
まず、いくつかの背景。 ビデオフレームを符号化するために、VP8のようなブロックベースのコーデックは、まずフレームをマクロブロックと呼ばれるより小さなセグメントに分割する。 各マクロブロック内で、エンコーダは、以前に処理されたブロックに基づいて冗長な動きおよび色情報を予測することができる。 冗長データをブロックから減算することができ、より効率的な圧縮が可能になります。

各マクロブロックの圧縮方式は intra mode (画面内予測) か inter mode () のどちらかで圧縮される

VP8エンコーダは、次の2つのクラスの予測を使用します。イントラ予測は、単一のビデオフレーム内のデータを使用する. インター予測は、以前に符号化されたフレームからのデータを使用する. 

* Inter_frame - https://en.wikipedia.org/wiki/Inter_frame
  * 参照フレームとターゲットフレームの最も一致する部分の移動ベクトルとその差分で記述する 
  * p-frame と b-frame と I-frame に分かれる - https://en.wikipedia.org/wiki/Inter_frame
    * I-frame - Intra-coded pictures (フレーム内で完結している)
    * Pフレームは、前方予測ピクチャを定義するための名前である。 予測は、より少ない符号化データ（Iフレームサイズと比較して約50％）を必要とすることなく、以前の画像、主にIフレームから行われる。この予測を行うために必要なデータの量は、動きベクトルと予測補正を記述する変換係数とからなる。 それは動き補償の使用を伴う。
    * Bフレームは、双方向予測ピクチャの用語です。 この種の予測方法は、Iフレームサイズと比較してPフレーム（Iフレームサイズと比較して約25％）よりも少ない符号化データを占有する。なぜなら、これらの予測方法は、より早期および/または後のフレームから予測または補間することができるからである。 Pフレームと同様に、Bフレームは、動きベクトルおよび変換係数として表される。 増大する伝播エラーを回避するために、Bフレームは、ほとんどの符号化標準においてさらなる予測を行うための参照として使用されない。 しかしながら、より新しい符号化方法（例えばAVC）では、Bフレームを参照として使用することができる。
    
## intra prediction

VP8イントラ予測モードは、3種類のマクロブロックで使用されます。

* 4x4 luma
* 16x16 luma
* 8x8 chroma

4つの共通イントラ予測モードは、これらのマクロブロックによって共有される。

* H_PRED（水平予測）。 ブロックの各列を左列Lのコピーで埋めます。
* V_PRED（垂直予測）。 ブロックの各行を上記の行Aのコピーで埋めます。
* DC_PRED（DC予測）。 Aより上の行のピクセルの平均とLの左の列の平均を使用して、ブロックを1つの値で塗りつぶします。
* TM_PRED（TrueMotion予測）。 On2 Technologiesによって開発された圧縮技術からその名前を取得するモード。 行Aおよび列Lに加えて、TM_PREDは、ブロックの上および左にピクセルPを使用する。 Aのピクセル間の水平方向の差（Pから始まる）は、Lからのピクセルを使用して伝播され、各行が開始されます。


4×4ルマブロックの場合、V_PREDおよびH_PREDに類似した6つの追加のイントラモードが存在するが、異なる方向のピクセルを予測することに対応する。 これらのモードはこの記事の範囲外ですが、詳細はVP8ビットストリームガイドを参照してください。

前述のように、TM_PREDモードはVP8に固有です。 次の図は、TM_PREDモードがどのように機能するかを示すために4x4ピクセルのブロックを使用しています

ここで、C、AsおよびLsは、前に符号化されたブロックからの再構成画素値を表し、X00からX33は、現ブロックの予測値を表す。 TM_PREDは、次の式を使用してXijを計算します。

上記の例では4x4ブロックを使用していますが、8x8ブロックと16x16ブロックのTM_PREDモードも同じ方法で動作します。
TM_PREDは、VP8でより頻繁に使用されるイントラ予測モードの1つであり、一般的なビデオシーケンスでは、イントラ符号化されるすべてのブロックの20％〜45％で使用されます。 全体的に、他のイントラ予測モードと共に、TM_PREDはVP8が特にイントラモードを使用できるキーフレーム（非常に本質的にキーフレームは以前に符号化されたフレームを参照することができない）に対して非常に良好な圧縮効率を達成するのに役立つ。

## inter prediction

VP8では、インター予測モードはインターフレーム（非キーフレーム）でのみ使用されます。 いずれのVP8インターフレームに対しても、典型的には、予測のために使用され得る3つの以前に符号化された基準フレームが存在する。 典型的なインター予測ブロックは、3つのフレームのうちの1つからブロックをコピーするために動きベクトルを使用して構築される。 動きベクトルは、コピーされる画素ブロックの位置を指し示す。 ほとんどのビデオ圧縮方式では、ビットのかなりの部分が動きベクトルの符号化に費やされる。 この部分は、より低いデータレートで符号化されたビデオに対して特に大きくなり得る。

以前のVPxコーデックと同様に、VP8は隣接するマクロブロック（マクロブロックには1つの16×16ルマブロックと2つの8×8クロマブロックを含む）からベクトルを再利用することにより、動きベクトルを非常に効率的に符号化します。 VP8は、インター予測モードの全体的な設計において同様の戦略を使用します。 例えば、予測モード「NEAREST」および「NEAR」は、隣接するマクロブロックからの最後および第2の最後の非ゼロの動きベクトルを利用する。 これらのインター予測モードは、3つの異なる参照フレームのいずれかと組み合わせて使用することができる。

さらに、VP8は、SPLITMVと呼ばれる非常に洗練された柔軟なインター予測モードを備えています。 このモードは、より良いインター予測を達成するために、マクロブロックのサブブロックへの柔軟な分割を可能にするように設計されています。 SPLITMVは、マクロブロック内のオブジェクトの動き特性が異なる場合に非常に便利です。 SPLITMVモードを使用して符号化されたマクロブロック内で、各サブブロックはそれ自体の動きベクトルを有することができる。 サブブロックは、マクロブロックレベルで動きベクトルを再利用する戦略と同様に、現在のブロックの上または左の隣接するサブブロックからの動きベクトルを使用することもできる。 この戦略は非常に柔軟であり、サブマクロブロック分割のあらゆる形状を効果的に符号化することができ、効率的に行うことができる。 16x4ルミナピクセルを16x4x4ブロックに分割したマクロブロックの例を次に示します。

Newは新しい動きベクトルでコード化された4x4ブロックを表し、LeftおよびAboveはそれぞれ左から上の動きベクトルを用いてコード化された4x4ブロックを表す。 この例では、16×16マクロブロックを、3つの異なる動きベクトル（1,2,3で表す）を有する3つの異なるセグメントに効果的に分割する。

イントラ予測モードとインター予測モードを効果的に使用することにより、WebMエンコーダの実装では、広範囲のソース素材で優れた圧縮品質を実現できます。 さらにVP8予測モードを詳しく調べたい場合は、VP8 Bitstream Guideを読んだり、VP8ソースツリーのreconintra.cとrdopt.cファイルを調べてください。


# VP8 Data Format and Decoding Guide - https://tools.ietf.org/html/rfc6386

## 2.  Format Overview
内部的に、VP8は各出力フレームをマクロブロックの配列に分解します。 マクロブロックは、Y次元が16×16であり、UおよびV次元が8×8であるピクセルの正方配列である。 圧縮されたフレーム内のマクロブロックレベルのデータは、フレームを構成するピクセルのものと同様のラスタ順序で発生する（処理されなければならない）。

マクロブロックはさらに4×4サブブロックに分解される。 すべてのマクロブロックには、16個のYサブブロック、4個のUサブブロック、および4個のVサブブロックがあります。 すべてのサブブロックレベルのデータ（およびそのようなデータの処理）は、ラスター順に再び発生します。今回は、マクロブロック内のラスター順に行われます。

以下でさらに詳細に説明するように、データは、両方のマクロブロックおよびそれらのサブブロックのレベルで指定することができる。

ピクセルは、VP8アルゴリズムの「アトム」と考えることができるサブブロックのレベルで、常に最小限に処理されます。 特に、4×4のYサブブロックに対応する2×2クロマブロックは、データフォーマットまたはアルゴリズム仕様において明示的に扱われることは決してない。

DCTとWHTは常に4x4解像度で動作します。 DCTは、16Y、4U、および4Vのサブブロックに使用されます。 WHTは、マクロブロックの16個のYサブブロックの平均強度を含む4×4アレイを符号化するために（すべてではないが一部のモードで）使用される。 これらの平均強度は、一定の正規化係数までは、Yサブブロックの0番目のDCT係数である。 この「高レベル」WHTは、サブブロックを構成する画素値の指定をサブブロックのDCTと置き換えたのとまったく同じ方法で、これらの係数の明示的な指定の代用である。 この4x4配列をY2という2次のサブブロックと見なし、マクロブロックに24個の "実際の"サブブロックと、時には25番目の "仮想"サブブロックが含まれていると考えます。 これは第13節でさらに扱われる。

リファレンスデコーダで使用されるフレームレイアウトは、vpx_image.hファイル（セクション20.23）にあります。

## 16.  Interframe Macroblock Prediction Records

我々は、フレーム間のマクロブロックの予測記録のレイアウトとセマンティクスについて述べる


フィーチャ仕様（10章で説明され、フレーム内およびフレーム間で同一である）の後、真とイントラ予測（すなわち、イントラ予測とイントラ予測）が実行されたときのインター予測 現在のフレームの既に符号化された部分からの予測）。 ゼロ確率prob_intraは、フレームヘッダのフィールドJによって設定される。

### 16.1.  Intra-Predicted Macroblocks

イントラ予測の場合、予測データのレイアウトはキーフレームのレイアウトと本質的に同じですが、デコード処理で使用されるコンテキストはわずかに異なります。

セクション8で説明したように、ここでの「外部」Yモードは、キーフレームで使用されているものとは異なるツリーを使用しています。

```c
   const tree_index ymode_tree [2 * (num_ymodes - 1)] =
   {
    -DC_PRED, 2,           /* root: DC_PRED = "0", "1" subtree */
     4, 6,                 /* "1" subtree has 2 descendant subtrees */
      -V_PRED, -H_PRED,    /* "10" subtree:  V_PRED = "100",
                              H_PRED = "101" */
      -TM_PRED, -B_PRED    /* "11" subtree:  TM_PRED = "110",
                              B_PRED = "111" */
   };
```

このツリーを解読するために使用される確率テーブルは可変である。 セクション11で説明したように、（同様に処理されたUVテーブルと共に）フレームヘッダーのフィールドJによって更新することができます。 係数復号確率と同様に、そのような更新は累積的であり、次のキーフレームまたは明示的な更新まで、続くすべてのフレームに影響を及ぼす。 YテーブルとUVテーブルの既定の確率は次のとおりです。

```c
   Prob ymode_prob [num_ymodes - 1] = { 112, 86, 140, 37};
   Prob uv_mode_prob [num_uv_modes - 1] = { 162, 101, 204};
```

これらのデフォルト値は、キーフレームの検出後に復元する必要があります。

キーフレームの場合と同様に、YモードがB_PREDである場合、次に、16個のYサブブロックのそれぞれによって使用されるintra_bpredモードの符号化が行われる。 これらのエンコーディングは、キーフレームと同じツリーを使用しますが、キーフレームで使用されるコンテキストの代わりに、単一の固定確率テーブルを使用します。

```c
   const Prob bmode_prob [num_intra_bmodes - 1] = {
       120, 90, 79, 133, 87, 85, 80, 111, 151
   };
```

最後にキーフレームに使用されているツリーと同じツリーを使用してコード化されたクロマモードに戻ります。今回は、前述の動的uv_mode_probテーブルを使用します。

イントラ予測バッファの計算は、セクション12のキーフレームで説明したものと同じです。


### 16.2.  Inter-Predicted Macroblocks

さもなければ（上記のブールが真であるとき）、私たちはインター予測を使用しています（これはインターフレームでのみ起こります）。

次のデータは、参照フレームを選択する別のブールB（prob_last）です。 0の場合、参照フレームは前のフレーム（最後のフレーム）です。 1ならば、別のbool（prob_gf）はゴールデンフレーム（0）とaltrefフレーム（1）の間の参照フレームを選択する。 確率prob_lastおよびprob_gfは、フレームヘッダのフィールドJに設定される。

インターモード復号化の目的は、参照フレームを設定すると共に、現在のマクロブロックの16個のYサブブロックの各々について動きベクトルを設定することである。 これらの設定はインター予測バッファ（セクション18で詳述）の計算を定義します。 インターモードデコードの正味の効果は簡単ですが、実装はやや複雑です。 この方法によって達成される（可逆の）圧縮は、複雑さを正当化する。

参照フレームセレクタが来た後、全体としてマクロブロックに適用されるモード（または動きベクトル参照）は、以下の列挙およびツリーを使用して符号化される。 mv_nearest = num_ymodesを設定すると、1つの変数がインター予測モードまたはイントラ予測モードを明白に保持できるようになります。

```c
   typedef enum
   {
       mv_nearest = num_ymodes, /* use "nearest" motion vector
                                   for entire MB */
       mv_near,                 /* use "next nearest" "" */
       mv_zero,                 /* use zero "" */
       mv_new,                  /* use explicit offset from
                                   implicit "" */
       mv_split,                /* use multiple motion vectors */

       num_mv_refs = mv_split + 1 - mv_nearest
   }
   mv_ref;

   const tree_index mv_ref_tree [2 * (num_mv_refs - 1)] =
   {
    -mv_zero, 2,                /* zero = "0" */
     -mv_nearest, 4,            /* nearest = "10" */
      -mv_near, 6,              /* near = "110" */
        -mv_new, -mv_split      /* new = "1110", split = "1111" */
   };
```

16.3.  Mode and Motion Vector Contexts

選択されたモードによって使用される3つの基準動きベクトルと共に、mv_refを復号するために使用される確率テーブルは、（最大）3近傍のマクロブロック内の既にデコードされた動きベクトルの調査によって計算される。

 このアルゴリズムは、検索サイトに隣接する別個の動きベクトルのソートされたリストを生成する。 best_mvはスコアが最も高いベクトルです。 mv_nearestはスコアが最も高い非ゼロベクトルです。 mv_nearは、スコアが次に高い非ゼロベクトルです。 SPLITMVモードを使用して符号化された動きベクトルの数は、同じ重み付けを使用してスコアされ、最良の、最も近い、および近いベクトルのスコアで戻される。
 
上、左、左上の3つの隣接マクロブロックが順番に考慮されます。 マクロブロックがイントラ符号化されている場合、何も行われない。 さもなければ、動きベクトルは以前に見出された他の動きベクトルと比較され、それが以前に見られたかどうかを判定し、もしそうであればそのベクトルにその重みを寄与させる。 それ以外の場合は、リスト内に新しいベクトルが入力されます。 上のベクトルと左のベクトルは、左上のベクトルの2倍の重みを持っています。

VP8で使用される多くのコンテキストの場合と同様に、画像の上端または左端付近のマクロブロックは、可視画像の外にあるブロックを参照することができます。 VP8は、左端の左側に0x0の動きベクトルで満たされた1マクロブロックの境界と、上端より上の1マクロブロックの0,0動きベクトルで満たされた境界とを提供する。




このプロセスの大半はC言語で英語よりも簡単に記述されています。 これの参照コードは、modemv.c（セクション20.11）にあります。 参照ベクトル、確率テーブル、およびインター予測モード自体の計算は、以下のように実施される。

```c

   typedef union
   {
       unsigned int as_int;
       MV           as_mv;
   } int_mv;        /* facilitates rapid equality tests */


   static void mv_bias(MODE_INFO *x,int refframe, int_mv *mvp,
     int * ref_frame_sign_bias)
   {
       MV xmv;
       xmv = x->mbmi.mv.as_mv;
       if ( ref_frame_sign_bias[x->mbmi.ref_frame] !=
         ref_frame_sign_bias[refframe] )
       {
           xmv.row*=-1;
           xmv.col*=-1;
       }
       mvp->as_mv = xmv;
   }
```

```
   void vp8_clamp_mv(MV *mv, const MACROBLOCKD *xd)
   {
       if ( mv->col < (xd->mb_to_left_edge - LEFT_TOP_MARGIN) )
           mv->col = xd->mb_to_left_edge - LEFT_TOP_MARGIN;
       else if ( mv->col > xd->mb_to_right_edge + RIGHT_BOTTOM_MARGIN )
           mv->col = xd->mb_to_right_edge + RIGHT_BOTTOM_MARGIN;

       if ( mv->row < (xd->mb_to_top_edge - LEFT_TOP_MARGIN) )
           mv->row = xd->mb_to_top_edge - LEFT_TOP_MARGIN;
       else if ( mv->row > xd->mb_to_bottom_edge + RIGHT_BOTTOM_MARGIN )
           mv->row = xd->mb_to_bottom_edge + RIGHT_BOTTOM_MARGIN;
   }

```

関数vp8_find_near_mvs（）では、ベクトル "nearest"と "near"が対応するモードで使用されます。

ベクトルbest_mvは、明示的に符号化された動きベクトルのベースとして使用される。

戻り値cntの最初の3つのエントリは、「ゼロ」、「最も近い」、「近い」ベクトルの重み付けされたセンサス値です。 最終値は、SPLITMVが隣接するマクロブロックによって使用された程度を示す。 それぞれの場合に可能な限り最大の「重み」値は5です。


```c


   void vp8_find_near_mvs
   (
       MACROBLOCKD *xd,
       const MODE_INFO *here,
       MV *nearest,
       MV *near,
       MV *best_mv,
       int cnt[4],
       int refframe,
       int * ref_frame_sign_bias
   )


   {
       const MODE_INFO *above = here - xd->mode_info_stride;
       const MODE_INFO *left = here - 1;
       const MODE_INFO *aboveleft = above - 1;
       int_mv            near_mvs[4];
       int_mv           *mv = near_mvs;
       int             *cntx = cnt;
       enum {CNT_ZERO, CNT_NEAREST, CNT_NEAR, CNT_SPLITMV};

       /* Zero accumulators */
       mv[0].as_int = mv[1].as_int = mv[2].as_int = 0;
       cnt[0] = cnt[1] = cnt[2] = cnt[3] = 0;

       /* Process above */
       if (above->mbmi.ref_frame != INTRA_FRAME) {
           if (above->mbmi.mv.as_int) {
               (++mv)->as_int = above->mbmi.mv.as_int;
               mv_bias(above, refframe, mv, ref_frame_sign_bias);
               ++cntx;
           }
           *cntx += 2;
       }

       /* Process left */
       if (left->mbmi.ref_frame != INTRA_FRAME) {
           if (left->mbmi.mv.as_int) {
               int_mv this_mv;

               this_mv.as_int = left->mbmi.mv.as_int;
               mv_bias(left, refframe, &this_mv, ref_frame_sign_bias);

               if (this_mv.as_int != mv->as_int) {
                   (++mv)->as_int = this_mv.as_int;
                   ++cntx;
               }
               *cntx += 2;
           } else
               cnt[CNT_ZERO] += 2;
       }

       /* Process above left */
       if (aboveleft->mbmi.ref_frame != INTRA_FRAME) {
           if (aboveleft->mbmi.mv.as_int) {
               int_mv this_mv;

               this_mv.as_int = aboveleft->mbmi.mv.as_int;
               mv_bias(aboveleft, refframe, &this_mv,
                 ref_frame_sign_bias);

               if (this_mv.as_int != mv->as_int) {
                   (++mv)->as_int = this_mv.as_int;
                   ++cntx;
               }
               *cntx += 1;
           } else
               cnt[CNT_ZERO] += 1;
       }

       /* If we have three distinct MVs ... */
       if (cnt[CNT_SPLITMV]) {
           /* See if above-left MV can be merged with NEAREST */
           if (mv->as_int == near_mvs[CNT_NEAREST].as_int)
               cnt[CNT_NEAREST] += 1;
       }

       cnt[CNT_SPLITMV] = ((above->mbmi.mode == SPLITMV)
                            + (left->mbmi.mode == SPLITMV)) * 2
                           + (aboveleft->mbmi.mode == SPLITMV);

       /* Swap near and nearest if necessary */
       if (cnt[CNT_NEAR] > cnt[CNT_NEAREST]) {
           int tmp;
           tmp = cnt[CNT_NEAREST];
           cnt[CNT_NEAREST] = cnt[CNT_NEAR];
           cnt[CNT_NEAR] = tmp;
           tmp = near_mvs[CNT_NEAREST].as_int;
           near_mvs[CNT_NEAREST].as_int = near_mvs[CNT_NEAR].as_int;
           near_mvs[CNT_NEAR].as_int = tmp;
       }

       /* Use near_mvs[0] to store the "best" MV */
       if (cnt[CNT_NEAREST] >= cnt[CNT_ZERO])
           near_mvs[CNT_ZERO] = near_mvs[CNT_NEAREST];

       /* Set up return values */
       *best_mv = near_mvs[0].as_mv;
       *nearest = near_mvs[CNT_NEAREST].as_mv;
       *near = near_mvs[CNT_NEAR].as_mv;

       vp8_clamp_mv(nearest, xd);
       vp8_clamp_mv(near, xd);
       vp8_clamp_mv(best_mv, xd); //TODO: Move this up before
                                    the copy
   }
```

次いで、mv_ref確率テーブル（mv_ref_p）は、以下のように国勢調査から導出される。

```c
   const int vp8_mode_contexts[6][4] =
   {
     {   7,     1,     1,   143,   },
     {  14,    18,    14,   107,   },
     { 135,    64,    57,    68,   },
     {  60,    56,   128,    65,   },
     { 159,   134,   128,    34,   },
     { 234,   188,   128,    28,   },
   }

```


```c
   vp8_prob *vp8_mv_ref_probs(vp8_prob mv_ref_p[VP8_MVREFS-1],
     int cnt[4])
   {
       mv_ref_p[0] = vp8_mode_contexts [cnt[0]] [0];
       mv_ref_p[1] = vp8_mode_contexts [cnt[1]] [1];
       mv_ref_p[2] = vp8_mode_contexts [cnt[2]] [2];
       mv_ref_p[3] = vp8_mode_contexts [cnt[3]] [3];
       return p;
   }
```

mv_ref_pが確立されると、mv_refは通常通りデコードされます。

```c
     mvr = (mv_ref) treed_read(d, mv_ref_tree, mv_ref_p);
```

最初の4つのインター符号化モードでは、すべてのYサブブロックに対して同じ動きベクトルが使用される。 最初の3つのモードは、暗黙的な動きベクトルを使用します。

* | mv_nearest | vp8_find_near_mvsが返す最も近いベクトルを使用します。 |
* | mv_near | vp8_find_near_mvsが返すnearベクトルを使用します。 |
* | mv_zero | ゼロベクトルを使用します。 すなわち、予測フレーム内の対応するマクロブロックから現在のマクロブロックを予測する。 |
* | NEWMV | このモードの後に、find_near_mvsによって返されたbest_mv参照ベクトルに（コンポーネントごとに）追加され、すべての16のサブブロックに適用される、明示的にコーディングされたモーションベクトル（その形式は次のセクションで説明します）が続きます。 |



### 16.4.  Split Prediction

残りのモード（SPLITMV）は、Y個のサブブロックに複数のベクトルを適用させる。 その直後に、指定されるベクトルの数とサブブロックへの割り当て方法を決定するパーティション指定が続きます。 示された細分化およびコーディングツリーを有する可能な区画は以下の通りである。


```c
   typedef enum
   {
       mv_top_bottom,   /* two pieces {0...7} and {8...15} */
       mv_left_right,   /* {0,1,4,5,8,9,12,13} and
                           {2,3,6,7,10,11,14,15} */
       mv_quarters,    /* {0,1,4,5}, {2,3,6,7}, {8,9,12,13},
                          {10,11,14,15} */
       MV_16,          /* every subblock gets its own vector
                          {0} ... {15} */

       mv_num_partitions
   }
   MVpartition;

   const tree_index mvpartition_tree [2 * (mvnum_partition - 1)] =
   {
    -MV_16, 2,                         /* MV_16 = "0" */
     -mv_quarters, 4,                  /* mv_quarters = "10" */
      -mv_top_bottom, -mv_left_right   /* top_bottom = "110",
                                          left_right = "111" */
   };

```

パーティションは、固定された一定の確率テーブルを使用してデコードされます。

```c
   const Prob mvpartition_probs [mvnum_partition - 1] =
     { 110, 111, 150};
   part = (MVpartition) treed_read(d, mvpartition_tree,
     mvpartition_probs);
```

パーティションが2つ（mv_top_bottomまたはmv_left_rightの場合）、4つ（mv_quartersの場合）、または16（MV_16の場合）サブブロックのインター予測モードになった後。 これらのモードは、パーティションレイアウト（MVパーティションの列挙へのコメントとして与えられる）によって示される順序で発生し、次のようにコード化されます。 （マクロブロックレベルのモードで行われたように、モードの列挙をオフセットして、単一の変数がブロック内モードまたはブロック間モードを明白に保持できるようにします。）

各サブブロックを復号する前に、以下のコードスニペットに示すように、復号ツリーコンテキストが選択される。 コンテキストは、直下の左および上のサブブロック近傍に基づいており、それらが等しいかどうか、ゼロであるか、またはそれらの組み合わせであるかどうかに基づいています。

```c
   typedef enum
   {
       LEFT4x4 = num_intra_bmodes,   /* use already-coded MV to
                                        my left */
       ABOVE4x4,             /* use already-coded MV above me */
       ZERO4x4,              /* use zero MV */
       NEW4x4,               /* explicit offset from "best" */

       num_sub_mv_ref
   };
   sub_mv_ref;

   const tree_index sub_mv_ref_tree [2 * (num_sub_mv_ref - 1)] =
   {
    -LEFT4X4, 2,           /* LEFT = "0" */
     -ABOVE4X4, 4,         /* ABOVE = "10" */
      -ZERO4X4, -NEW4X4    /* ZERO = "110", NEW = "111" */
   };

   /* Choose correct decoding tree context
    * Function parameters are left subblock neighbor MV and above
    * subblock neighbor MV */
   int vp8_mvCont(MV *l, MV*a)
   {
       int lez = (l->row == 0 && l->col == 0);   /* left neighbor
                                                    is zero */
       int aez = (a->row == 0 && a->col == 0);   /* above neighbor
                                                    is zero */
       int lea = (l->row == a->row && l->col == a->col);  /* left
                                neighbor equals above neighbor */

       if (lea && lez)
           return SUBMVREF_LEFT_ABOVE_ZED; /* =4 */

       if (lea)
           return SUBMVREF_LEFT_ABOVE_SAME; /* =3 */

       if (aez)
           return SUBMVREF_ABOVE_ZED; /* =2 */

       if (lez)
           return SUBMVREF_LEFT_ZED; /* =1*/

       return SUBMVREF_NORMAL; /* =0 */
   }

   /* Constant probabilities and decoding procedure. */

   const Prob sub_mv_ref_prob [5][num_sub_mv_ref - 1] = {
       { 147,136,18 },
       { 106,145,1  },
       { 179,121,1  },
       { 223,1  ,34 },
       { 208,1  ,1  }
   };

       sub_ref = (sub_mv_ref) treed_read(d, sub_mv_ref_tree,
         sub_mv_ref_prob[context]);


```

最初の2つのサブ予測モードは、現在のサブセット（すなわち、予測されるサブブロックの集合）の左上隅のサブブロックの上および左にあるブロックによって使用される既に符号化された動きベクトルを単純にコピーする。 これらの予測ブロックは、現在のマクロブロック内にある必要はなく、現在のサブセットがフレームの上端または左端にある場合、フレーム内にある必要はない。 後者の場合、それらの動きベクトルは、イントラ予測されたマクロブロック内のサブブロック動きベクトルと同様に、ゼロとみなされる。 また、このマクロブロック内の予測が正確であることを保証するために、既に復号された現在のマクロブロックのサブセット内にあるすべてのサブブロックは、その動きベクトルが設定されていなければならない。

ZERO4x4はゼロ動きベクトルを使用し、予測フレームからの対応するサブセットを使用して現在のサブセットを予測する。

NEW4x4はNEWMVとまったく同じですが、NEW4x4は現在のサブセットにのみ適用されます。 次に、find_near_mvsへの以前の呼び出しによって返された最良のベクトルに加算された2次元動きベクトルオフセット（次のセクションで説明）が続き、その部分集合に対して有効な動きベクトルが形成されます。

インター予測モードと動きベクトル（次で説明する）の両方の解析は、リファレンスデコーダファイルmodemv.c（セクション20.11）にあります。


## 17.  Motion Vector Decoding

上述したように、動きベクトルは、VP8データストリーム内の2つの場所に現れ、NEWMVモードでマクロブロック全体に適用され、NEW4x4モードでマクロブロックのサブセットに適用される。 両方の場合でベクトルの形式は同じです。

各ベクトルには、垂直成分（行）と水平成分（列）の2つの部分があります。 行と列は別個の符号化確率を使用するが、そうでなければ全く同じように表される。

### 17.1.  Coding of Each Component

各コンポーネントは、Vクォーターピクセルの垂直または水平ルマ変位（およびV 8ピクセルのクロマ変位）を表す符号付き整数Vです。 Vの絶対値は、ゼロでない場合は、ブール値の符号が続きます。Vは-1023と1023、までの間の任意の値をとることができます。

絶対値Aは、その大きさに応じて2つの異なる方法のうちの1つで符号化される。 0 <= A <= 7の場合、Aはツリー符号化され、8≦A≦1023の場合、Aの2進展開のビットは独立したブール確率を用いて符号化される。 Aのコーディングは、どの範囲が有効かを指定するboolで始まります。

動きベクトル成分を復号化するには、19ビットの確率テーブルが必要であり、そのオフセットは、コンポーネントを復号化するために使用される手順と共に、次の通りである。

```c
 typedef enum
   {
       mvpis_short,         /* short (<= 7) vs long (>= 8) */
       MVPsign,             /* sign for non-zero */
       MVPshort,            /* 8 short values = 7-position tree */

       MVPbits = MVPshort + 7,      /* 8 long value bits
                                       w/independent probs */

       MVPcount = MVPbits + 10      /* 19 probabilities in total */
   }
   MVPindices;

   typedef Prob MV_CONTEXT [MVPcount];    /* Decoding spec for
                                             a single component */

   /* Tree used for small absolute values (has expected
      correspondence). */

   const tree_index small_mvtree [2 * (8 - 1)] =
   {
    2, 8,          /* "0" subtree, "1" subtree */
     4, 6,         /* "00" subtree, "01" subtree */
      -0, -1,      /* 0 = "000", 1 = "001" */
      -2, -3,      /* 2 = "010", 3 = "011" */
     10, 12,       /* "10" subtree, "11" subtree */
      -4, -5,      /* 4 = "100", 5 = "101" */
      -6, -7       /* 6 = "110", 7 = "111" */
   };

   /* Read MV component at current decoder position, using
      supplied probs. */

   int read_mvcomponent(bool_decoder *d, const MV_CONTEXT *mvc)
   {
       const Prob * const p = (const Prob *) mvc;

       int A = 0;

       if (read_bool(d, p [mvpis_short]))    /* 8 <= A <= 1023 */
       {
           /* Read bits 0, 1, 2 */

           int i = 0;
           do { A += read_bool(d, p [MVPbits + i]) << i;}
             while (++i < 3);

           /* Read bits 9, 8, 7, 6, 5, 4 */

           i = 9;
           do { A += read_bool(d, p [MVPbits + i]) << i;}
             while (--i > 3);

           /* We know that A >= 8 because it is coded long,
              so if A <= 15, bit 3 is one and is not
              explicitly coded. */

           if (!(A & 0xfff0)  ||  read_bool(d, p [MVPbits + 3]))
               A += 8;
       }
       else    /* 0 <= A <= 7 */
           A = treed_read(d, small_mvtree, p + MVPshort);

       return A && read_bool(r, p [MVPsign]) ?  -A : A;
   }
```

### 17.2.  Probability Updates

デコーダは、行と列のコンポーネントをそれぞれデコードするための2つのMV_CONTEXTの配列を維持する必要があります。 これらのMV_CONTEXTは、キーフレームごとにデフォルトに設定する必要があります。 個々の確率は、更新確率の定数テーブルを使用して（フレームヘッダのフィールドJによって）フレーム毎に更新することができる。 オプションの各アップデートは、形式Bですか？ P（7）、すなわち真であれば7ビットの確率指定が続くブールである。


VP8で使用される他の動的確率と同様に、更新は次のキーフレームまで、または別の更新を介して置き換えられるまで有効です。

具体的には、確率は以下のように管理されるべきである。

```c
ever-changing table of update probabilities for each
      individual probability used in decoding motion vectors. */

   const MV_CONTEXT vp8_mv_update_probs[2] =
   {
     {
       237,
       246,
       253, 253, 254, 254, 254, 254, 254,
       254, 254, 254, 254, 254, 250, 250, 252, 254, 254
     },
     {
       231,
       243,
       245, 253, 254, 254, 254, 254, 254,
       254, 254, 254, 254, 254, 251, 251, 254, 254, 254
     }
   };

   /* Default MV decoding probabilities. */

   const MV_CONTEXT default_mv_context[2] =
   {
     {                       // row
       162,                    // is short
       128,                    // sign
         225, 146, 172, 147, 214,  39, 156,      // short tree
       128, 129, 132,  75, 145, 178, 206, 239, 254, 254 // long bits
     },

     {                       // same for column
       164,                    // is short
       128,
       204, 170, 119, 235, 140, 230, 228,
       128, 130, 130,  74, 148, 180, 203, 236, 254, 254 // long bits

     }
   };

   /* Current MV decoding probabilities, set to above defaults
      every key frame. */

   MV_CONTEXT mvc [2];     /* always row, then column */


   /* Procedure for decoding a complete motion vector. */

   typedef struct { int16 row, col;}  MV;  /* as in previous section */

   MV read_mv(bool_decoder *d)
   {
       MV v;
       v.row = (int16) read_mvcomponent(d, mvc);
       v.col = (int16) read_mvcomponent(d, mvc + 1);
       return v;
   }

   /* Procedure for updating MV decoding probabilities, called
      every interframe with "d" at the appropriate position in
      the frame header. */

   void update_mvcontexts(bool_decoder *d)
   {
       int i = 0;
       do {                      /* component = row, then column */
           const Prob *up = mv_update_probs[i];    /* update probs
                                                      for component */
           Prob *p = mvc[i];                  /* start decode tbl "" */
           Prob * const pstop = p + MVPcount; /* end decode tbl "" */
           do {
               if (read_bool(d, *up++))     /* update this position */
               {
                   const Prob x = read_literal(d, 7);

                   *p = x? x<<1 : 1;
               }
           } while (++p < pstop);              /* next position */
       } while (++i < 2);                      /* next component */
   }
```


これにより、動きベクトル復号化手順の説明、およびそれを用いて、フレーム間マクロブロック予測記録を復号化する手順が完了する。

## 18.  Interframe Prediction

現在のマクロブロック、すなわち、16個のYサブブロックの各々に対する動きベクトルとともに参照フレームであるインター予測仕様が与えられた場合、マクロブロックの予測バッファの計算を説明する。 フレーム再構成は、前述の剰余和（セクション14）およびループフィルタリング（セクション15）のプロセスを介して完了する。

相互予測サブブロックおよびサブピクセル補間の管理は、参照デコーダファイルpredict.c（第20.14節）で見つけることができる。

### 18.1.  Bounds on, and Adjustment of, Motion Vectors


各動きベクトルは、隣接するブロックまたはマクロブロックから差動的に符号化され、唯一のクランプは、参照された動きベクトルが基準フレームバッファ内の有効な位置を表すことを保証することであるので、ブロックまたはマクロブロックについてVP8フォーマット内で、 任意に大きな動きベクトル、入力画像のサイズ+拡張ボーダー領域まで。 実用上の理由から、VP8は、画像サイズに関係なく、動きベクトルサイズ範囲の上限を-4096〜4095フルピクセルに制限します（VP8は、幅と高さの14の生のビットを定義し、16383x16383は可能な最大画像サイズです）。 ビットストリームに準拠したエンコーダおよびデコーダは、この制限を実施しなければならない。

彩度サブブロックに適用された動きベクトルは1/8ピクセルの解像度を有するため、第5章で概説し、以下に詳述される合成ピクセル計算は、輝度サブブロックに対してもこの解像度を使用する。 従って、格納されたルマ動きベクトルはすべて倍加され、各ルマベクトルの各成分は-2046から+2046の範囲の偶数の整数になる。

各彩度サブブロックに適用されるベクトルは、通常の対応において彩度サブブロックと同じ可視領域を占める4つの輝度サブブロックのベクトルを平均することによって計算される。 すなわち、UおよびVブロック0のベクトルは、Yサブブロック{0,1,4,5}に対するベクトルの平均であり、クロマブロック1はYブロック{2,3,6,7}に対応し、クロマブロック 2からYブロック{8,9,12,13}に、クロマブロック3からYブロック{10,11,14,15}に変換する。

詳細には、各彩度サブブロックのベクトルの2つの成分のそれぞれは、対応する輝度ベクトル成分から次のように計算される。

```
   int avg(int c1, int c2, int c3, int c4)
   {
       int s = c1 + c2 + c3 + c4;

       /* The shift divides by 8 (not 4) because chroma pixels
          have twice the diameter of luma pixels.  The handling
          of negative motion vector components is slightly
          cumbersome because, strictly speaking, right shifts
          of negative numbers are not well-defined in C. */

       return s >= 0 ?  (s + 4) >> 3 : -((-s + 4) >> 3);
   }
```
さらに、フレームタグ内のバージョン番号が全画素クロマ動きベクトルのみを指定する場合、ベクトルの両方の成分の小数部分は、以下の擬似コードに示されるように、ゼロに切り捨てられる

（ルミナンスベクトルとクロマベクトルの両方について3ビットの端数を仮定します）。

```c
    x = x & (~7);
       y = y & (~7);
```



このドキュメントの前半では、vp8_clamp_mv（）関数を使用して、フレーム境界内の指定されたマージン内の「最も近い」および「近い」動きベクトル・プレディクタを制限しました。 最終的な動きベクトルが、ストリームから復号された「最良の」プレディクタと差分ベクトルとを組み合わせた後に再びクランプされるNEWMVマクロブロックについて、追加のクランプが実行される。

ただし、SPLITMVマクロブロックの場合、セカンダリクランプは実行されません。これは、SPLITMVマクロブロック内のサブブロックのモーションベクトルがクランピングゾーンの外側を指している可能性があることを意味します。 これらのクランプされていないベクトルは、vp8_mvCont（）関数の後続のサブブロックのモードのデコードツリーコンテキストを決定する際にも使用されます。

### 18.2.  Prediction Subblocks

各サブブロックの予測計算は、以下のようになる。 動きベクトルの小数部分を一時的に無視する（つまり、各成分を符号伝播で3ビット右シフトすることにより "上"または "左"を丸める）、（16×16ルマまたは8×8クロマの原点（左上の位置） ）現在のマクロブロックは、プレディクタ・フレーム（ゴールデン・フレームまたは前のフレームのいずれか）のY、U、またはV平面に原点を与える。

原点が（ルーマまたはクロマ）マクロブロックの左上隅にあることを考慮して、そのサブブロックに関連付けられたピクセル、つまりサブピクセル補間プロセスに関与する可能性のあるピクセルの相対位置を指定する必要があります。 サブブロック

### 18.3.  Sub-Pixel Interpolation


### 18.4.  Filter Properties

 
## 19.  Annex A: Bitstream Syntax

### 19.1.  Uncompressed Data Chunk
* frame_tag - 3byte 
  * key_frame
  * version - bitstream version.
  * show_frame - 現在のフレームが表示されるかどうか
  * first_part_size - 圧縮されていないデータチャンクを除いて、最初のパーティション（制御パーティション）のサイズを決定します。
* if (key_frame)
  * start_code - 0x9d012a
  * horizontal_size_code
  * vertical_size_code

### 19.2.  Frame Header
* segmentation_enabled - このサブセクションは、デフォルトのデコーダ動作に対するセグメント適応調整を実施するための確率および値情報を含む。 このサブセクションのデータは、続くセグメントごとの情報のデコードに使用され、フレーム全体に適用されます。 セグメント適応調整が有効になると、各マクロブロックにセグメントIDが割り当てられます。 同じセグメントIDを持つマクロブロックは同じセグメントに属し、フレームのデフォルトのベースライン値と同じ適応調整を行います。 調整は、量子化レベルまたはループフィルタ強度とすることができる。
* if (segmentation_enabled)
  * update_segmentation()
* if (!key_frame)
  * prob_intra
  * intra_16x16_prob_update_flag
  * mv_prob_update()
    * mv_prob_update_flag - mv_prob_update_flagは、対応するMV復号確率が現フレームで更新されるかどうかを示す
    * prob - is the updated probability

### 19.3.  Macroblock Data
* macroblock_header()
  * if (!key_frame)
    * is_inter_mb 
  * if (is_inter_mb) 
    * mv_mode
    * if (mv_mode == SPLITMV)
      * for (i = 0; i < numMvs; i++) 
        * sub_mv_mode
        * if (sub_mv_mode == NEWMV4x4)
          * read_mvcomponent
          * read_mvcomponent
    * else if (mv_mode == NEWMV)
      * read_mvcomponent
      * read_mvcomponent
  * else /* intra mb */
    * intra_y_mode
    * if (intra_y_mode == B_PRED)
      * intra_b_mode
    * intra_uv_mode
* residual_data()

## VP8のマクロブロックについて

マクロブロックは、Y次元が16×16であり、UおよびV次元が8×8であるピクセルの正方配列である。

マクロブロックはさらに4×4サブブロックに分解される。
すべてのマクロブロックには、16個のYサブブロック、4個のUサブブロック、および4個のVサブブロックがあります。
すべてのサブブロックレベルのデータ（およびそのようなデータの処理）は、ラスタ順に発生します。今回は、マクロブロック内のラスタ順に行われます。

ピクセルは、VP8アルゴリズムの「アトム」と考えることができるサブブロックのレベルで、常に最小限に処理されます。
特に、4×4のYサブブロックに対応する2×2クロマブロックは、データフォーマットまたはアルゴリズム仕様において明示的に扱われることは決してない。

DCTとWHTは常に4x4解像度で動作します。 DCTは、16Y、4U、および4Vのサブブロックに使用されます。 WHTは、マクロブロックの16個のYサブブロックの平均強度を含む4×4アレイを符号化するために（すべてではないが一部のモードで）使用される。 これらの平均強度は、一定の正規化係数までは、Yサブブロックの0番目のDCT係数である。 この「高レベル」WHTは、サブブロックを構成する画素値の指定をサブブロックのDCTと置き換えたのとまったく同じ方法で、これらの係数の明示的な指定の代用である。 この4x4配列をY2という2次のサブブロックと見なし、マクロブロックに24個の "実際の"サブブロックと、時には25番目の "仮想"サブブロックが含まれていると考えます。 これは第13節でさらに扱われる。

* https://tools.ietf.org/html/rfc6386
* https://ja.wikipedia.org/wiki/YUV



# read_mv と decode_macroblock のスタックコール
### examples/simple_decoder.c

```c:simple_decoder.c
int main(int argc, char **argv) {
  int frame_cnt = 0;
  FILE *outfile = NULL;
  vpx_codec_ctx_t codec;
  VpxVideoReader *reader = NULL;
  const VpxInterface *decoder = NULL;
  const VpxVideoInfo *info = NULL;
  ...
  if (vpx_codec_dec_init(&codec, decoder->codec_interface(), NULL, 0))
    die_codec(&codec, "Failed to initialize decoder.");

  while (vpx_video_reader_read_frame(reader)) {
    vpx_codec_iter_t iter = NULL;
    vpx_image_t *img = NULL;
    size_t frame_size = 0;
    const unsigned char *frame =
        vpx_video_reader_get_frame(reader, &frame_size);
    if (vpx_codec_decode(&codec, frame, (unsigned int)frame_size, NULL, 0))
      die_codec(&codec, "Failed to decode frame.");
    ...
  }
  ...
  if (vpx_codec_destroy(&codec)) die_codec(&codec, "Failed to destroy codec");
  ...
}
```

* `vpx_codec_dec_init`
* `vpx_codec_decode`
* `die_codec`
*  で VP8 だけしたい

### vpx/src/vpx_decoder.h

```c:vpx_decoder.h
#define vpx_codec_dec_init(ctx, iface, cfg, flags) \
  vpx_codec_dec_init_ver(ctx, iface, cfg, flags, VPX_DECODER_ABI_VERSION)
```
* `vpx_codec_dec_init` の真の名は `vpx_codec_dec_init_ver`

### vpx/src/vpx_decoder.c

```c:vpx_decoder.c
vpx_codec_err_t vpx_codec_dec_init_ver(vpx_codec_ctx_t *ctx,
                                       vpx_codec_iface_t *iface,
                                       const vpx_codec_dec_cfg_t *cfg,
                                       vpx_codec_flags_t flags, int ver) {
  vpx_codec_err_t res;

  if (ver != VPX_DECODER_ABI_VERSION)
    res = VPX_CODEC_ABI_MISMATCH;
  else if (!ctx || !iface)
    res = VPX_CODEC_INVALID_PARAM;
  else if (iface->abi_version != VPX_CODEC_INTERNAL_ABI_VERSION)
    res = VPX_CODEC_ABI_MISMATCH;
  else if ((flags & VPX_CODEC_USE_POSTPROC) &&
           !(iface->caps & VPX_CODEC_CAP_POSTPROC))
    res = VPX_CODEC_INCAPABLE;
  else if ((flags & VPX_CODEC_USE_ERROR_CONCEALMENT) &&
           !(iface->caps & VPX_CODEC_CAP_ERROR_CONCEALMENT))
    res = VPX_CODEC_INCAPABLE;
  else if ((flags & VPX_CODEC_USE_INPUT_FRAGMENTS) &&
           !(iface->caps & VPX_CODEC_CAP_INPUT_FRAGMENTS))
    res = VPX_CODEC_INCAPABLE;
  else if (!(iface->caps & VPX_CODEC_CAP_DECODER))
    res = VPX_CODEC_INCAPABLE;
  else {
    memset(ctx, 0, sizeof(*ctx));
    ctx->iface = iface;
    ctx->name = iface->name;
    ctx->priv = NULL;
    ctx->init_flags = flags;
    ctx->config.dec = cfg;

    res = ctx->iface->init(ctx, NULL);
    if (res) {
      ctx->err_detail = ctx->priv ? ctx->priv->err_detail : NULL;
      vpx_codec_destroy(ctx);
    }
  }

  return SAVE_STATUS(ctx, res);
}
```

* `vpx_codec_dec_init_ver` の中で呼ばれている `ctx->iface->init(ctx, NULL)` の正体が知りたい


```c:vpx_decoder.c
vpx_codec_err_t vpx_codec_decode(vpx_codec_ctx_t *ctx, const uint8_t *data,
                                 unsigned int data_sz, void *user_priv,
                                 long deadline) {
  vpx_codec_err_t res;

  /* Sanity checks */
  /* NULL data ptr allowed if data_sz is 0 too */
  if (!ctx || (!data && data_sz) || (data && !data_sz))
    res = VPX_CODEC_INVALID_PARAM;
  else if (!ctx->iface || !ctx->priv)
    res = VPX_CODEC_ERROR;
  else {
    res = ctx->iface->dec.decode(get_alg_priv(ctx), data, data_sz, user_priv,
                                 deadline);
  }

  return SAVE_STATUS(ctx, res);
}
```

* `ctx->iface->dec.decode` の正体は誰


### vp8/vp8_dx_iface.c

```c:vp8_dx_iface.c
CODEC_INTERFACE(vpx_codec_vp8_dx) = {
  "WebM Project VP8 Decoder" VERSION_STRING,
  VPX_CODEC_INTERNAL_ABI_VERSION,
  VPX_CODEC_CAP_DECODER | VP8_CAP_POSTPROC | VP8_CAP_ERROR_CONCEALMENT |
      VPX_CODEC_CAP_INPUT_FRAGMENTS,
  /* vpx_codec_caps_t          caps; */
  vp8_init,     /* vpx_codec_init_fn_t       init; */
  vp8_destroy,  /* vpx_codec_destroy_fn_t    destroy; */
  vp8_ctf_maps, /* vpx_codec_ctrl_fn_map_t  *ctrl_maps; */
  {
      vp8_peek_si,   /* vpx_codec_peek_si_fn_t    peek_si; */
      vp8_get_si,    /* vpx_codec_get_si_fn_t     get_si; */
      vp8_decode,    /* vpx_codec_decode_fn_t     decode; */
      vp8_get_frame, /* vpx_codec_frame_get_fn_t  frame_get; */
      NULL,
  },
  {
      /* encoder functions */
      0, NULL, /* vpx_codec_enc_cfg_map_t */
      NULL,    /* vpx_codec_encode_fn_t */
      NULL,    /* vpx_codec_get_cx_data_fn_t */
      NULL,    /* vpx_codec_enc_config_set_fn_t */
      NULL,    /* vpx_codec_get_global_headers_fn_t */
      NULL,    /* vpx_codec_get_preview_frame_fn_t */
      NULL     /* vpx_codec_enc_mr_get_mem_loc_fn_t */
  }
};
```

* `ctx->iface->init` の正体は `vp8_init` だった
* `ctx->iface->dec.decode` の正体は `vp8_decode` だった


```c:vp8_dx_iface.c
static vpx_codec_err_t vp8_init(vpx_codec_ctx_t *ctx,
                                vpx_codec_priv_enc_mr_cfg_t *data) {
  vpx_codec_err_t res = VPX_CODEC_OK;
  (void)data;

  vp8_rtcd();
  vpx_dsp_rtcd();
  vpx_scale_rtcd();

  /* This function only allocates space for the vpx_codec_alg_priv_t
   * structure. More memory may be required at the time the stream
   * information becomes known.
   */
  if (!ctx->priv) {
    vpx_codec_alg_priv_t *priv;

    if (vp8_init_ctx(ctx)) return VPX_CODEC_MEM_ERROR;

    priv = (vpx_codec_alg_priv_t *)ctx->priv;

    /* initialize number of fragments to zero */
    priv->fragments.count = 0;
    /* is input fragments enabled? */
    priv->fragments.enabled =
        (priv->base.init_flags & VPX_CODEC_USE_INPUT_FRAGMENTS);

    /*post processing level initialized to do nothing */
  }

  return res;
}
```

```c:vp8_dx_iface.c
static int vp8_init_ctx(vpx_codec_ctx_t *ctx) {
  vpx_codec_alg_priv_t *priv =
      (vpx_codec_alg_priv_t *)vpx_calloc(1, sizeof(*priv));
  if (!priv) return 1;

  ctx->priv = (vpx_codec_priv_t *)priv;
  ctx->priv->init_flags = ctx->init_flags;

  priv->si.sz = sizeof(priv->si);
  priv->decrypt_cb = NULL;
  priv->decrypt_state = NULL;

  if (ctx->config.dec) {
    /* Update the reference to the config structure to an internal copy. */
    priv->cfg = *ctx->config.dec;
    ctx->config.dec = &priv->cfg;
  }

  return 0;
}
```

* これが VP8 の初期化


```c:vp8_dx_iface.c
static vpx_codec_err_t vp8_decode(vpx_codec_alg_priv_t *ctx,
                                  const uint8_t *data, unsigned int data_sz,
                                  void *user_priv, long deadline) {
  vpx_codec_err_t res = VPX_CODEC_OK;
  unsigned int resolution_change = 0;
  unsigned int w, h;
  w = ctx->si.w;
  h = ctx->si.h;

  res = vp8_peek_si_internal(ctx->fragments.ptrs[0], ctx->fragments.sizes[0],
                             &ctx->si, ctx->decrypt_cb, ctx->decrypt_state);
  if ((res == VPX_CODEC_UNSUP_BITSTREAM) && !ctx->si.is_kf) {
    /* the peek function returns an error for non keyframes, however for
     * this case, it is not an error */
    res = VPX_CODEC_OK;
  }
  ...
  if (!res) {
    VP8D_COMP *pbi = ctx->yv12_frame_buffers.pbi[0];
    ...
    ctx->user_priv = user_priv;
    if (vp8dx_receive_compressed_data(pbi, data_sz, data, deadline)) {
      res = update_error_state(ctx, &pbi->common.error);
    }

    /* get ready for the next series of fragments */
    ctx->fragments.count = 0;
  }

  return res;
}
```

### vp8/decoder/onyxd_if.c

```c:onyxd_if.c
int vp8dx_receive_compressed_data(VP8D_COMP *pbi, size_t size,
                                  const uint8_t *source, int64_t time_stamp) {
  VP8_COMMON *cm = &pbi->common;
  int retcode = -1;
  retcode = vp8_decode_frame(pbi);
}
```

### vp8/decoderdecodeframe.c

```c:decodeframe.c
int vp8_decode_frame(VP8D_COMP *pbi) {
  vp8_reader *const bc = &pbi->mbc[8];
  VP8_COMMON *const pc = &pbi->common;
  MACROBLOCKD *const xd = &pbi->mb;
  const unsigned char *data = pbi->fragments.ptrs[0];
  const unsigned int data_sz = pbi->fragments.sizes[0];
  const unsigned char *data_end = data + data_sz;
  ptrdiff_t first_partition_length_in_bytes;

  ...

  vp8_decode_mode_mvs(pbi);

#if CONFIG_ERROR_CONCEALMENT
  if (pbi->ec_active &&
      pbi->mvs_corrupt_from_mb < (unsigned int)pc->mb_cols * pc->mb_rows) {
    /* Motion vectors are missing in this frame. We will try to estimate
     * them and then continue decoding the frame as usual */
    vp8_estimate_missing_mvs(pbi);
  }
#endif
  memset(pc->above_context, 0, sizeof(ENTROPY_CONTEXT_PLANES) * pc->mb_cols);
  pbi->frame_corrupt_residual = 0;
  {
    decode_mb_rows(pbi);
    corrupt_tokens |= xd->corrupted;
  }

  ...
}
```

```c:decodeframe.c
static void decode_mb_rows(VP8D_COMP *pbi) {
  VP8_COMMON *const pc = &pbi->common;
  MACROBLOCKD *const xd = &pbi->mb;
  ...
  for (mb_row = 0; mb_row < pc->mb_rows; ++mb_row) {
    ...
    for (mb_col = 0; mb_col < pc->mb_cols; ++mb_col) {
      ...
      decode_macroblock(pbi, xd, mb_idx);
      ...
    }
    ...
  }
  ...
}
```

### vp8/decoder/decodemv.c

```c:decodemv.c
void vp8_decode_mode_mvs(VP8D_COMP *pbi) {
  MODE_INFO *mi = pbi->common.mi;
  int mb_row = -1;
  int mb_to_right_edge_start;

  mb_mode_mv_init(pbi);

  pbi->mb.mb_to_top_edge = 0;
  pbi->mb.mb_to_bottom_edge = ((pbi->common.mb_rows - 1) * 16) << 3;
  mb_to_right_edge_start = ((pbi->common.mb_cols - 1) * 16) << 3;

  while (++mb_row < pbi->common.mb_rows) {
    int mb_col = -1;

    pbi->mb.mb_to_left_edge = 0;
    pbi->mb.mb_to_right_edge = mb_to_right_edge_start;

    while (++mb_col < pbi->common.mb_cols) {
#if CONFIG_ERROR_CONCEALMENT
      int mb_num = mb_row * pbi->common.mb_cols + mb_col;
#endif

      decode_mb_mode_mvs(pbi, mi, &mi->mbmi);

#if CONFIG_ERROR_CONCEALMENT
      /* look for corruption. set mvs_corrupt_from_mb to the current
       * mb_num if the frame is corrupt from this macroblock. */
      if (vp8dx_bool_error(&pbi->mbc[8]) &&
          mb_num < (int)pbi->mvs_corrupt_from_mb) {
        pbi->mvs_corrupt_from_mb = mb_num;
        /* no need to continue since the partition is corrupt from
         * here on.
         */
        return;
      }
#endif

      pbi->mb.mb_to_left_edge -= (16 << 3);
      pbi->mb.mb_to_right_edge -= (16 << 3);
      mi++; /* next macroblock */
    }
    pbi->mb.mb_to_top_edge -= (16 << 3);
    pbi->mb.mb_to_bottom_edge -= (16 << 3);

    mi++; /* skip left predictor each row */
  }
}
```


```c:decodemv.c
static void decode_mb_mode_mvs(VP8D_COMP *pbi, MODE_INFO *mi,
                               MB_MODE_INFO *mbmi) {
  (void)mbmi;

  /* Read the Macroblock segmentation map if it is being updated explicitly
   * this frame (reset to 0 above by default)
   * By default on a key frame reset all MBs to segment 0
   */
  if (pbi->mb.update_mb_segmentation_map) {
    read_mb_features(&pbi->mbc[8], &mi->mbmi, &pbi->mb);
  } else if (pbi->common.frame_type == KEY_FRAME) {
    mi->mbmi.segment_id = 0;
  }

  /* Read the macroblock coeff skip flag if this feature is in use,
   * else default to 0 */
  if (pbi->common.mb_no_coeff_skip) {
    mi->mbmi.mb_skip_coeff = vp8_read(&pbi->mbc[8], pbi->prob_skip_false);
  } else {
    mi->mbmi.mb_skip_coeff = 0;
  }

  mi->mbmi.is_4x4 = 0;
  if (pbi->common.frame_type == KEY_FRAME) {
    read_kf_modes(pbi, mi);
  } else {
    read_mb_modes_mv(pbi, mi, &mi->mbmi);
  }
}
```

```c:decodemv.c
static void read_mb_modes_mv(VP8D_COMP *pbi, MODE_INFO *mi,
                             MB_MODE_INFO *mbmi) {
  vp8_reader *const bc = &pbi->mbc[8];
  mbmi->ref_frame = (MV_REFERENCE_FRAME)vp8_read(bc, pbi->prob_intra);
  if (mbmi->ref_frame) /* inter MB */
  {
    enum { CNT_INTRA, CNT_NEAREST, CNT_NEAR, CNT_SPLITMV };
    int cnt[4];
    int *cntx = cnt;
    int_mv near_mvs[4];
    int_mv *nmv = near_mvs;
    const int mis = pbi->mb.mode_info_stride;
    const MODE_INFO *above = mi - mis;
    const MODE_INFO *left = mi - 1;
    const MODE_INFO *aboveleft = above - 1;
    int *ref_frame_sign_bias = pbi->common.ref_frame_sign_bias;

    ...

    /* Process above */
    if (above->mbmi.ref_frame != INTRA_FRAME) {
      if (above->mbmi.mv.as_int) {
      }
    }
    /* Process left */
    if (left->mbmi.ref_frame != INTRA_FRAME) {
      if (left->mbmi.mv.as_int) {
        ...
      } else {
        ...
      }
    }
    /* Process above left */
    if (aboveleft->mbmi.ref_frame != INTRA_FRAME) {
      if (aboveleft->mbmi.mv.as_int) {
        ...
      }else{
      }
    }
    if (vp8_read(bc, vp8_mode_contexts[cnt[CNT_INTRA]][0])) {
      if (vp8_read(bc, vp8_mode_contexts[cnt[CNT_NEAREST]][1])) {
        if (vp8_read(bc, vp8_mode_contexts[cnt[CNT_NEAR]][2])) {
          int mb_to_top_edge;
          int mb_to_bottom_edge;
          int mb_to_left_edge;
          int mb_to_right_edge;
          MV_CONTEXT *const mvc = pbi->common.fc.mvc;
          int near_index;

          mb_to_top_edge = pbi->mb.mb_to_top_edge;
          mb_to_bottom_edge = pbi->mb.mb_to_bottom_edge;
          mb_to_top_edge -= LEFT_TOP_MARGIN;
          mb_to_bottom_edge += RIGHT_BOTTOM_MARGIN;
          mb_to_right_edge = pbi->mb.mb_to_right_edge;
          mb_to_right_edge += RIGHT_BOTTOM_MARGIN;
          mb_to_left_edge = pbi->mb.mb_to_left_edge;
          mb_to_left_edge -= LEFT_TOP_MARGIN;

          /* Use near_mvs[0] to store the "best" MV */
          near_index = CNT_INTRA + (cnt[CNT_NEAREST] >= cnt[CNT_INTRA]);

          vp8_clamp_mv2(&near_mvs[near_index], &pbi->mb);

          cnt[CNT_SPLITMV] =
              ((above->mbmi.mode == SPLITMV) + (left->mbmi.mode == SPLITMV)) *
                  2 +
              (aboveleft->mbmi.mode == SPLITMV);

          if (vp8_read(bc, vp8_mode_contexts[cnt[CNT_SPLITMV]][3])) {
            decode_split_mv(bc, mi, left, above, mbmi, near_mvs[near_index],
                            mvc, mb_to_left_edge, mb_to_right_edge,
                            mb_to_top_edge, mb_to_bottom_edge);
            mbmi->mv.as_int = mi->bmi[15].mv.as_int;
            mbmi->mode = SPLITMV;
            mbmi->is_4x4 = 1;
          } else {
            int_mv *const mbmi_mv = &mbmi->mv;
            read_mv(bc, &mbmi_mv->as_mv, (const MV_CONTEXT *)mvc);
            mbmi_mv->as_mv.row += near_mvs[near_index].as_mv.row;
            mbmi_mv->as_mv.col += near_mvs[near_index].as_mv.col;

            /* Don't need to check this on NEARMV and NEARESTMV
             * modes since those modes clamp the MV. The NEWMV mode
             * does not, so signal to the prediction stage whether
             * special handling may be required.
             */
            mbmi->need_to_clamp_mvs =
                vp8_check_mv_bounds(mbmi_mv, mb_to_left_edge, mb_to_right_edge,
                                    mb_to_top_edge, mb_to_bottom_edge);
            mbmi->mode = NEWMV;
          }
        } else {
          mbmi->mode = NEARMV;
          mbmi->mv.as_int = near_mvs[CNT_NEAR].as_int;
          vp8_clamp_mv2(&mbmi->mv, &pbi->mb);
      } else {
        mbmi->mode = NEARESTMV;
        mbmi->mv.as_int = near_mvs[CNT_NEAREST].as_int;
        vp8_clamp_mv2(&mbmi->mv, &pbi->mb);
      }
    } else {
      mbmi->mode = ZEROMV;
      mbmi->mv.as_int = 0;
    }
```

```c:decodemv.c
static void read_mv(vp8_reader *r, MV *mv, const MV_CONTEXT *mvc) {
  mv->row = (short)(read_mvcomponent(r, mvc) * 2);
  mv->col = (short)(read_mvcomponent(r, ++mvc) * 2);
}
```


# 構造体


### vpx/vpx_codec.h

```c:vpx_codec.h
typedef struct vpx_codec_priv vpx_codec_priv_t;
```

```c:vpx_codec.h
typedef struct vpx_codec_ctx {
  const char *name;             /**< Printable interface name */
  vpx_codec_iface_t *iface;     /**< Interface pointers */
  vpx_codec_err_t err;          /**< Last returned error */
  const char *err_detail;       /**< Detailed info, if available */
  vpx_codec_flags_t init_flags; /**< Flags passed at init time */
  union {
    /**< Decoder Configuration Pointer */
    const struct vpx_codec_dec_cfg *dec;
    /**< Encoder Configuration Pointer */
    const struct vpx_codec_enc_cfg *enc;
    const void *raw;
  } config;               /**< Configuration pointer aliasing union */
  vpx_codec_priv_t *priv; /**< Algorithm private storage */
} vpx_codec_ctx_t;
```

「struct vpx_codec_priv」型のデータ型に「vpx_codec_priv_t」という別名を付けてる

### vpx/internal/vpx_coedc_internal.h
                                        
```c:vpx_coedc_internal.h
typedef struct vpx_codec_alg_priv vpx_codec_alg_priv_t;
```

### vp8/vp8_dx_iface.c

```c:vp8_dx_iface.c
static int vp8_init_ctx(vpx_codec_ctx_t *ctx) {
  vpx_codec_alg_priv_t *priv =
      (vpx_codec_alg_priv_t *)vpx_calloc(1, sizeof(*priv));
  if (!priv) return 1;
  ctx->priv = (vpx_codec_priv_t *)priv;
  ...
  return 0;
}
```

```c:vp8_dx_iface.c
struct vpx_codec_alg_priv {
  vpx_codec_priv_t base;
  vpx_codec_dec_cfg_t cfg;
  vp8_stream_info_t si;
  int decoder_init;
  int postproc_cfg_set;
  vp8_postproc_cfg_t postproc_cfg;
  vpx_decrypt_cb decrypt_cb;
  void *decrypt_state;
  vpx_image_t img;
  int img_setup;
  struct frame_buffers yv12_frame_buffers;
  void *user_priv;
  FRAGMENT_DATA fragments;
};
```

### vp8/decoder/onyxd_int.h

```c:onyxd_int.h
struct frame_buffers {
  /*
   * this struct will be populated with frame buffer management
   * info in future commits. */

  /* decoder instances */
  struct VP8D_COMP *pbi[MAX_FB_MT_DEC];
};
```


```c:onyxd_int.h
typedef struct VP8D_COMP {
  DECLARE_ALIGNED(16, MACROBLOCKD, mb);

  YV12_BUFFER_CONFIG *dec_fb_ref[NUM_YV12_BUFFERS];

  DECLARE_ALIGNED(16, VP8_COMMON, common);

  /* the last partition will be used for the modes/mvs */
  vp8_reader mbc[MAX_PARTITIONS];

  VP8D_CONFIG oxcf;

  FRAGMENT_DATA fragments;

  int64_t last_time_stamp;
  int ready_for_new_data;

  vp8_prob prob_intra;
  vp8_prob prob_last;
  vp8_prob prob_gf;
  vp8_prob prob_skip_false;


  int ec_enabled;
  int ec_active;
  int decoded_key_frame;
  int independent_partitions;
  int frame_corrupt_residual;

  vpx_decrypt_cb decrypt_cb;
  void *decrypt_state;
} VP8D_COMP;
```