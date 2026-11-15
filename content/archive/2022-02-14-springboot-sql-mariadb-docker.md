---
title: "Springboot + SQL (MariaDB) + docker  實作"
description: "如何在Docker上運行springboot專案"
date: "2022-02-14"
categories: ["Docker筆記"]
tags: ["Docker筆記", "Springboot"]
cover: "/archive/2022-02-14-springboot-sql-mariadb-docker/cover.png"
legacyUrl: "/p/springboot-sql-mariadb-docker-實作/"
---

本來是要做Mysql的，但因為本身使用M1，在沒有ARM架構的Mysql Image，所以就改用了MariaDB了

## Docker準備

要下載的主要有與springboot配置一樣版本的資料庫、Redis、JavaJDK

### Images下載

#### MySQL

如果不是用M1可以使用Mysql：

[https://hub.docker.com/\_/mysql?tab=tags](https://hub.docker.com/_/mysql?tab=tags)

    docker pull mysql:8.0.22

M1這時候會出現錯誤訊息：

    no matching manifest for linux/arm64/v8 in the manifest list entries

這時候猜考相關文獻之後：https://quietbo.com/2021/09/27/docker-mac-m1-no-matching-manifest-for-linux-arm64-v8-in-the-manifest-list-entries%E5%B7%B2%E8%A7%A3%E6%B1%BA/

還是可以透過指令下載mysql

    docker pull --platform linux/amd64 mysql:8.0.22

    docker pull --platform linux/amd64 mysql:5.7.33

然後還是會碰到

\[ERROR\] InnoDB: Linux Native AIO interface is not supported on

參考文獻：https://stackoverflow.com/questions/66456627/docker-image-run-in-m1-processor

所以改用MariaDB

#### MariaDB

[https://hub.docker.com/\_/mariadb](https://hub.docker.com/_/mariadb)

#### Redis

[https://hub.docker.com/\_/redis](https://hub.docker.com/_/redis)

    docker pull redis:6.2.5

#### JDK

JDK:https://hub.docker.com/\_/openjdk

    docker pull openjdk:11.0.14-jdk-oracle

## SpringBoot 準備

### Maven配置

除了原本資料庫或Springboot用到的專案，還需要加入`maven-surefire-plugin`這個插件，才可以把專案打包成jar檔案

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.7.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>Demo project for Spring Boot</description>
    <properties>
        <java.version>11</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.session</groupId>
            <artifactId>spring-session-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-freemarker</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.mariadb.jdbc/mariadb-java-client -->
        <dependency>
            <groupId>org.mariadb.jdbc</groupId>
            <artifactId>mariadb-java-client</artifactId>
            <version>2.5.2</version>
        </dependency>

        <dependency>
            <groupId>commons-codec</groupId>
            <artifactId>commons-codec</artifactId>
            <version>1.11</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>2.19.1</version>
            </plugin>
        </plugins>
    </build>

</project>
```

### Application.properties

這邊有使用環境變數（推薦），因為之後從Docker compose一起配置會比較方便而且彈性，不會造成調整了又要重新打包jar的狀況。

```yaml
#DB Configuration
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.datasource.url=jdbc:mariadb://host.docker.internal:3306/db_store?serverTimezone=Asia/Taipei&characterEncoding=utf-8&useSSL=false
spring.datasource.username=${DATABASE_USER}
spring.datasource.password=${DATABASE_PASSWORD}
#Spring Session
## Session 存儲方式
spring.session.store-type=redis
## Session 過期時間，默認單位為 s
server.servlet.session.timeout=600
## Session 存儲到 Redis 鍵的前綴
spring.session.redis.namespace=test:spring:session

#Redis 設定
##埠號
#server.port=8080
# Redis資料庫索引（預設為0）
spring.redis.database=0 
# Redis伺服器地址
spring.redis.host=localhost
# Redis伺服器連線埠
spring.redis.port=6379 
# Redis伺服器連線密碼（預設為空）
spring.redis.password=
#連線池最大連線數（使用負值表示沒有限制）
spring.redis.pool.max-active=8 
# 連線池最大阻塞等待時間（使用負值表示沒有限制）
spring.redis.pool.max-wait=-1 
# 連線池中的最大空閒連線
spring.redis.pool.max-idle=8 
# 連線池中的最小空閒連線
spring.redis.pool.min-idle=0 
# 連線超時時間（毫秒）
spring.redis.timeout=5000

#Freemaker設定
spring.freemarker.cache=false
# 模版後綴名 默認為ftl
spring.freemarker.suffix=.ftl
# 文件編碼
spring.freemarker.charset=UTF-8
# 模版加載的目錄
spring.freemarker.template-loader-path=classpath:/templates/
# 靜態資源訪問路徑
spring.mvc.static-path-pattern=/static/**
# 獲取根目錄路徑
spring.freemarker.request-context-attribute=request
```

### 打包成jar檔案

將此Spring Boot打包為jar檔，本範例直接使用IntelliJ IDEA的Maven視窗工具，點兩下\[install\]即可。

\![\](截圖 2022-02-08 下午10.16.04.png)

打包好之後target資料夾會產生jar檔案

\![\](截圖 2022-02-08 下午10.21.01.png)

## Docker-Compose & Dockerfile

### Docker-Compose

這邊在實作時經歷了自我google摧殘之後得出了下面幾點

1.  不用配置網路空間(Bridge)
2.  **存取SQL的帳號密碼不可以用ROOT，但是還是要給一組Root的密碼**（下面是隨機給）

```yaml
version: '3.7'
# Service
services:
  # Redis
  Redis-server:
    restart: always
    image: redis:6.2.5
    container_name: app-redis
  # Database MySQL
  mariadb-db:
    restart: always
    image: asce55123/mariadb
    privileged: true
    container_name: app-db
    build: 
      context: ./db
    environment:
      MYSQL_DATABASE: db_store
      MARIADB_USER: userspring
      MARIADB_PASSWORD: springboot
      MARIADB_RANDOM_ROOT_PASSWORD: yes
    ports:
      - "3306:3306"
  # APP Server
  app-server:
    restart: always
    image: asce55123/openjdk
    container_name: app-java
    build:
      context: ./java
    ports:
      - "8080:8080"
    environment:
      spring.redis.host: Redis-Server
      DATABASE_USER: userspring
      DATABASE_PASSWORD: springboot
    depends_on:
      - app-db
    command: ./wait-for-it.sh app-db:3306
```

### 檔案目錄結構

```bash
.
├── db
│   ├── Dockerfile
│   └── sqls
│       ├── init.sql
│       └── my.cnf
├── docker-compose.yaml
└── java
    ├── Dockerfile
    └── target
        └── demo-0.0.1-SNAPSHOT.jar
```

會依照目錄結構做介紹：

### 資料庫設定

#### 初始化SQL

首先在db目錄下的sql資料夾新增一個.cnf檔案（這邊叫做my.cnf）

```cnf
[mysql]
default-character-set=utf8

[mysqld]
port=3306
skip-host-cache
skip-name-resolve
character-set-server=utf8
init_connect='SET NAMES utf8'

[client]
port=3306
default-character-set=utf8
```

主要是避免中文亂碼

再來新增init.sql的sql初始化檔案，內容不用去creat database，使用Creat 來新增table或是使用insert語法來初始化自己想要加入的數據。

參考文獻，https://www.tpisoftware.com/tpu/articleDetails/1826

#### Dockerfile

```dockerfile
FROM mariadb:10.7
COPY ./sqls/init.sql /docker-entrypoint-initdb.d/init.sql
COPY ./sqls/my.cnf /etc/mysql/my.cnf
```

這邊就是把init檔案以及設定中文編碼的檔案丟到Docker的容器裡面

### Java設定

```dockerfile
FROM openjdk:11.0.14-jdk-oracle 

COPY ./target/*.jar demo.jar

ENTRYPOINT ["java","-jar","demo.jar"]
```

[Dockerfile](https://matthung0807.blogspot.com/2020/11/docker-what-is-dockerfile.html)指令簡單說明：

1.  `FROM openjdk:11.0.14-jdk-oracle`：使用的base image。
2.  `COPY ./target/*.jar /Documents/mydocker/demo.jar`：將build context，即所在目錄的`target/*.jar`複製到container檔案目錄的/Documents/mydocker/demo.jar。
3.  `ENTRYPOINT ["java","-jar","demo.jar"]`：在container剛指定的`WORKDIR`目錄執行`java -jar demo.jar`。

設定完之後，在運行docker-compose就可以成功運行了
