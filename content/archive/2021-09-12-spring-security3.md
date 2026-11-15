---
title: "Spring Security(3)自定義登入頁面、控制角色權限登入"
description: "透過Spring Security自定義的角色來訪問我們的頁面,.authenticated()、.authorizeRequests() 超級重要，也將訪問頁面設定成前端設計好的頁面，實現真正的前後端分離，減少溝通成本"
date: "2021-09-12"
categories: ["Spring Security學習筆記"]
tags: ["Spring Security", "Springboot"]
cover: "/archive/2021-09-12-spring-security3/cover.jpeg"
legacyUrl: "/p/spring-security3自定義登入頁面控制角色權限登入/"
---

## 前言

在前一章[Spring Security(2)使用Spring Security自定義使用者帳密、使用JDBC串接資料庫](https://yen0304.github.io/p/spring-security2%E4%BD%BF%E7%94%A8spring-security%E8%87%AA%E5%AE%9A%E7%BE%A9%E4%BD%BF%E7%94%A8%E8%80%85%E5%B8%B3%E5%AF%86%E4%BD%BF%E7%94%A8jdbc%E4%B8%B2%E6%8E%A5%E8%B3%87%E6%96%99%E5%BA%AB/)中，我們知道了如何透過Spring Security自定義的角色來訪問我們的頁面，接下來要做的是，如何設定哪些頁面不用登入跟可以訪問、哪些頁面有帳號密碼到才可以訪問，或是我們自定義的權限角色管理員、銷售員、就像賣場的賣家與用戶一樣，去控制這些頁面，也將訪問頁面設定成前端設計好的頁面，實現真正的前後端分離，減少溝通成本。

## 自定義登入頁面

要自定義頁面時，一樣到專門設定Spring Security中的一個類別WebSecurityConfigurerAdapter，在前幾章中我們用了SecurityConfig去繼承他，在自定義頁面時，我們要先實作方法configure(HttpSecurity http)，一樣按右鍵-\>Generate-\>Override Methods，選擇configure(HttpSecurity http)。

在使用之前，值得注意的事情是SecurityConfig的antMatchers順序是有關係的，在每一個url執行時，程式如果返回了True下面就不會執行了，例如，如果anyRequest().permitAll()設定在其他規則比較嚴格條件的前面的話，Spring Security判斷符合條件，就不會往下在走，意思是最鬆的規則應該在放在最後面，越是嚴格的規則要放在前面。

下面範例提供了幾個較常用的功能，如下：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.formLogin() //自定義登入頁面
        .loginPage("/login.html")
        .loginProcessingUrl("/user/login") //設定登入頁面的url
        .usernameParameter("uname")///登入表單form中使用者名稱輸入框input的name名，不修改的話預設是username
        .passwordParameter("pword")//form中密碼輸入框input的name名，不修改的話預設是password
        .defaultSuccessUrl("/home")    //成功登入之後導向
        .and().authorizeRequests() //表示要定義哪些被保護(.authenticated())，哪些不需要保護（authorizeRequests()）
            .antMatchers("/","/hello").permitAll() //設置不管有無登入都可以直接訪問(permitAll)
        .anyRequest().authenticated() //這樣寫代表除了以上之外，其他都需要被保護
        .and().csrf().disable(); //關閉csrf防護
}
```

## 選擇角色權限進行控制的四種方法

在Spring Security中，我們可以針對用戶的角色進行訪問頁面的權限控制，例如說，設定某些頁面管理員才能訪問，有些頁面大家都可以訪問，或是自定義的角色等等，針對各種不同的情況，共有四種方法，返回都是True or False

### 四種方法比較表格

| 方法名稱                             | 舉例                             | 意思                                                 |
|--------------------------------------|----------------------------------|------------------------------------------------------|
| hasAuthority(String authority)       | hasAuthority(“ADMIN”)            | ADMIN角色才可以訪問                                  |
| hasAnyAuthority(String… authorities) | hasAnyAuthority(“ADMIN,MANAGER”) | 有ADMIN或MANAGER其中一個符合就可以訪問               |
| hasRole(String role)                 | hasRole(“Sale”)                  | 角色權限全名ROLE_Sale才可以訪問                      |
| hasAnyRole(String… roles)            | hasAnyRole(“Sale,User”)          | 有角色權限全名ROLE_Sale或ROLE_User其中一者就可以訪問 |

hasAuthority()跟 hasRole()的雖然很像，其實都是設定角色是否可以訪問，但是如果查看一下hasRole()的來源碼，就可以知道差別

```java
private static String hasRole(String role) {
    Assert.notNull(role, "role cannot be null");
    if (role.startsWith("ROLE_")) {
        throw new IllegalArgumentException("role should not start with 'ROLE_' since it is automatically inserted. Got '" + role + "'");
    } else {
        return "hasRole('ROLE_" + role + "')";
    }
}
```

以上我們可以發現，如果在程式裡面設計hasRole(“Sale”)代表在資料庫中，實際上角色全名為ROLE_Sale的才能進行登入，相同的hasAnyRole也是相同的道理。

### 超級重點.authenticated()、.authorizeRequests() （ 20220109更新）

authenticated()的作用，很後面才了解到，他的功能表示登入才可以訪問一切的網址，他其實是Spring Security最重要的一部份，如果沒有加上了他，網址就不會被攔截，可以想像成他就是關閉Spirng Security的一個方法，我也正是理解到了架構。

```java
protected void configure(HttpSecurity http) throws Exception {
    http.formLogin() //自定義登入頁面
       //放有關於登入頁面的設定
        .and().authorizeRequests() 
            //放有關於設定網址的問題，透過.permitAll()來表示不需要被保護的網址
       //或是其他特別的設定
        .anyRequest().authenticated() //再加上這個之後，就變成了除了上面設定以外的網址，其他都需要登入
        .and().csrf().disable(); //關閉防護
}
```

所以通常會這樣設計（上到下權限）：

```java
protected void configure(HttpSecurity http) throws Exception {
    http.formLogin() //自定義登入頁面
        .loginPage("/login.html")
        .loginProcessingUrl("/user/login") //設定登入頁面的url
        .defaultSuccessUrl("home")    //成功登入之後導向
        .and().authorizeRequests() //表示要定義哪些被保護，哪些不需要保護（不需要認證）
                //先設定不用通過的     
                .antMatchers("/","hello").permitAll()
            //角色權限配置篇
            .antMatchers("/manager").hasAuthority("ADMIN") 
            .antMatchers("/manager_2").hasAnyAuthority("ADMIN,MANAGER")
            .antMatchers("/sale_index").hasRole("Sale")
            .antMatchers("/role").hasAnyRole("Sale")
        .anyRequest().authenticated() //
        .and().csrf().disable(); //關閉防護
}
```

## 自定義403頁面

在配置類裡面進行設定沒有權限時返回的頁面403碼，html檔案放在resources/static就可以了

```java
protected void configure(HttpSecurity http) throws Exception {
    http.exceptionHandling().accessDeniedPage("/403.html");
}
```

## 實作

接下來實作方面，我想結合對於資料庫的CRUD做複習，模擬在電商平台做開發時的情況，所以先這樣！
