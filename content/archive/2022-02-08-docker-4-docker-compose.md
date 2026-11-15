---
title: "Docker筆記(4)-Docker Compose & 規模化部署比較"
description: "認識Docker Compose & 規模化部署比較"
date: "2022-02-08"
categories: ["Docker筆記"]
tags: ["Docker筆記"]
cover: "/archive/2022-02-08-docker-4-docker-compose/cover.png"
legacyUrl: "/p/docker筆記4-docker-compose-規模化部署比較/"
---

## Docker 資源管理

### 何謂Docker Compose

Compose 是用於定義和運行多容器 Docker 應用程序的工具，可以透過YAML語法把三大要素進行管理。

￼￼

![](/archive/2022-02-08-docker-4-docker-compose/Dockercose.png)

## Docker Compose寫法

### Service

Service就是Container：

首先進入到Dockerfile資料夾目錄，並創建一個Docker-compose的設定檔

```bash
touch docker-compose.yml
```

進入編輯器之後(推薦VScode)

```yaml
version: '3.7' #指定的Docker-compose版本
services:  #Container管理
  myweb:   #新增的Container名稱
    build:
      context: .  #代表當前目錄的Dockerfile的位置
      #args: 可以使用args參數
        #key: "value" 參數名稱：要改變的值
    image: asce55123/myweb:latest #要建立image的名稱
    ports: #設定連線資訊
     - "8080:80"
```

回到終端機：

運行Docker compose

```bash
docker-compose build --no-cache
```

`--no-cache` 是清除快取，避免有東西沒有更新到，結果如下圖：

![終端機輸出](/archive/2022-02-08-docker-4-docker-compose/teminal.png)

有了images之後，透過docker compose運行container

    docker-compose up -d

`-d` 是在背景執行

終端機輸出：

```bash
➜  dk練習 docker-compose up -d
Creating network "dk_default" with the default driver
Creating dk_myweb_1 ... done
```

執行之後，就可以看到container正在執行，如果要關閉container的話，透過

```bash
docker-compose down
```

，所以往後可以在docker-compose底下一次起多動個container。

範例：

```yaml
version: '3.7' 
services: 
  myweb:
    build:
      context: .  
    image: asce55123/myweb:latest 
    ports:
     - "8080:80"
  myweb2:   
    build:
      context: .  
    image: asce55123/myweb2:latest 
    ports:
     - "8081:80"
  ##也可以用現有的images建立Container
  myweb3:   
    build:
      context: .  
    image: asce55123/myweb2:latest 
    ports:
     - "8082:80"
```

### Network

在執行Docker compose時，預設的情況下會建立一個新的birdge網路空間，可以在yaml檔案下使用`networks`參數做設定：

```yaml
version: '3.7' #指定的Docker-compose版本
services: #Container管理
  myweb:   #新增的Container名稱
    build:
      context: .  #代表當前目錄的Dockerfile的位置
      #args: 可以使用args參數
        #key: "value"
    image: asce55123/myweb:latest #要建立image的名稱
    ports:
     - "8080:80"
    networks:
      - mybridge001
  myweb2:   #新增的Container名稱
    build:
      context: .  #代表當前目錄的Dockerfile的位置
    image: asce55123/myweb:latest #要建立image的名稱
    ports:
     - "8081:80"
    networks:
    - mybridge001
  ##也可以用現有的images建立Container
  myweb3:   
    build:
      context: .  
    image: asce55123/myweb2:latest 
    ports:
     - "8082:80"
    networks:
    - mybridge002

networks:
  mybridge001:  #網路空間名稱，模式預設都會是birdge
  mybridge002:  #網路空間名稱
networks:
  mybridge001:  #網路空間名稱，模式都會是birdge
  mybridge002:  #網路空間名稱
  myhost001:
    driver: host #網路空間類型
```

查看網路空間：

```bash
➜  dk練習 docker network ls
NETWORK ID     NAME             DRIVER    SCOPE
9e5d8527e2f5   bridge           bridge    local
3f2dd0a5528a   dk_mybridge001   bridge    local
828e8ccbcd74   dk_mybridge002   bridge    local
a21823e2ef89   host             host      local
eaadd419454a   my-bridge        bridge    local
7f054863856c   none             null      local
```

### Volume

```yaml
version: '3.7' #指定的Docker-compose版本
services: #Container管理
  #使用Volume範例
  myweb4:   
    build:
      context: .  
    image: asce55123/myweb4:latest 
    ports:
      - "8084:80"
    networks:
      - mybridge002
    volumes:
      - mainpage-vol002:/var/www/locahost/htdocs/
networks:
  mybridge001:  #網路空間名稱，模式都會是birdge
  mybridge002:  #網路空間名稱
  myhost001:
    driver: host

volumes:
  mainpage-vol002: #volume名稱
```

就完成了volume的設定方式。

## 語法整理

1.  建立docker compose（應該不算語法）

```bash
touch docker-compose.yml
```

2.  使用docker compose 建立image

```bash
docker-compose build --no-cache
```

> 額外說明-docker-compose build –no-cache:

`--no-cache`指令會跟docker daemon說不要使用本地已經有的image，而是去根據Dockerfile去製作全新的image來用。

3.  使用docker compose 運行Container們

```bash
docker-compose up -d
```

4.  使用docker compose 下架Container們

```bash
docker-compose down
```

## 簡化專案佈版流程

### 架構圖

![佈版流程架構圖](/archive/2022-02-08-docker-4-docker-compose/佈版流程架構圖.png)

3000對應到的是首頁，8080則是API，3306則是mysql server

![講解](/archive/2022-02-08-docker-4-docker-compose/講解.png)

### 目錄架構

```bash
➜  ~ cd /Users/yen/Downloads/docker-course-grand-demo-compose-master
➜  docker-course-grand-demo-compose-master ls
app                db                 docker-compose.yml web
➜  docker-course-grand-demo-compose-master
```

總共有三個資料夾，APP、DB、web，還有docker-compose.yaml設定檔，其中還有一個.env的隱藏檔案，（使用`ls -a`）查看環境參數

```bash
➜  docker-course-grand-demo-compose-master ls -a
.                  .env               db                 web
..                 app                docker-compose.yml
➜  docker-course-grand-demo-compose-master cat .env
MYSQL_ROOT_PASSWORD=1234
MYSQL_USER=demo_java
MYSQL_PASSWORD=1234
MYSQL_DATABASE=demo_db

API_HOST_IP=localhost
```

API_HOST_IP，MAC/WINDOWS使用=localhost，Toolbox使用192.168.99.100

```yaml
version: "3.7"
services: 
  mysql-db:
    #設定容器名稱
    container_name: mydb 
    build:
      #dockerfile的位置在目錄的db資料夾子目錄
      context: ./db
    #產生的image
    image: uopsdod/mysql-db-01
    ports: 
      - "3306:3306"
    environment:
    #這四個變數會被 .env的值取代掉
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
    networks:
      my-bridge-001:
    volumes:
      - db-data:/var/lib/mysql
  java-app:
    container_name: myapp
    build:
      context: ./app
    image: uopsdod/java-app-01
    ports:
      - "8080:8080"
    #JAVA特有 指令./wait-for-it.sh mydb:3306，等待db啟動成功，mydb會在啟動成功之後自動替換成內部ip位置  
    command: ./wait-for-it.sh mydb:3306 -- java -jar target/accessing-data-mysql-0.0.1-SNAPSHOT.jar 
    environment:
      #只有在同一個客製bridge空間下，才可以使用internal domain name(mydb)
      - DB_HOST_IP=mydb
    networks:
      my-bridge-001:
  react-web:
    container_name: myweb
    build:
      context: ./web
    image: uopsdod/react-web-01
    #不用特別記
    command: ./wait-for-it.sh ${API_HOST_IP}:8080 -- npm start
    ports: 
      - "3000:3000"
    environment:
        #REACT_APP_API_HOST_IP是Linux VM IP位置(API位置)
      - REACT_APP_API_HOST_IP=${API_HOST_IP}

networks:
  my-bridge-001:

volumes:
  db-data:
```

其他資料夾下面的dockerfile檔案，或是其他不用特別記得地方，都是因專案不同而改變的，希望接下來可以成功運行SpringBoot專案，詳細教材或是使用可以參考：https://hahow.in/courses/5df27f1fa5ee510022a08500/discussions?item=5e996c2ceaba8a841a496570&unit=5df28221a5ee510022a08607

## 如何建立乾淨的測試環境

在docker-compose.yaml裡面，不要加入volume值，這樣執行完畢後就會清空了，相當於rolback

## 規模化部署Docker Swarm

觀念解說圖：

![](/archive/2022-02-08-docker-4-docker-compose/swarmmode.png)

重點在於，Manager Node只在乎能不能達成目標狀態，所以Container或是Worker Node也不重要，即時Container刪除了，某個Task不能運作，也會馬上向Worker Node再要一個新的Container，完成所有Task都執行的目標。

### 容器規模化部署方案比較

![](/archive/2022-02-08-docker-4-docker-compose/規模化部署比較.png)

## 未來加強路線

![](/archive/2022-02-08-docker-4-docker-compose/未來加強路線.png)
