---
title: "Docker筆記(3)-Docker Network & Docker Volume"
description: "認識Docker Network & Docker Volume，以及使用情境"
date: "2022-02-07"
categories: ["Docker筆記"]
tags: ["Docker筆記"]
cover: "/archive/2022-02-07-docker-3-docker-network-docker-volume/cover.png"
legacyUrl: "/p/docker筆記3-docker-network-docker-volume/"
---

知識來源：https://hahow.in/courses/5df27f1fa5ee510022a08500

## Docker Network Mode介紹

有四種模式：

下面的圖片分別代表從Host-\>VM-\>Docker Engine裡面各個還有的NetWork空間，而Docker空過可能會有多個Bridge NetWork

![base](/archive/2022-02-07-docker-3-docker-network-docker-volume/base.png)

### None模式：

None模式容器不會與外界接觸，外部與容器互相不能連線，是一個封閉的網路空間

### Bridge模式：

Bridge在容器啟動的時候，會把容器放在某個Bridge容器放在Bridge Network裡面，這些Network空間就會把IP分給容器，而不同的Network空間網路是互不相通的，如下圖，A1以及B1來自不同的網路空間，所以下面的兩個容器網路無法相通。

![](/archive/2022-02-07-docker-3-docker-network-docker-volume/bridgemode.png)

### Container模式

Container模式會把容器對應的現形的Container，他會與對應的容器拿到相同的IP

### Host模式

Host模式會與VM network索取IP，所以他可以跟Linux VM的應用程式相通

所以以上會變成這樣子：

![](/archive/2022-02-07-docker-3-docker-network-docker-volume/nwtworkmode.png)

## Docker Network實作

列出目前所有的網路模式：

```bash
docker network ls
```

```bash
➜  ~ docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
9e5d8527e2f5   bridge    bridge    local
a21823e2ef89   host      host      local
7f054863856c   none      null      local
```

### None模式

指定Container的網路模式：

```bash
docker run -d --network none --name none-mode alpine tail -f /dev/null
```

上面的格式解釋：

    docker run -d --network [網路模式] --name [Container名稱] [image名城] [運作模式]

複習

`docker run`：運行容器

`-d`：於背景執行

`--network none `：選擇的網路模式

`--name none-mode alpine`：容器名稱以及選擇的image

`alpine tail -f /dev/null`：讓他持續運行

接著透過下面指令查看網路空間內容

#### 查看網路空間內容

```bash
docker network inspect none
```

查看none網路介面：

```bash
➜  ~ docker network inspect none
[
    {
        "Name": "none",
        "Id": "7f054863856ce266e9181809fe53682d71a31b63c209999bc184de3ddf32bcf6",
        "Created": "2022-01-17T15:16:51.594572759Z",
        "Scope": "local",
        "Driver": "null",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": []
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "0e1ce29952566a295dc8ad10c37ceab4d31e5a1c86934662bca414fe9307ea96": {
                "Name": "none-mode",
                "EndpointID": "233eea660f30731fb98954c61b7ff99e13b2408acc73c7fdf111ed68ad2435de",
                "MacAddress": "",
                "IPv4Address": "",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

透過這個指令，其中的Containers就可以知道是否有真的對應到Container之中

![](/archive/2022-02-07-docker-3-docker-network-docker-volume/none.png)

接著實測看看：

透過

```bash
docker exec -it [containerID] /bin/sh
```

進入container並啟用shell模式

進去查看擁有的ip

```sh
ip addr ls
```

然後ping google server看看

    ping 8.8.8.8

就會看到Netwrok unreachable沒有回應

執行結果：

```bash
➜  ~ docker exec -it 0e1ce2995256 /bin/sh
/ # ip addr ls
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
3: ip6tnl0@NONE: <NOARP> mtu 1452 qdisc noop state DOWN qlen 1000
    link/tunnel6 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00 brd 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
/ # ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
ping: sendto: Network unreachable
```

### Bridge模式

首先要建立網路空間

```bash
docker network create --driver [哪一種diver] [drivername]
```

```bash
docker network create --driver bridge my-bridge
```

藉著輸入`docker network ls`查看有的目前網路空間

```bash
➜  ~ docker network ls
NETWORK ID     NAME        DRIVER    SCOPE
9e5d8527e2f5   bridge      bridge    local
a21823e2ef89   host        host      local
eaadd419454a   my-bridge   bridge    local
7f054863856c   none        null      local
```

接著`docker network inspect my-bridge`查看網路空間內容

![截圖 2022-02-07 下午6.40.29](/archive/2022-02-07-docker-3-docker-network-docker-volume/bridge.png)

這時候網路空間的[Subnet](https://www.netadmin.com.tw/netadmin/zh-tw/technology/D5162EE38674405EADB022E0802A05B2)可以注意一下，接著將容器放到此網路空間：

```bash
docker run -d --network my-bridge --name bridge-001  alpine tail -f /dev/null
```

成功後再次查看使用`docker network inspect my-bridge`查看網路空間內容

![](/archive/2022-02-07-docker-3-docker-network-docker-volume/bridge2.png)

接著進入Container，並使用ip addr ls 可以看到成功從網路空間拿到ip(172.18.0.2)，且成功ping到google server外部網路，

```shell
➜  ~ docker container ls
CONTAINER ID   IMAGE     COMMAND               CREATED         STATUS         PORTS     NAMES
9853efb87483   alpine    "tail -f /dev/null"   4 minutes ago   Up 4 minutes             bridge-001
0e1ce2995256   alpine    "tail -f /dev/null"   20 hours ago    Up 20 hours              none-mode
➜  ~ docker exec -it 9853efb87483 /bin/sh
/ # ip addr ls
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
3: ip6tnl0@NONE: <NOARP> mtu 1452 qdisc noop state DOWN qlen 1000
    link/tunnel6 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00 brd 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
61: eth0@if62: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue state UP
    link/ether 02:42:ac:12:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth0
       valid_lft forever preferred_lft forever
/ # ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: seq=0 ttl=37 time=46.825 ms
64 bytes from 8.8.8.8: seq=1 ttl=37 time=68.009 ms
64 bytes from 8.8.8.8: seq=2 ttl=37 time=52.666 ms
64 bytes from 8.8.8.8: seq=3 ttl=37 time=56.660 ms
64 bytes from 8.8.8.8: seq=4 ttl=37 time=43.702 ms
64 bytes from 8.8.8.8: seq=5 ttl=37 time=54.996 ms
^C 
--- 8.8.8.8 ping statistics ---
6 packets transmitted, 6 packets received, 0% packet loss
round-trip min/avg/max = 43.702/53.809/68.009 ms
```

如果之後建立相同的Container都在my-bridge網路空間，可以互相ping成功，反之在不同的bridge網路空間，就不同互相ping，**但這些使用Birdge網路模式的Container都可以向外部連接**。

### Container模式

Container模式會把容器對應的現形的Container，他會與對應的容器拿到相同的IP，所以要複製的是container的名稱

    docker run -d --network container：[要copy的container名稱] --name [Container名稱] [image名城] [運作模式]

所以如果要複製上面容器birdge-001的網路空間的話：

```bash
docker run -d --network container:bridge-001 --name container-mode001 alpine tail -f /dev/null
```

完成指令後用`docker network inspect my-bridge`進入到my-bridge網路空間查看，會發現剛剛建立的這個container-mode001容器並沒有在Containers的結果裡，但**之後進入Container之後還是可以看到他拿到與容器bridge-001相同的ip，只是不能向外部連接。**

container mode 主要特點，**即是它並不與外界網路進行溝通，只與所複製的網路進行交流**。

如果在container mode建立一個container是去複製bridge container的ip，這樣就會有兩個container共用一組ip

那麼如果去ping那組ip是誰會回應呢?

\*\*container mode 的目的是讓一個 container 可以在 docker 內部網路互相溝通。\*\*同時，container mode 也有所限制；第二個啟動的 container 有著很多不能使用的功能，比如對外進行 port mapping (ex. -p 8080:80)。所以這個 container mode 下的 container ，只能對內行動，不能對外開放，所以也就不會對外擔任回應 ip 的角色！

### Host 模式

> Host Mode 消息更新

Host mode 僅存在於 Linux 中直接安裝 Docker 的環境。

Desktop for Windows/macOS 因為不再讓我們進入到內層 VM Linux，所以不再有 host mode 可以運用。

## Docker Network相關語法整理

列出目前擁有的網路空間：

```shell
docker network ls
```

docker network ls

創建容器並指定網路空間：

```sh
docker run -d --network [網路空間名稱] --name [Container名稱] [image名城] [運作模式]
```

ContainerMode的話

查看網路空間內容：

```sh
docker network inspect [網路空間名稱]
```

進入容器並使用shell模式：

```bash
docker exec -it [containerID] /bin/sh
```

## Docker Volume 介紹

### Docker的三個空間

在使用Docker Volume之前，要先知道Docker總共有三個空間可以使用，一個是主機是的Disk空間，另一個是Linux VM的空間，第三個則是Docker Engine的容器空間，其中VM空間與容器空間最大的差別在於，VM的資料不會隨著容器消失而不見，還是會留在Linux VM Disk上面，反之，Container Disk是暫時的空間，如果有容器裡面從TMP要了空間（如圖），那如果這個容器刪除了，TMP也回隨著他而消失。

示意圖：

![](/archive/2022-02-07-docker-3-docker-network-docker-volume/docker空間介紹.png)

### 為何要使用Docker Volume

Docker file檔案如下：

```dockerfile
FROM alpine:latest
ENV myworkdir /var/www/localhost/htdocs
WORKDIR ${myworkdir}
ARG namearg=Hellow-world
RUN apk --update add apache2
RUN rm -rf /var/cache/apk/*
RUN echo "<h3>$(namearg)<h3>" >> index.html
COPY ./content.txt ./
RUN ls -l ./
RUN cat ./content.txt >> index.html
ENTRYPOINT ["httpd","-D", "FOREGROUND"]
```

建立image，`docker build -t [帳號/image名稱]`，

在使用`docker run -d -p 8080:80 [帳號/image名稱]`，

目前`docker container ls`：

![目前docker container ls](/archive/2022-02-07-docker-3-docker-network-docker-volume/containerls.png)

目前locathost8080結果：

![](/archive/2022-02-07-docker-3-docker-network-docker-volume/localhost.png)

containerID:d64f8f1470fd

接著輸入`docker exec -it d64f8f1470fd /bin/sh`進入container，並使用shell模式輸入`echo "test-context">> index.html`加入一段html，之後再打開瀏覽器，會發現確實更新了，之後再輸入`exit`離開container，並且使用`docker stop d64f8f1470fd`容器，在使用`docker rm d64f8f1470fd`清理容器再重新啟動，在進入到localhost8080，會發現剛剛加入的html字串不見了，**代表了Container啟動完畢並且清空之後，disk空間資料都會被清除**，所以就必須使用Docker volume的功能。

### 如何使用Docker Volume

建立docker volume

```bash
docker volume create [volume名稱]
```

查看目前的volume

```bash
docker volume ls
```

查看volume細節

```bash
docker volume inspect [volume名稱]
```

接著可以看到Mountpoint，他就是linux VM的路徑：

![Linux VM的路徑](/archive/2022-02-07-docker-3-docker-network-docker-volume/mountpoint.png)

待會就要把它mapping到Container的路徑，

```bash
docker run -d -p [本機port]:[VMport] -v [vol空間名稱]:[Container裡面的folder] [images]名稱
```

**vol空間可以不填，會隨機產生**

範例：

```bash
docker run -d -p 8080:80 -v mainpage-vol:/var/www/localhost/htdocs  asce55123/apache001
```

1.mainpage-vol 是VM的disk空間

2.上面Container裡面Folder路徑/var/www/localhost/htdocs的路徑是根據 apache 這個伺服器軟體來設定的，在 apache server 中，首頁目錄位置預設就在此目錄中

完成之後執行以下操作：

1.  `docker run -d -p [本機port]:[VMport] -v [vol空間名稱]:[Container裡面的folder] [images名稱]`建立ContainerA完畢之後，查看ContaierA的ID，使用`container exec`加上shell模式進入ContainerA。
2.  加入一段html
3.  關閉ContainerA
4.  移除ContainerA
5.  使用(1)步驟建立Container B
6.  開啟localhost8080，會發現剛剛第(2)點加入的html還在。

## Docker Volume語法整理

建立docker volume

```bash
docker volume create [volume名稱]
```

查看目前的volume

```bash
docker volume ls
```

查看volume細節

```bash
docker volume inspect [volume名稱]
```

使用Docker Volume空間與Contaier裡面的空間做mapping：

```bash
docker run -d -p [本機port]:[VMport] -v [vol空間名稱]:[Container裡面的folder] [images]名稱
```

**vol空間可以不填，會隨機產生**
