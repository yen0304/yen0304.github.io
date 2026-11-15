---
title: "Docker筆記-Dockerfile語法使用"
description: "認識Dockerfile語法，使用情境"
date: "2022-02-05"
categories: ["Docker筆記"]
tags: ["Docker筆記"]
cover: "/archive/2022-02-05-docker-dockerfile/cover.png"
legacyUrl: "/p/docker筆記-dockerfile語法使用/"
hidden: true
duplicateOf: "2022-02-05-docker-2-dockerfile"
---

## 常用Linux指令

| MacOS / Linux 指令 |               說明               |                              範例                              |
|:------------------:|:--------------------------------:|:--------------------------------------------------------------:|
|        exit        |               離開               |                             `exit`                             |
|        pwd         |          取得目前的路徑          |                             `pwd`                              |
|         ls         |     取得當前資料夾與檔案名稱     |                              `ls`                              |
|         cd         |             切換目錄             |                             `cd ~`                             |
|       touch        |             建立檔案             |                       `touch demo.html`                        |
|       mkdir        |            建立資料夾            |                          `mkdir demo`                          |
|         rm         |             刪除檔案             |                         `rm demo.html`                         |
|         cp         |             複製檔案             |                   `cp demo.html demo1.html`                    |
|        scp         | 在不同的 Linux 主機之間複製檔案  | `scp user_name@riverye.com:/home/data/考試100分.pdf ~/Desktop` |
|         mv         |             移動檔案             |                       `mv demo1.html ~`                        |
|        sudo        |           使用最高權限           |                      `sudo 欲使用的指令`                       |
|        man         |         查看指令說明文件         |                           `man pwd`                            |
|        help        |           查看指令說明           |                          `mv --help`                           |
|       clear        | 清除終端機上的訊息(往上捲看得到) |                            `clear`                             |
|       which        |        查詢指令的來源路徑        |                          `which sudo`                          |
|        find        |    找出符合條件的檔案或資料夾    |                            `find .`                            |

## 重要觀念

圖片的文字解說：

Docker Client就是下docker指令的地方

Bulid Context就是Docker bulid .指令的時候，當下的目錄就是Bulid Context，也會產生Dockerfile以及其他檔案Other Files

![](/archive/2022-02-05-docker-dockerfile/1.png)

在Linux OS（VM）上面，會安裝所謂的Docker Engine，Docker Engine會接收`Docker build`指令，接收之後的第一個動作就是將Mac OS(主機)上面目錄的檔案全部copy到VM上面，

![](/archive/2022-02-05-docker-dockerfile/2.png)

接著Dockerfile的第一個指令一定會是`From [images]`，抓到base images之後，就會臨時起用一個Container ，這個臨時的Container叫做tmp Container01，接著Dockerfile裡面重要的指令，例如Run，就會在原本的Container加一個layer，layer就是Dockerfile Commend跟tmp Container01合起來建立出臨時性的tmp image01就是layer，就著Docler Engine就會透過臨時的image01來產生container02

這邊到目前為止像這樣：

![](/archive/2022-02-05-docker-dockerfile/3.png)

下一個Commamd COPY/src/dst，COPY /src指的是在VM的檔案系統，dst是指目前當下的Container02，放進去Container02之中的files就是imported files，再次打包成臨時的image02，image02就會在啟用臨時的tmp container03，最後一個Docker Commend，接著會和最後一個指令`(ENTRYPOINT["httpd"])`和最後的tmp container03產生最後的final image，以上就是image產生的過程。

兩個工作者Docker Client，用來執行指令，用來傳送docker指令到Docker Engine。

還有三個空間，主機空間、虛擬機空間、臨時的三個虛擬機空間

![流程圖](/archive/2022-02-05-docker-dockerfile/流程圖.png)

# Dockerfile語法

## FROM

首先新建一個資料夾並且用終端機到目錄底下，使用touch指令建立空白檔案，檔名叫做Dockerfile（大小寫要一樣），

```dockerfile
touch Dockerfile
```

接著打開它（只要是編輯器都可以）

FROM指令用來選擇Base image的來源，這邊用alpine image，他是一個輕量的Linux OS

```dockerfile
FROM alpine:latest
```

存擋後，回到終端機，用`cat`指令查看檔案內容

    cat Dockerfile

確認之後，就來建立image，

    docker build -t [imagename] .

上面的 `.`還重要，他的意思就是到當下的目錄找Dockerfile

    ➜  dk練習 docker build -t test001 .
    [+] Building 0.1s (5/5) FINISHED
     => [internal] load build definition from Dockerfile                       0.0s
     => => transferring dockerfile: 107B                                       0.0s
     => [internal] load .dockerignore                                          0.0s
     => => transferring context: 2B                                            0.0s
     => [internal] load metadata for docker.io/library/alpine:latest           0.0s
     => [1/1] FROM docker.io/library/alpine:latest                             0.0s
     => exporting to image                                                     0.0s
     => => exporting layers                                                    0.0s
     => => writing image sha256:1ad3d6652d7301865db4e7cf5acb4efd2e09631f429f7  0.0s
     => => naming to docker.io/library/test001                                 0.0s

然後使用docker images就可以看到下載下來的alpine images了

查看系統版本

    docker run [imagesname] cat /etc/os-release

![執行結果](/archive/2022-02-05-docker-dockerfile/4.png)

## ENTRYPOINT

在上面的例子中，還是得手動透過

```dockerfile
docker run -d [imagesname] tail -f /dev/null
```

來維持運行，但如果今天想要給別人使用，又不想要求他打上語法才能在背景運行，這時候到Dockerfile編輯，`ENTRYPOINT`是Docker run的時候會第一個執行的指令，所以ENTRYPOINT是用來預設在docker run的時候會執行的指令。

```dockerfile
ENTRYPOINT ["指令","指令"....]
```

```dockerfile
ENTRYPOINT [ "tail","f","/dev/null" ]
```

再重新建立image-test003並查看ls看看，在run查看ls可以發現test還是在執行：

    cat Dockerfile //查看dockerfile程式碼
    docker container ls //查看運行中的容器
    docker build -t test003 . //建議images
    docker images //查看images
    docker run -d  test003 . //運行images -d後面不用指令，因為寫在ENTRYPOINT裡面了
    docker container ls //查看運行中容器

![entrypoint](/archive/2022-02-05-docker-dockerfile/entrypoint.png)

## RUN

RUN對功能是使用任何base images提供的指令，以上面的base images，把apache serve運行起來（範例內容指令不用記），其中`httpd -D FOREGROIND`是最後要執行apache server的指令，所以把他放在ENTRYPOINT裡面，即啟動Container運行apache server的概念。

```dockerfile
cat Dockerfile
docker build -t asce55123/test005 .
docker run -d -p 8081:80 asce55123/test005 //8081本地port，連線到80 apache port
docker container ls
```

\![\](run apadhe.png)

再到8081看看：

![itworks](/archive/2022-02-05-docker-dockerfile/itworks.png)

可以看到apache server運行成功了

以上三個FROM 、ENTRYPOINT、RUN可以完成8-9成的dockerfile，所以要熟練運用

很重要的一點是\*\*每一次的RUN指令都會產生一個臨時性的container並打包成images，所以兩個RUN之間是互不相通的

所以下面這個是使用RUN執行的LINUX指令：

```dockerfile
RUN cd /var/www/localhost/htdocs
RUN pwd
```

但這樣會pwd顯示/根目錄，而不是當下位置，所以可以：

```dockerfile
RUN cd /var/www/localhost/htdocs && pwd
```

或是要顯示在不同行：

```dockerfile
RUN cd /var/www/localhost/htdocs \
    && pwd
```

補充LINUX指令：

[https://ithelp.ithome.com.tw/articles/10235530](https://ithelp.ithome.com.tw/articles/10235530)

pwd：取得目前的路徑

cd：切換目錄

- ENTRYPOINT: 預設啟動指令

- CMD: 給啟動指令的預設參數 會這樣寫，只是官方文件提供一個分出指令定位的東西，ENTRYPOINT + CMD 完全可以用一個ENTRYPOING取代。

- RUN: 是Dockerfile建立image內部再跑的指令，是跑在Linux裡面的，跟ENTRYPOING與CMD最大的不同就是，他不是作為Image的「啟動指令」，而是作為image的「建造指令」。

## ENV (environment variables)

ENV-環境變數，是在build的時候，可以定義一些變數，讓後面指令在執行時候可以參考

```dockerfile
ENV myworkdir /var/www/localhost/htdocs
RUN apk --update add apache2
RUN rm -rf /var/cache/apk/*
RUN cd ${myworkdir}}
```

等同於

```dockerfile
RUN apk --update add apache2

RUN rm -rf /var/cache/apk/*

RUN cd /var/www/localhost/htdocs
```

這樣之後如果多個RUN都要使用同樣的指令會參數時，可以透過ENV讓程式簡潔也更方便使用。

## WORKDIR

WORKDIR可以改變Container的裡面預設路徑，

例如：

```dockerfile
ENV myworkdir /var/www/localhost/htdocs
RUN cd ${myworkdir}} \
    && echo "<h3>Hello-world<h3>" >>index.html 
```

等同於

```dockerfile
ENV workspace /var/www/localhost/htdocs
WORKDIR &{workspace}
RUN echo "<h3>Hello-world<h3>" >>index.html
```

就不用再瘋狂CD了

## ARG (argument )

ARG跟ENV不同的是，他可以在docker build的時候改變變數的值，

```dockerfile
ENV workspace /var/www/localhost/htdocs
WORKDIR &{workspace}
ARG namearg=Hello-world
RUN cd ${myworkdir}} \
    && echo "<h3>$(namearg)<h3>" >>index.html
```

等同於

```dockerfile
ENV workspace /var/www/localhost/htdocs
WORKDIR &{workspace}
ARG namearg=Hello-world
RUN cd ${myworkdir}} \
    && echo "<h3>$(namearg)<h3>" >>index.html
```

在執行`build`指令也可以在外部更改ARG參數，使用`--build-arg`

```bash
docker build --build-arg [arg=value] -t [imagename] .
```

```bash
docker build --build-arg namearg=TESTworld -t test001 .
```

## COPY

```dockerfile
COPY source dest
```

現在在Docker的資料夾下有一個檔案叫做content.txt

內容如下：

```html
<div>
<h3>My Book List</h3>
<ul>
  <li><a href="#">Die Hard</a></li>
  <li><a href="#">Secret</a></li>
  <li><a href="#">Html 101</a></li>
  <li><a href="#">Kubernetes 202</a></li>
  <li><a href="#">AWS 303</a></li>
</ul>
</div>
```

    ➜  dk練習 ls
    Dockerfile  content.txt

注意的是，其中這段

    COPY ./content.txt ./

的意思是前面`./context.txt`目錄是Linux VM的根目錄空間，複製過去的是Container的`./`當前的目錄

FROM alpine:latest

LABEL name=“MyName”

ENV myworkdir /var/www/localhost/htdocs

WORKDIR \${myworkdir}

ARG namearg=Hellow-world

```dockerfile
RUN apk --update add apache2

RUN rm -rf /var/cache/apk/*

RUN echo "<h3>$(namearg)<h3>" >> index.html

COPY ./content.txt ./

RUN ls -l ./ //列出當前container 目錄

RUN cat ./content.txt >> index.html //用cat叫出content.txt的內容塞到index.html

ENTRYPOINT ["httpd","-D", "FOREGROUND"]
```

建立好image之後，

![copycmd](/archive/2022-02-05-docker-dockerfile/copycmd.png)

到瀏覽器查看結果：

![](/archive/2022-02-05-docker-dockerfile/copyresult.png)
