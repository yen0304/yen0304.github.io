---
title: "Freemarker + Spring Security 整合"
description: "在做專案時，遇到了Freemarker + Spring Security 整合的問題，決定筆記下來"
date: "2021-12-23"
categories: ["SpringBoot學習筆記"]
tags: ["SpringBoot學習筆記", "Springboot", "Freemarker", "Spring Security"]
cover: ""
legacyUrl: "/p/freemarker-spring-security-整合/"
---

由於方便往後的實戰學習，在學會了快速的在Spring Boot 使用Freemarker在localhost:8080上執行之後，也學會了用Spring Security 控制訪問權限，在整合他們途中，其實遇到了不少配置上的問題，但也成功解決了，所以決定記錄這些解決問題的過程，也更了解了Spring Security的認證寫法。

## pom.xml maven配置

### Spring Security

（先不要加上spring Security，因為加上去了所有為配置的默認都會受到全縣控管）

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### Freemarker

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-freemarker</artifactId>
</dependency>
```

## Application.properties配置

### Freemaker設定

```yaml
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

## 開始撰寫程式部分

這部分的先後順序很重要，因為如果Freemarker其中有錯誤，css或js會跑不出來，也同樣的Spring Security如果有錯誤，css或js也會因爲訪問權限而跑不出來，所以在撰寫時順序如下

### 撰寫順序

1.  確認Freemarker配置成功，包含get請求，以及靜態資源css js訪問成功
2.  使用Spring Security下，得知靜態支援有受到保護，並請把保護關閉。
3.  使用Spring security測試相關功能。

### Freemaker靜態配置至測試成功

#### 檔案存放位置

檔案存放位置很重要，也跟application.properties很相關，包含了靜態資源的訪問路徑，

這次規劃了user_login.ftl、login.css、login.js為登入Spring Security角色頁面

，login_success、login_success.css為登入成功登入之後跳轉的頁面

![ftl、css、js檔案存放配置](/archive/2021-12-23-freemarker-spring-security/filepath.png)

#### Ftl(html)存取css、js之重點

在login_success下，存取css、js的html語法為下

```html
<link rel="stylesheet" href="/static/css/login.css">
 
<script  src="/static/js/login.js"></script>
```

重點就是因為我們已經配置好了路徑，所以會因Freemarker會有不同的寫法

#### Controller層

應該沒什麼好解釋的

```java
@Controller
public class Controller {

    @GetMapping("/user_login")
    public String loginpage(Model model)
    {
        return "/user_login";
    }

    @GetMapping("/login_success")
    public String successpage(Model model)
    {
        return "/login_success";
    }

}
```

#### 如何判斷測試成功

運行SpringBoot之後，以下圖解是我們看到的畫面，使用瀏覽器是chrome

![運行畫面](/archive/2021-12-23-freemarker-spring-security/freemarker1.jpg)

這時候大致上會有兩種情況就是Http Status 404跟200，404就代表是url路徑錯了，這時候就要去檢查Controller層的url是不是有寫錯，200的話就是測試成功。

### Spring Security部分

#### 檢查靜態檔案是否受保護

Spring Security的方法都是用了建造者模式，

我們如果想得知「有沒有把static資料夾底下的檔案皆不受保護」，

關鍵程式碼就在於在`.authorizeRequests()`之後，使用加上 `.antMatchers("/static/**").permitAll()`來表示此方法裡面的URL皆不受保護，所以如果把這個方法取消掉，就代表static底下的CSS、JS檔案受到保護，所以當我們檢查chrome時，會出現下列圖片

程式碼：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
http.formLogin()
        .loginPage("/user_login").permitAll()
        .and()
            .authorizeRequests()
        .anyRequest().authenticated()
        .and()
        .rememberMe()
        .and()
        .csrf().disable(); 
}
```

結果：

\![302 error\](302 error.jpg)

這樣就代表我們的ftl裡面配置的css、js路徑是正確的， 但因為受到Spring Security的保護，所以就算訪問到了正確的路徑時，也會因受保護出現302的狀態碼，所以把保護關閉這樣寫就好：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
http.formLogin()
        //自定義登入頁面的「url」,加上permitAll()任何使用者都不需認證就可以訪問
        .loginPage("/user_login").permitAll()
        .and()
            .authorizeRequests() //表示要定義哪些被保護，哪些不需要保護（不需要認證）
        .antMatchers("/static/**").permitAll() //表示static底下資料夾都不需要認證
        //沒有被匹配到「URL」的都要透過認證
        .anyRequest().authenticated()
        .and()
        .rememberMe()
        .and()
        .csrf().disable(); //關閉csrf防護
}
```

這邊一樣了附上部分重點程式碼，其他的可以到文章最後的github連結參考。

### Spring Security 補充

#### .anyRequest().authenticated()作用

這次的練習也更認識到了.anyRequest().authenticated()的用法，如果上段程式碼沒有了.anyRequest().authenticated()之後，仍然會訪問成功，所以要加上anyRequest().authenticated()之後，任何網址才會因為加上這個方法後而受保護。

加上.anyRequest().authenticated()後， 可以看到下面圖片，確實是有訪問到login_success的，但也因為login_success，受到保護之後Spring Security就跳轉到了我們設置的登入URL

![](/archive/2021-12-23-freemarker-spring-security/jump.jpg)

## GitHub

[Github](https://github.com/yen0304/Electronic-business-platform)

這個github是一個正在開發的專案，所以會有別的專案，

Spring Security的配置類的Class名稱叫做SecurityConfig。
