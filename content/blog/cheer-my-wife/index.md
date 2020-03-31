---
title: golangを使って推しに励ましてもらう
date: "2019-12-08T22:12:03.284Z"
description: "進捗生成するのって大変ですよね！githubに草が生えるだけだと物足りないと思ったので、最近学習し始めたgoを使って自分の推しが褒めてくれるような物を作りました"
thumbnail: "https://golang.org/doc/gopher/fiveyears.jpg"
---
## 進捗生成って大変

進捗生成するのって大変ですよね！githubに草が生えるだけだと物足りないと思ったので、最近学習し始めたgoを使って自分の推しが褒めてくれるような物を作りました

## 目次
1. github api v4を覗いてみる
2. githubv4を使ってみる
3. webhookを使ってdiscordにメッセージを送る
4. herokuにデプロイしてみる

## github api v4を覗いてみる

> github api v4 

github api v4ではgraphQLと言うものが使われています。ここではgraphQLの最低限の説明をします

> 詳しい説明はこちら：https://qiita.com/bananaumai/items/3eb77a67102f53e8a1ad

### GraphQLの利点
私自身も今回初めてgraphQLを使ったのであまり詳しいことは言えませんが、これを使っていてひとつ思ったこととしては「サーバー側が楽」だと思いました。
なぜかと言うと、graphQLを使うことでフロント側は欲しい情報だけを簡単に取得することができるからです。また、クエリ文をみるだけで何の情報が取得されるのかがわかりやすいと言うところも利点と言えると思いました（間違ってたこと言ってたら指摘してください。）

### GraphQLの欠点
英語の情報ばかりで少し辛かった（以上！）

### GraphQLを触ってみる
では実際に触っていきます！！
まずはしたのリンクにアクセスしてみます

> https://developer.github.com/v4/explorer/

ここでは実際にweb上でクエリを書いて実行できます。
今回は一日のコミット数を取得したので以下のようなクエリになりました。

```graphQL
query {
  user(login: "DuGlaser") {
    contributionsCollection(from: "2019-12-02T00:00:00", to: "2019-12-03T00:00:00") {
      totalCommitContributions
    }
  }
}
```

今回はこれをgolangを用いて実装していきます

## githubから日間コミット数を取得
### プロジェクトの作成
まずは```main.go```と```.env```を作成します。.envファイルには後々使う事になるwebhookのURLだったりgithubのtokenなどを書き込んでいきます。

```
.
├── .env
├── main.go
```

### githubv4を使う
githubv4とはgolangでgithub v4 のgraphQLを扱いやすくするためのpackageになります

> https://github.com/shurcooL/githubv4

今回はこちらを使用してクエリを作っていきます。
が、まずは自分のgithubのコミット数を取得するためにpersonal access tokenなる物を使用して認証をする必要があります。詳しくはこちらに書いてあります。
> https://help.github.com/ja/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line

またtokenの権限の範囲についてはこちらをご覧ください

> https://developer.github.com/v4/guides/forming-calls/

では、取得したトークンを```.env```ファイルに設定します。
```.env```ファイルを開いて次のように記述します

```.env:.env
GITHUB_TOKEN = トークンをここに貼り付け
```

次にmain.goで.envファイルで設定した環境変数を使うために今回はgo-binenvを使用します。
こちらに関しては以下の記事を参考にさせていただきました

>　https://qiita.com/kazuph/items/491b87a8f07740c78c8e

またgithubの承認にはoauth2を使用しました。
せっかくなので今回使用するpackageをここでインストールします
ではターミナルで次のように記述してください

```unix
$ go get -u github.com/shurcooL/githubv4
$ go get golang.org/x/oauth2
$ go get -u github.com/jteeuwen/go-bindata/...
$ go get github.com/kazuph/go-binenv
```

次にコードを書いていきます。先に結果だけ出しておきます。

```go:main.go
func getTime() (time.Time, time.Time) {
	t := time.Now()
	y := time.Now().AddDate(0, 0, -1)
	return t, y
}


func main(){
	today, yesterday := getTime()

	env, loadErr := binenv.Load(Asset)
	if loadErr != nil {
		log.Fatalln("Error loading .env file")
	}

	src := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: env["GITHUB_TOKEN"]},
	)
	httpClient := oauth2.NewClient(context.Background(), src)

	client := githubv4.NewClient(httpClient)

	var q struct {
		User struct {
			ContrbutionsCollection struct {
				TotalCommitContributions githubv4.Int
			} `graphql:"contributionsCollection(from: $Yesterday,to: $Today)"`
		} `graphql:"user(login: \"DuGlaser\")"`
	}

	variable := map[string]interface{}{
		"Today":     githubv4.DateTime{today},
		"Yesterday": githubv4.DateTime{yesterday},
	}

	err := client.Query(context.Background(), &q, variable)
	if err != nil {
		log.Fatalln(err)
	}
}

```

まずmainの最初で.envファイルを読み取ります。あとは.envファイルのトークンを用いてgithubの認証をしています。

次にクエリを書いて行くのですが、githubv4では

```graphQL
query {
  user(login: "DuGlaser") {
    contributionsCollection(from: "2019-12-02T00:00:00", to: "2019-12-03T00:00:00") {
      totalCommitContributions
    }
  }
}
```

ではなく

```go
	var q struct {
		User struct {
			ContrbutionsCollection struct {
				TotalCommitContributions githubv4.Int
			} `graphql:"contributionsCollection(from: $Yesterday,to: $Today)"`
		} `graphql:"user(login: \"DuGlaser\")"`
	}

```

のように　login:~　や　from:~ は}の後ろにバッククォートをつけて表現します。またクエリの中で変数を使う場合は

```go
variable := map[string]interface{}{
	"Today":     githubv4.DateTime{today},
	"Yesterday": githubv4.DateTime{yesterday},
}

err := client.Query(context.Background(), &q, variable)
if err != nil {
	log.Fatalln(err)
}
```

上のように後から宣言して、client.Queryの第三引数として入れてあげれば大丈夫です！

このコードは動いてはいますが

```go
variable := map[string]interface{}{
	"Today":     githubv4.DateTime{today},
	"Yesterday": githubv4.DateTime{yesterday},
}
```

上のところで

```
[composites] [W] github.com/shurcooL/githubv4.DateTime composite literal uses unkeyed fields
```

と怒られてしまっているのでご存知の方がいましたら指摘してくださると幸いです。

## webhookを使ってdiscordにメッセージを送る

ここからはwebhookを用いてdiscordに通知を出していきます。
やり方については以下のブログを大変参考にさせていただきました！

> https://blog.narumium.net/2019/08/02/%E3%80%90go%E3%80%91discord%E3%81%AEwebhook%E3%81%A7%E9%80%9A%E7%9F%A5%E3%83%9C%E3%83%83%E3%83%88%E3%82%92%E4%BD%9C%E3%82%8B/

やり方については上の記事で解説されてるのでここではコードだけ貼ります（）
なおdiscordのwebhookのリンクについては以下のように.envファイルに記述しました

```env:.env
DISCORD_WEBHOOK_TEST = webhookのurl
```

```go:main.go
type DiscordImage struct {
	URL string `json:"url"`
	H   int    `json:"height"`
	W   int    `json:"width"`
}

type DiscordEmbed struct {
	Desc  string       `json:"description"`
	Image DiscordImage `json:"image"`
	Color int          `json:"color"`
	Title string       `json:"title"`
}

type DiscordWebhook struct {
	UserName  string         `json:"username"`
	AvatarURL string         `json:"avatar_url"`
	Content   string         `json:"content"`
	Embeds    []DiscordEmbed `json:"embeds"`
}

func getTime() (time.Time, time.Time) {
...
}

func sendMessage(url string, dw *DiscordWebhook) {
	j, err := json.Marshal(dw)
	if err != nil {
		fmt.Println("json err:", err)
		return
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(j))
	if err != nil {
		fmt.Println("new request err:", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("client err:", err)
		return
	}
	if resp.StatusCode == 204 {
		fmt.Println("sent", dw)
	} else {
		fmt.Println("失敗")
		fmt.Printf("%#v\n", resp)
	}
}

func main(){
...
	dw := &DiscordWebhook{}
	dw.CreateMessage(q.User.ContrbutionsCollection.TotalCommitContributions)
	sendMessage(env["DISCORD_WEBHOOK_TEST"], dw)
}


```

createMessageについてはmain.goと同じ階層に新しくmessage.goと言うファイルを作成し、記述しました

```go:message.go
func (dw *DiscordWebhook) CreateMessage(q githubv4.Int) {

	commit := fmt.Sprintf("今日のコミット数は%v回です！！", q)

	switch {
	case q <= 3:
		dw.UserName = "中野五月"
		dw.AvatarURL = "https://cdn-ak.f.st-hatena.com/images/fotolife/m/magazine_pocket/20171213/20171213201322.jpg"
		dw.Embeds = []DiscordEmbed{
			DiscordEmbed{
				Title: commit,
				Image: DiscordImage{URL: "https://media.Discordapp.net/attachments/567985071701753857/639018077589078016/S__27058352.jpg?width=1090&height=1141"},
				Color: 0xff0000,
			},
		}

	case q > 3 && q <= 5:
		dw.UserName = "中野一花"
		dw.AvatarURL = "https://cdn-ak.f.st-hatena.com/images/fotolife/m/magazine_pocket/20171213/20171213200413.jpg"
		dw.Embeds = []DiscordEmbed{
			DiscordEmbed{
				Title: commit,
				Image: DiscordImage{URL: "https://media.Discordapp.net/attachments/567985071701753857/639018284901203968/S__27058782.jpg"},
				Color: 0xffff00,
			},
		}
	case q > 5 && q <= 8:
		dw.UserName = "中野四葉"
		dw.AvatarURL = "http://chomanga.org/wp-content/uploads/2019/12/a6516e3f616a117ed66a7af940fdfed6.png"
		dw.Embeds = []DiscordEmbed{
			DiscordEmbed{
				Title: commit,
				Image: DiscordImage{URL: "https://imasoku.com/wp-content/uploads/2019/02/yZoTi8u.jpg"},
				Color: 0x008000,
			},
		}
	case q > 8 && q <= 12:
		dw.UserName = "中野三玖"
		dw.AvatarURL = "https://cdn-ak.f.st-hatena.com/images/fotolife/m/magazine_pocket/20171213/20171213200842.jpg"
		dw.Embeds = []DiscordEmbed{
			DiscordEmbed{
				Title: commit,
				Image: DiscordImage{URL: "http://phoenix-wind.com/common/img/OGP/word/gotoubun_miku_03.jpg"},
				Color: 0x0000ff,
			},
		}
	case q > 12:
		dw.UserName = "中野二乃"
		dw.AvatarURL = "https://pbs.twimg.com/media/DyehWWfVsAA6JWV.jpg"
		dw.Embeds = []DiscordEmbed{
			DiscordEmbed{
				Title: commit,
				Image: DiscordImage{URL: "https://pbs.twimg.com/media/Dgngye7U8AI9f-3?format=jpg&name=900x900"},
				Color: 0x000000,
			},
		}
	}
}

```

## herokuにデプロイしてみる
ここからはherokuにデプロイしてみます。インフラのイの字すら知らない私でもデプロイできたので簡単です
なお以下を参考にさせていただきました

> https://jp.heroku.com/go
> https://qiita.com/seigo-pon/items/ca9951dac0b7fa29cce0

まずはherokuをtarminalで実行するために

```
$ brew install heroku
```

をします
そうしたら、main.goと同じ階層にいきます。
次に下の順にコマンドを実行していきます。

```unix
$ heroku login
$ go get -u github.com/kardianos/govendor
$ govendor init
$ govendor add +e
$ go build
$ git init
$ heroku create プロジェクト名
$ git add .
$ git commit -m "init"
$ git push heroku master
```

これでherokuへのデプロイは完了です（ざっくりしすぎやろ）
govendorでは自分の使ってるpackageをherokuに上げても大丈夫なようにjsonに記述してくれます（でもbuildファイルを実行するのならいらないのでは・・・）
herokuへのデプロイはこれだけで完了します。
試しに次のように実行してみます

```
$ heroku run ビルドファイルの名前
```

discordに結果が来ると思います

![](https://i.imgur.com/mLHyhNt.png)

またherokuのheroku scheduleを使用すれば特定の時間に勝手に通知がきます！

# まとめ
goを真面目に勉強し始めてからまだ１週間ちょっとですが、golangはとてもシンプルで個人的に大好きです。また、herokuでのデプロイは思った以上に簡単でびっくりしました。これからもアウトプットして成長していけたらと思います！
今回作成したものはこちらに載せておきます
> https://github.com/DuGlaser/Notice_CommitContributions
