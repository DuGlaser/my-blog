---
title: goqueryとは？
date: "2019-12-09T22:12:03.284Z"
description: "goでスクレイピングしたいと考え、google先生に質問すると皆こぞってgoqueryを使っています。しかし、goqueryを説明してくれている記事はあまり見当たらなかった為、今回まとめてみました。"
thumbnail: "https://golang.org/doc/gopher/fiveyears.jpg"
---

# はじめに
goでスクレイピングしたいと考え、google先生に質問すると皆こぞってgoqueryを使っています。しかし、goqueryを説明してくれている記事はあまり見当たらなかった為、今回まとめてみました。

> goquery:https://godoc.org/github.com/PuerkitoBio/goquery

## ページを取得する
今回は以下の公式のgoのページにアクセスしてみます!
> https://golang.org/

```go
func main() {
	res, err := http.Get("https://golang.org/")
	if err != nil {
		log.Fatalln(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s\n", res.StatusCode, res.Status)
	}
    	fmt.Println(res)
}
```

実行結果としては200で成功しています。

```txt:実行結果
&{200 OK 200 HTTP/2.0 2 0 map[Alt-Svc:[quic=":443"; m
a=2592000; v="46,43",h3-Q050=":443"; ma=2592000,h3-Q0
49=":443"; ma=2592000,h3-Q048=":443"; ma=2592000,h3-Q
046=":443"; ma=2592000,h3-Q043=":443"; ma=2592000] Co
ntent-Type:[text/html; charset=utf-8] Date:[Mon, 09 D
ec 2019 03:48:51 GMT] Strict-Transport-Security:[max-
age=31536000; includeSubDomains; preload] Vary:[Accep
t-Encoding] Via:[1.1 google]] 0xc00041a060 -1 [] fals
e true map[] 0xc00010a000 0xc00031f970}
```

ここまではgoの標準packageを使って行っているだけですが、ここからはgoqueryを用いて取得した情報から欲しい情報を取得していきます！

## HTMLのドキュメント取得
goqueryを用いてHTMLのドキュメント取得する方法としては```NewDocumentFromReader```があります

```go 
func main() {
	res, err := http.Get("https://golang.org/")
	if err != nil {
		log.Fatalln(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s\n", res.StatusCode, res.Status)
	}
    
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println(err)
	}
	fmt.Println(doc)
}
```

こちらを実行した結果としては

```
&{0xc0004271d0 <nil> 0xc000136000}
```

こちらは詳しいことはわかりませんが、ひとつ目の返り値である0xc0004271d0はclassや特定のセレクタを検索する時に使用するMethodのFindで使用するようです（間違ってたらすいません）

NewDocumentFromReaderは標準packageであるhtml.Parceを用いてhtmlのドキュメントを取得しているみたいです（ざっくりしすぎ）

また、毎回アクセスせずにページの情報をローカルに記述してそこからHTMLのドキュメントを取得する方法もあるみたいです

```go
fileInfos, _ := ioutil.ReadFile("HTMLのファイルパス")
stringReader := strings.NewReader(string(fileInfos))
doc, err := goquery.NewDocumentFromReader(stringReader)
if err != nil {
    panic(err)
}
```

> 参考元：https://qiita.com/Yaruki00/items/b50e346551690b158a79

## 特定の要素に移動
### find
Findを使うことで自分の知りたい情報に直接アクセスすることができます

![](https://i.imgur.com/w2X2OmV.png)

今回は.Hero-headerの中身を取得してみます

```go
// find
func main() {
	res, err := http.Get("https://golang.org/")
	if err != nil {
		log.Fatalln(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s\n", res.StatusCode, res.Status)
	}
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println(err)
	}

	section := doc.Find(".HomeContainer  .Hero-header")
	text := section.Text()
	fmt.Println(text)
}
```

Find("セレクタを指定")すると条件にあった物を絞れます。またText()とすることで取得されたテキストコンテンツを結合して返します

```txt:結果
      Go is an open source programming language that
makes it easy to build
      simple, reliable, and efficient software.
```

### next

nextは兄弟要素を返します。今回は.HomeSection-headerの兄弟要素である.Playground-popoutを返しました
![](https://i.imgur.com/8g4sOkl.png)

```go
// next
func main() {
	res, err := http.Get("https://golang.org/")
	if err != nil {
		log.Fatalln(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s\n", res.StatusCode, res.Status)
	}
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println(err)
	}

	section := doc.Find(".HomeSection-header")
	section = section.Next()
	text := section.Text()
    }	
```

```txt:結果
Open in PlaygroundRead more >
```

### children
childrenは子要素を返します。
![](https://i.imgur.com/Ovb1EkM.png)

```go
// children
func main() {
	res, err := http.Get("https://golang.org/")
	if err != nil {
		log.Fatalln(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s\n", res.StatusCode, res.Status)
	}
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println(err)
	}

	section := doc.Find(".Playground-headerContainer")
	section = section.Children()
	text := section.Text()
	fmt.Println(text)
}
```

```txt:結果
Try GoOpen in Playground
```

### Prev&Siblings
これらはnextと同じで兄弟要素を取得しますが範囲が少しだけ違います。
したの図のように
* Nextは直後の兄弟要素
* Prevは直前の兄弟要素
* Sliblingsは全ての兄弟要素になります

![](https://i.imgur.com/dBxYluv.png)

### First,Last,Eq,Slice
名前の通りです（雑すぎへん？）

![](https://i.imgur.com/pgslKEP.png)

```go
// First
// 一部省略
section := doc.Find(".Footer-link")
section = section.First()
text := section.Text()
fmt.Println(text)
// 結果:Copyright
```

```go
// Last
// 一部省略
section := doc.Find(".Footer-link")
section = section.Last()
text := section.Text()
fmt.Println(text)
// 結果:Report a website issue
```

```go
// Eq
// 一部省略
//Eqは引数に取った数字の要素を返します
section := doc.Find(".Footer-link")
section = section.Eq(1)
text := section.Text()
fmt.Println(text)
// 結果:Terms of Service
```

```go
// Eq(-1)
// 一部省略
//Eqの引数が-1の時は最後の要素を返します
section := doc.Find(".Footer-link")
section = section.Eq(-1)
text := section.Text()
fmt.Println(text)
// 結果:Report a website issue
```

```go
// Slice
// 一部省略
section := doc.Find(".Footer-link")
section = section.Slice(0,2)
text := section.Text()
fmt.Println(text)
// 結果:CopyrightTerms of Service
```

## 特定の情報をゲット！！
自分のいきたい要素まで到達したらいざ情報を吸い取っていきます！

### Html
欲張りセット。タグも含めて情報をゲットします！
返り値がふたつな事に注意です（ふたつ目はerror）
![](https://i.imgur.com/w2X2OmV.png)

```go
// Html
func main() {
	res, err := http.Get("https://golang.org/")
	if err != nil {
		log.Fatalln(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s\n", res.StatusCode, res.Status)
	}
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println(err)
	}

	section := doc.Find(".Hero-header")
	text, _ := section.Html()

	fmt.Println(text)
}
```

```txt:結果
      Go is an open source programming language that
makes it easy to build
      <strong>simple</strong>, <strong>reliable</stro
ng>, and <strong>efficient</strong> software.
```

### Text
上の方でも散々使ったので説明要りませんよね・・・
ただ単に文字だけ取得します

### Attr
特定の属性値を抜き出します（やっとクローラーっぽい・・・）
返り値が二つある事に注意です（ふたつ目は属性値が存在するかのbool値）

```go
// Attr
func main() {
	res, err := http.Get("https://golang.org/")
	if err != nil {
		log.Fatalln(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s\n", res.StatusCode, res.Status)
	}
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Println(err)
	}

	section, _ := doc.Find("iframe").Attr("src")
	fmt.Println(section)
}
```

```txt:結果
https://www.youtube.com/embed/cQ7STILAS0M
```

# 最後に
今回は簡単にgoqueryの説明について書きました。自分で調べながら、これを使えば簡単な画像クローラーくらいはすぐに実装できそうだと感じました。今までフロント側をやってきた身としてはこう言うツールを簡単に実装できるgolangは勉強していてとても楽しいです！
アドベントカレンダーはあと一日分あるので次回はgolangで何かを実装してみたいと思います！！

## サムネイル画像について
> The Go gopher was designed by Renee French.(http://reneefrench.blogspot.com/)
