# 世界創造ツールの残骸

世界創造ツールの残骸です。当該ツールについて詳しいことは以下を参照してください。

- [世界創造ツールの構想](https://www.slideshare.net/tsugehara/ss-13230425)
- [開発Blog](https://tsugehara-wg.hatenadiary.org/)

このバージョンのコードは、どうも標高の計算しか入ってないようです（構造だけはいろいろあるので、多分地球儀化するために緯度経度だけ持ってきて、THREE.jsとくっつけて遊んでいた頃のものだと思われます）。

温度や森林、風や海流、種族の生成や詳細マップ等、もう少しいろいろなトピックがあったはずですが・・

## 使い方

以下を実行すれば http://localhost:3000 にサーバが立つので見ることができます。

```bash
npm i
npm start
```

http://localhost:3000/map.html を実行すると、緯度経度計算だけでそれっぽい事をやっている様子を確認できます。

## ソースコード等

強烈に古いので見る価値はないのですが、 `ts/world.ts` が本体のようです。

標高はAltitudeというクラスが担当しており、Altitudeは無数のUpperMachine（標高を上げる機械）とDownerMachine（標高を下げる機械）によって標高を計算しているようです。

コードがちょっとばっちい感じしますが、15%くらいの確率でマシンを消滅させ、それ以外の場合はマシンの影響力を上げ、上がった影響力に応じて点だけでなく周辺にも影響させる事で、山の隆起などを疑似的にシミュレートしている様子は何かの参考になる、かもしれません。

なお、結局結論としてはドーナツでやることになったので、地球儀型のマップの試作はしましたがあきらめた、はずです。

## ライセンス等

MITで。というか好きにして。むしろ誰か続き作って。

世界創造ツールについては、また何か発掘できたらここか、また別の場所に配置しておきます。

js/three.js以下は[THREE.js](https://threejs.org/)なのでそこだけ気をつけてもらえれば。