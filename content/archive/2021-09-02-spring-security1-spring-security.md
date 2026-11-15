---
title: "Spring Security(1)認識Spring Security＆微演練"
description: "認識Spring Security＆實際演練"
date: "2021-09-02"
categories: ["Spring Security學習筆記"]
tags: ["Spring Security", "Springboot"]
cover: "/archive/2021-09-02-spring-security1-spring-security/cover.jpeg"
legacyUrl: "/p/spring-security1認識spring-security微演練/"
---

## 什麼是Spring Security ？

Spring Security 是一個安全框架，

在安全方面有兩個核心機制：驗證（authentication），大致上就是指系統去認證使用者是否能登入，授權（authorization）就是給予用戶權限去做某些特定的操作。

## 簡單實作了解實際功用

下面示範Spring Security的實際作用，只需幾個步驟就可以解決！

## Maven設定

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## 設計Controller

```java
@RestController
public class TestController {

    @RequestMapping("/test123")
    public String test() {
        return "安安123";
    }
```

## 實際運行結果

這樣就可以執行了，但是一般來說，我們輸入localhost:8080/test123時，應該會出現方法的回傳訊息"安安123"，但當我們將網頁導向localhost:8080/test會出現下面這張照片：

![要求登入畫面](/archive/2021-09-02-spring-security1-spring-security/要求登入畫面.png)

在Spring Security中，預設的帳號是user，密碼則是可以從後台的console看到

![密碼地方](/archive/2021-09-02-spring-security1-spring-security/密碼地方.png)

所以帳號輸入：user 密碼則輸入程式運行時給的密碼，就能成功看到畫面：

![](/archive/2021-09-02-spring-security1-spring-security/123.png)

在這嘗試玩之後個人有使用APItester做get測試，結果會回傳401錯誤，如下圖：

![](/archive/2021-09-02-spring-security1-spring-security/apitester.png)

到這邊就差不多了解到了Spring Security 的作用之處了，期待日後的學習能更順利～！。
