---
title: "Spring Security(2)使用Spring Security自定義使用者帳密、使用JDBC串接資料庫"
description: "使用Spring Security自定義使用者帳密，之後再使用JDBC串接資料庫，難度有點高花了點時間了解"
date: "2021-09-04"
categories: ["Spring Security學習筆記"]
tags: ["Spring Security", "JDBC", "Springboot", "MYSQL", "JDBC Authentication", "WebSecurityConfigurerAdapter", "UserDetailsService"]
cover: "/archive/2021-09-04-spring-security2-spring-security-jdbc/cover.jpeg"
legacyUrl: "/p/spring-security2使用spring-security自定義使用者帳密使用jdbc串接資料庫/"
---

繼上一章了解到了Spring Security基本的作用之後，本章節來繼續深入瞭解有關Spring Security中權限還有認證的相關設置，以及如何串接MySql資料庫數據來進行用戶認證 大概會用到的核心功能有JDBC Authentication、WebSecurityConfigurerAdapter、UserDetailsService

## 自訂用戶、查詢資料庫中帳號密碼

在Spring Security中，自訂登入系統的帳號與密碼主要有二種方法兩種，第一種就是透過程式設定來在後臺上寫上固定的自定義帳號密碼，第二種則是

#### 添加依賴

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

#### 配置application.properties

語法如下，也是最簡單的方式，在resource下找到application.properties並輸入：

```xml-dtd
spring.security.user.name=testad #自定義帳號
spring.security.user.password=abc123 #自定義密碼
```

#### 透過繼承類別WebSecurityConfigurerAdapter

先新增一個類別SecurityConfig來繼承WebSecurityConfigurerAdapter，WebSecurityConfigurerAdapter是專門用來配置Spring Security的一個類別：

```java
@Configuration
//小複習:當@Configuration加在class上，表示這是一個設定spring用的class（裡面寫的東西都是設定spring)
public class SecurityConfig extends WebSecurityConfigurerAdapter {
  //...
}
```

再來使用configure方法來設置我們的用戶設定，在IDEA中點擊右鍵-\>Generate-\>Override Methods選擇我們要覆寫的方法configure(AuthenticationManagerBuilder auth)（真是方便）

會出現：

```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    super.configure(auth);
}
```

在這個方法中，主要透過auth來設置我們的用戶名以及密碼，但在下面得例子中，也使用了Spring Security提供了類別的BCryptPasswordEncoder來加密我們的密碼，在使用BCryptPasswordEncoder時，因為我們改變了password()的接受參數類型，所以也要記得使用@Bean來實作一個password類型

```java
@Bean
PasswordEncoder password(){
    return new BCryptPasswordEncoder();
}
```

再來就是Spring Security在進行安全驗證時，會收到輸入請求中的使用者名稱(username)，然後呼叫UserDetailsService，UserDetailsService是Spring Security用來載入使用者資訊的一個組件，他的功能就是可以提供UserDetailsService中的一個方法loadUserByUsername(String username)，來依據username回傳資料型別UserDetails的使用者資訊（參考文章：[Spring Security UserDetailsService 用途](https://matthung0807.blogspot.com/2019/09/spring-security-userdetailsservice.html))

所以我們先

#### 實作UserDetailsService

在implements UserDetailsService的時候，只需要實作一個方法就好，那就是loadUserByUsername，在學習這裡時，稍微了解到了@Service以及＠Component的差別，就是除了閱讀讓人知道Service是處理業務邏輯之外，實際上功能其實都是一樣讓class變成Bean。

```java
//MyUsersDetailService完整程式碼：

@Service 
public class MyUsersDetailService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
        //權限(固定用法,role是還沒用到所以拿來暫時先隨便亂取）
        List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList("role");
        //return 用戶名稱,密碼,用戶角色（權限），用戶角色不可以為Null!
        return new User("testusername",new BCryptPasswordEncoder().encode("abc123"),auths);
    }
}
```

再來就是在SecurityConfig使用@Autowird,但會發現：

![autowird錯誤](/archive/2021-09-04-spring-security2-spring-security-jdbc/autowird錯誤.png)

這是因為springboot找到兩個相同類型的Bean，但只要加上@Qualifier就可以解決了（複習：bean名字是class名稱第一個字轉成小寫）

所以變成這樣：

```java
@Autowired
@Qualifier("myUsersDetailService")
private UserDetailsService userDetailsService;
```

到這裡，就可以嘗試使用帳號testusername，密碼abc123登入頁面了，完整的SecurityConfig程式碼如下：

```java
@Configuration
//小複習:當@Configuration加在class上，表示這是一個設定spring用的class（裡面寫的東西都是設定spring)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    @Qualifier("myUsersDetailService")
    private UserDetailsService userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(password());
    }

    @Bean
    PasswordEncoder password(){
        return new BCryptPasswordEncoder();
    }
}
```

透過以上步驟就算是可以在程式裡面新增自定義的用戶帳號密碼了，接下來就是要嘗試連接MySql資料庫來透過Spring Security做登入，在這之前其實有稍微了解了一下大致上有兩種方法，第一種方法是由上面的程式繼續使用Spring Security結合MyBatis，主要就是在另外在 MyUsersDetailService中利用MyBatis＋Mapper的方式對資料庫做操作把return值稍微更改成資料庫查詢出來的數據並在驗證，詳細介紹影片：[youtube](https://www.youtube.com/watch?v=HCJH6I5egJk&list=PLmOn9nNkQxJEnBjOMEXPLRjoTRNvhHIl2&index=11)

## 透過MySql以及JDBC來做登入-jdbcAuthentication

第二種方法其實Spring Security 提供了 JDBC User Service，比起在前面實作UserDetailsService的時，會少了很多步驟，Spring Security提供的JDBC User Service設定也比較簡單，首先需要加入相關的依賴：

#### 添加Maven配置

添加了JDBC、ＭySql

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.22</version>
</dependency>
```

#### 資料庫設定

簡單的設定一下資料庫

![](/archive/2021-09-04-spring-security2-spring-security-jdbc/mysql設置.png)

在使用jdbcAuthentication時，可以先稍微了解下面函式：

|                   函式                   |                   功能                   |
|:----------------------------------------:|:----------------------------------------:|
|           jdbcAuthentication()           | 表示我們正在使用 JDBC 身份驗證，固定寫法 |
|    dataSource(Datasource dataSource)     | 表示我們正在使用 JDBC 身份驗證，固定寫法 |
|    usersByUsernameQuery(String query)    |        設定查找用戶資料的sql語句         |
| authoritiesByUsernameQuery(String query) |        設定查找用戶權限的sql語句         |

知道了這些之後，在Spring Security使用 JDBC時，寫法跟格式是相對固定的，但也是官方建議的寫法，有要求在執行sql的語句usersByUsernameQuery有三樣東西不能少回傳，也就是説在Table裡面一定要有這些數據，就是帳號（username)、密碼(password)、以及是否啟用(Enabled)，authoritiesByUsernameQuery則是要求帳號（username)、以及角色(role)，且一定要使用到上面那些函式，如果我們沒有回傳權限的話，錯誤訊息大致上會長這樣：

![](/archive/2021-09-04-spring-security2-spring-security-jdbc/error.png)

所以我們就開始設定的Database，以及先創造使用者資料如下：

```sql
CREATE DATABASE securitydata

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30),
    password VARCHAR(60),
    role VARCHAR(30) ,
    enabled TINYINT
)

INSERT INTO users (username, password,role,enabled) VALUES ('admin', 'abc123','ROLE_ADMIN',1)
INSERT INTO users (username, password,role,enabled) VALUES ('uuu123', 'ccc123','ROLE_USER',1)
INSERT INTO users (username, password,role,enabled) VALUES ('123456', 'dog555','ROLE_USER',1)
INSERT INTO users (username, password,role,enabled) VALUES ('888', 'yuyu','ROLE_USER',0)
```

接著就在SecurityConfig裡面完成我們的設定，

```java
@Configuration
//小複習:當@Configuration加在class上，表示這是一個設定spring用的class（裡面寫的東西都是設定spring)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private DataSource dataSource;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        String sql="SELECT username,password,enabled FROM users WHERE username=?";
        String authorsql="SELECT username,role FROM users WHERE username=?";
        auth.jdbcAuthentication()
                .dataSource(dataSource)
                .usersByUsernameQuery(sql)
                .authoritiesByUsernameQuery(authorsql)
                .passwordEncoder(new BCryptPasswordEncoder());
    }

}
```

完成了之後，我們嘗試運行程式並且登入會出現下面的畫面：

![](/archive/2021-09-04-spring-security2-spring-security-jdbc/bad_credentials.png)

原因是因為，我們在configure裡面使用了passwordEncoder做加密，但是對於sql資料庫來說，密碼卻沒有加密，所以我們就直接使用update寫法，幫我們先產生出加密完的密碼並存放到資料庫，這邊要記得在資料庫中`password VARCHAR(60)`是因為加密後的長度會超過本來設定的(30)所以我參考了網路上給的長度(60)

完整程式碼長這樣：

```java
@Configuration
//小複習:當@Configuration加在class上，表示這是一個設定spring用的class（裡面寫的東西都是設定spring)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
        //設定自定義密碼
        String rawpassword = "ccc123";
        //設定變數，這個變數存放加密完成後的密碼
        String encodepassword =encoder.encode(rawpassword);
        String encodesql="UPDATE users SET password=:userpassword WHERE username='uuu123'";
        Map<String, Object> map =new HashMap<>();
        map.put("userpassword",encodepassword);
        namedParameterJdbcTemplate.update(encodesql,map);
                //要記得上面會一直重複，算是臨時性測試用的
      
        String sql="SELECT username,password,enabled FROM users WHERE username=?";
        String authorsql="SELECT username,role FROM users WHERE username=?";
       // auth.userDetailsService(userDetailsService).passwordEncoder(password());
        auth.jdbcAuthentication()
                .dataSource(dataSource)
                .usersByUsernameQuery(sql)
                .authoritiesByUsernameQuery(authorsql)
                .passwordEncoder(new BCryptPasswordEncoder());
    }

}
```

運行程式看到Started DemoApplication後，可以直接看到Table資料已經改變：

![](/archive/2021-09-04-spring-security2-spring-security-jdbc/encodesucess.png)

之後就可以登入成功並且看到畫面了！（淚）
