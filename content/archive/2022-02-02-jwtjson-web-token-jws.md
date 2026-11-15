---
title: "JWT(JSON Web Token)原理介紹&實作JWS"
description: "認識JWT，並且實作"
date: "2022-02-02"
categories: ["Java筆記"]
tags: ["Java筆記", "JWT", "JWS"]
cover: "/archive/2022-02-02-jwtjson-web-token-jws/cover.jpeg"
legacyUrl: "/p/jwtjson-web-token原理介紹實作jws/"
---

現在網上大多數介紹JWT的文章實際介紹的都是JWS(JSON Web Signature),也往往導致了人們對於JWT的誤解，但是JWT並不等於JWS，JWS只是JWT的一種實現，除了JWS外，JWE(JSON Web Encryption)也是JWT的一種實現

原文網址：https://kknews.cc/code/ok4j92o.html

# 什麼是JWT

JWT 的全名是 `JSON Web Token`，是一種基於 JSON 的開放標準([RFC 7519](https://tools.ietf.org/html/rfc7519))，它定義了一種簡潔(compact)且自包含(self-contained)的方式，用於在雙方之間安全地將訊息作為 JSON 物件傳輸。而這個訊息是經過數位簽章(Digital Signature)，因此可以被驗證及信任。可以使用 `密碼`(經過 **HMAC** 演算法) 或用一對 `公鑰/私鑰`(經過 **RSA** 或 **ECDSA** 演算法) 來對 JWT 進行簽章。

## 什麼情況適合使用 JWT

- **授權(Authorization)**：這是很常見 JWT 的使用方式，例如使用者從 Client 端登入後，該使用者再次對 Server 端發送請求的時候，會夾帶著 JWT，允許使用者存取該 token 有權限的資源。單一登錄(Single Sign On)是當今廣泛使用 JWT 的功能之一，因為它的成本較小並且可以在不同的網域(domain)中輕鬆使用。
- **訊息交換(Information Exchange)**：JWT 可以透過公鑰/私鑰來做簽章，讓我們可以知道是誰發送這個 JWT，此外，由於簽章是使用 header 和 payload 計算的，因此還可以驗證內容是否遭到篡改。

## 環境設置

JDK版本：17

### Jsonwebtoken套件

透過這個套件能更方便的創建、完成驗證 JWT，java11是沒有辦法安裝0.9.x以下的版本，在寫法上也略有些不同，所以安裝了0.11.2。

### Maven

```xml
<!--jwt-->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.2</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.2</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.2</version>
</dependency>
```

# JSON Web Signature(JWS)

JWS的組合可以看成是三個JSON object，並且用\*\*.\*\*來做區隔，而這三個部分會各自進行編碼，組成一個JWT字串。

也就是變成：**xxxxx.yyyyy.zzzzz**

- JWT 其實是一種格式
- JWT 實作出來基本上就是 JWS 或是 JWE
- JWS 有三段，JWE 有五段

JWS的三段方別式Header、Payload，以及Signature，接下來會編介紹編實作

# 產生JWS

根據官方，我們可以按這下面的流程完成JWS的產生

1.  使用`Jwts.builder()`方法創建一個`JwtBuilder`實例。
2.  調用`JwtBuilder`方法以根據需要添加標頭參數和聲明。（也就是Header跟Payload）
3.  指定要用於簽署 JWT的`SecretKey`或非對稱`PrivateKey`
4.  最後用`compact()`方法進行壓縮和簽名，產生最終的 JWS。

## 頭部 Header

由兩個欄位組合：

1.  alg

也就是token被加密的演算法，如**HMAC**、**SHA256**、**RSA**

2.  typ

也就是token的type，基本上就是**JWT**

範例：

    {
        "alg": "HS256",
        "typ": "JWT"
    }

頭部用於描述關於該JWT的最基本的信息，例如其類型以及簽名所用的算法等。 **JSON內容要經Base64 編碼生成字符串成為Header。**

根據官方， JJWT 會根據使用的簽名算法或壓縮算法自動設置`alg`或`zip`標頭參數。其他要加東西可以參考`setHeader(header)`相關方法

## 載賀 Payload

這裡放的是聲明(Claim)內容，也就是用來放傳遞訊息的地方，在定義上有三種聲明：

1.  Registered claims

可以想成是標準公認的一些訊息**建議**你可以放，但並不強迫，例如：

- iss(Issuer)：JWT簽發者
- exp(Expiration Time)：JWT的過期時間，過期時間必須大於簽發JWT時間
- sub(Subject)：JWT所面向的用戶
- aud(Audience)：接收JWT的一方
- nbf(Not Before)：也就是定義擬發放JWT之後，的某段時間點前該JWT仍舊是不可用的
- iat(Issued At)：JWT簽發時間
- jti(JWT Id)：JWT的身分標示，每個JWT的Id都應該是不重複的，避免重複發放

### 實作

官方範例：

String jws = Jwts.builder()

```java
.setIssuer("me")
.setSubject("Bob")
.setAudience("you")
.setExpiration(expiration) //a java.util.Date
.setNotBefore(notBefore) //a java.util.Date 
.setIssuedAt(new Date()) // for example, now
.setId(UUID.randomUUID()) //just an example id

/// ... etc ...
```

所以這邊我寫成這樣

```java
private static final long EXPIRE_TIME = 15 * 60 * 1000; //過期時間，15分鐘
    /**
     * 生成jws
     * @param id UUID，這邊是唯一ID，也就是可以放UserID的參數
     * @param subject 使用者資訊，EX:可以放使用者物件
     * @param ttlMillis 過期時間
     * @return
     */
public static String creatJWT(String id,String subject,Long ttlMillis){

    long nowMillis = System.currentTimeMillis(); //.currentTimeMillis() 方法返回當前時間(毫秒)
    Date now=new Date(nowMillis); //如果傳進的預設時間為null，預設過期時間設為15分鐘
    if(ttlMillis  == null){
        ttlMillis=JWTutils.EXPIRE_TIME;
    }
  
    long expMills = nowMillis + ttlMillis; //過期時間點＝目前時間＋過期時間
    Date expDate = new Date(expMills); //將時間轉換成Date物件

    JwtBuilder builder = Jwts.builder()
            .setId(id) //JWT的身分標示
            .setSubject(subject) //主題可以是json數據
            .setIssuer("yen") //簽發者
            .setIssuedAt(now) //簽發時間
            .setExpiration(expDate);//設置過期時間

    return builder.compact();
}
```

## 簽名 Signature

簽章（Signature ）是將被轉換成 Base64 編碼的 Header、Payload 與自己定義的密鑰，透過在 Header 設定的雜湊演算法方式所產生的。

由於密鑰並非公開，因此伺服器端在拿到 Token 後，能透過密鑰解碼，確認資料內容正確，且未被變更，以驗證對方身份。

### 產生私有密鑰

官方說明密鑰格式：

如果要用 HMAC-SHA 算法簽署 JWS的話，我們的密鑰必須符合`signWith`方法參數，所以先看一下sign方法的參數，可以知道密鑰必須是Key類型的：

```java
JwtBuilder signWith(Key var1, SignatureAlgorithm var2) throws InvalidKeyException;
```

這裡要注意的是，官方範例私有密鑰給的是SecretKey類型，但是到了0.11.x版本參數已經變成了Key類型了

官方範例：

```java
SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretString));
```

secretString就是自定義的私鑰，也是需要經過加密，且官方建議要創建一個新的隨機的密鑰，所以在類別裡面宣告一個密鑰（但是我把它固定，如果想用隨機，可以用UUID的方式，這個密鑰必須也要符合HMAC-SHA簽名演算法，官方文件大致的意思我們的密鑰必須與簽名演算法長度符合。

- `HS256`是 HMAC-SHA-256，它會生成 256 位（32 字節）長的摘要，因此`HS256` *要求*您使用至少 32 字節長的密鑰。
- `HS384`是 HMAC-SHA-384，它會產生 384 位（48 字節）長的摘要，因此`HS384` *要求*您使用至少 48 字節長的密鑰。
- `HS512`是 HMAC-SHA-512，它會生成 512 位（64 字節）長的摘要，因此`HS512` *要求*您使用至少 64 字節長的密鑰。

官方建議的寫法是使用SignWith方法，如下

```java
String jws = Jwts.builder()

   // ... etc ...

   .signWith(key) // <---

   .compact();
```

```java
private static final String TOKEN_SECRET = "cuAihCz53DZRjZwbsGcZJ2Ai6At+T142uphtJMsk7iQ=";
```

```java
public  static  Key generalKey(){
    byte[] encodeKey = Decoders.BASE64.decode(JWTutils.TOKEN_SECRET);
    Key key= Keys.hmacShaKeyFor(encodeKey);
    return key;

}
```

然後在我們要進行產生的類別裡使用

```java
public static String creatJWT(String id,String subject,Long ttlMillis){

        /*....
        */
    //SecretKey secretKey = generalKey(); //生成私有密鑰 (jwt 0.9.0)
  SignatureAlgorithm signatureAlgorithm=SignatureAlgorithm.HS256;//密鑰加密演算法  
  Key secretKey = generalKey();

    JwtBuilder builder = Jwts.builder()
            .signWith(secretKey,signatureAlgorithm)

    return builder.compact();
}
```

### 完整JWS程式碼

結合上面的，就完成了如何生成JWS

```java
public static String creatJWT(String id,String subject,Long ttlMillis){

    //SignatureAlgorithm signatureAlgorithm=SignatureAlgorithm.ES256; jwt(0.9.0)
    SignatureAlgorithm signatureAlgorithm=SignatureAlgorithm.HS256;
    long nowMillis = System.currentTimeMillis(); //.currentTimeMillis() 方法返回當前時間(毫秒)
    Date now=new Date(nowMillis);
    //如果傳進的預設時間為null，預設過期時間設為15分鐘
    if(ttlMillis  == null){
        ttlMillis=JWTutils.EXPIRE_TIME;
    }
    long expMills = nowMillis + ttlMillis; //過期時間點＝目前時間＋過期時間
    Date expDate = new Date(expMills);

    //SecretKey secretKey = generalKey(); //生成私有密鑰 (jwt 0.9.0)
    Key secretKey = generalKey();

    JwtBuilder builder = Jwts.builder()
            .setId(id)
            .setSubject(subject) //主題可以是json數據
            .setIssuer("yen") //簽名
            .setIssuedAt(now) //簽發時間
            .signWith(secretKey,signatureAlgorithm)
            //.signWith(signatureAlgorithm,secretKey) //(jwt 0.9.0)使用ES256演算法簽名，第二個參數為密鑰
            .setExpiration(expDate);//設置過期時間

    return builder.compact(); //最後使用compact()   進行生成
}
```

接著可以按照使用者傳不同的參數，可決定我們要預設產生什麼參數

```java
/**
 * 生成jwt
 * @param subject
 * @param ttlMillis
 * @return
 */
//沒給ID
public static String creatJWT(String subject,Long ttlMillis){
    if(ttlMillis  == null){
        ttlMillis=JWTutils.EXPIRE_TIME;
    }
    return  creatJWT(getUUID(),subject,ttlMillis);
}

/**
 * 生成jwt
 * @param subject
 * @return
 */
//只有給要存什麼
public static String creatJWT(String subject){
    return  creatJWT(getUUID(),subject,null);
}

//隨機產生UUID方法
private static String getUUID(){
 return UUID.randomUUID().toString();
}
```

# 解析JWS

官方給的解析JWS流程：

1.  使用該`Jwts.parserBuilder()`方法創建一個`JwtParserBuilder`實例。
2.  指定要用於驗證 JWS 簽名的`SecretKey`或非對稱的`PublicKey`
3.  調用的`build()`方法`JwtParserBuilder`以返迴`JwtParser`。
4.  最後，`parseClaimsJws(String)`使用您的 jws 調用該方法`String`，生成原始 JWS。
5.  整個調用被包裝在一個 try/catch 塊中，以防解析或簽名驗證失敗。

官方範例：

```java
Jws<Claims> jws;

try {
    jws = Jwts.parserBuilder()  // (1)
    .setSigningKey(key)         // (2)
    .build()                    // (3)
    .parseClaimsJws(jwsString); // (4)
    

    // we can safely trust the JWT

catch (JwtException ex) {       // (5)
    

    // we *cannot* use the JWT as intended by its creator

}
```

## 實作

```java
/**
 * 解析JWT
 *
 * @param jwt 要解析的jwt
 * @return
 * @throws Exception
 */
public static Claims parseJWT(String jwt) throws Exception{
    Key secretKey = generalKey(); //簽名祕鑰，和生成的簽名的祕鑰一模一樣
    return Jwts
            .parserBuilder()
            .setSigningKey(secretKey) //設定簽名的祕鑰
            .build()
            .parseClaimsJws(jwt).getBody(); //設定需要解析的jwt
}
```

# 測試

```java
public static void main(String[] args) throws Exception {
    //生成
    String token = JWTutils.creatJWT("測試", null);
    System.out.println("生成token=:" + token);
    //解析
    try {
        Claims claims = JWTutils.parseJWT(token);
        System.out.println("解析成功：" + claims.getSubject());

     }catch (Exception exception){
      System.out.println("解析失敗:");
        exception.printStackTrace();
     }
}
```

ConSole:

    生成token=:
    eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJiNTVhNThmYi00YTc3LTQ5ZjMtYTkwNy1jNjFiNGRiOGVjOTIiLCJzdWIiOiLmuKzoqaYiLCJpc3MiOiJ5ZW4iLCJpYXQiOjE2NDM3OTU0MzIsImV4cCI6MTY0Mzc5NjMzMn0.zxknrxmnEiA90Z6MwvpNEBxdp-6tDvvjUZ5Sjy7mdYA
    解析成功：測試

就說明成功了！

接著到https://jwt.io 做測試，把剛剛生成的token貼上

![](/archive/2022-02-02-jwtjson-web-token-jws/2.png)

看到藍色勾勾代表成功了

所以可見我們認證流程如下：

![](/archive/2022-02-02-jwtjson-web-token-jws/1.png)

[圖片來源](https://medium.com/%E9%BA%A5%E5%85%8B%E7%9A%84%E5%8D%8A%E8%B7%AF%E5%87%BA%E5%AE%B6%E7%AD%86%E8%A8%98/%E7%AD%86%E8%A8%98-%E9%80%8F%E9%81%8E-jwt-%E5%AF%A6%E4%BD%9C%E9%A9%97%E8%AD%89%E6%A9%9F%E5%88%B6-2e64d72594f8)

# 完整程式碼

```java
package com.example.demo.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.web.header.Header;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

//生成jwt工具
public class JWTutils {
    /**
     *
    一個JWT由三部分组成：
    header（頭部） —— base64編碼的Json字符串
    payload（資料）—— base64編碼的Json字符串
    signature（簽名）—— JWT 的最後一部分是 Signature ，這部分內容有三個部分，
    先是用 Base64 編碼的 header.payload ，再用加密演算法加密一下，加密的時候要放進去一個 Secret ，
    這個相當於是一個密碼，這個密碼祕密地儲存在服務端。
    中間用點分隔開，並且都會使用 Base64 編碼
    */

    //過期時間，15分鐘
    private static final long EXPIRE_TIME = 15 * 60 * 1000;
    //私鑰
    //private static final String TOKEN_SECRET = "privateKey";
    private static final String TOKEN_SECRET = "cuAihCz53DZRjZwbsGcZJ2Ai6At+T142uphtJMsk7iQ=";

    /**
     * 生成jwt
     * @param id UUID
     * @param subject 資訊
     * @param ttlMillis 過期時間
     * @return
     */
    //id是唯一的id，uuid進行生成，subject是jwt帶的數據，ttlMills是超時時間
    public static String creatJWT(String id,String subject,Long ttlMillis){

        //SignatureAlgorithm signatureAlgorithm=SignatureAlgorithm.ES256; jwt(0.9.0)
        SignatureAlgorithm signatureAlgorithm=SignatureAlgorithm.HS256;
        long nowMillis = System.currentTimeMillis(); //.currentTimeMillis() 方法返回當前時間(毫秒)
        Date now=new Date(nowMillis);
        //如果傳進的預設時間為null，預設過期時間設為15分鐘
        if(ttlMillis  == null){
            ttlMillis=JWTutils.EXPIRE_TIME;
        }
        long expMills = nowMillis + ttlMillis; //過期時間點＝目前時間＋過期時間
        Date expDate = new Date(expMills);

        //SecretKey secretKey = generalKey(); //生成私有密鑰 (jwt 0.9.0)
        Key secretKey = generalKey();

        JwtBuilder builder = Jwts.builder()
                .setId(id)
                .setSubject(subject) //主題可以是json數據
                .setIssuer("yen") //簽名
                .setIssuedAt(now) //簽發時間
                .signWith(secretKey,signatureAlgorithm)
                //.signWith(signatureAlgorithm,secretKey) //(jwt 0.9.0)使用ES256演算法簽名，第二個參數為密鑰
                .setExpiration(expDate);//設置過期時間

        return builder.compact();
    }

    /**
     * 生成jwt
     * @param subject
     * @param ttlMillis
     * @return
     */
    public static String creatJWT(String subject,Long ttlMillis){
        if(ttlMillis  == null){
            ttlMillis=JWTutils.EXPIRE_TIME;
        }
        return  creatJWT(getUUID(),subject,ttlMillis);
    }

    /**
     * 生成jwt
     * @param subject
     * @return
     */
    public static String creatJWT(String subject){
        return  creatJWT(getUUID(),subject,null);
    }

    //生成令牌
    //public  static  SecretKey generalKey(){ //(jwt 0.9.0)
    public  static  Key generalKey(){
        /*
        byte[] encodeKey = Base64.getDecoder().decode(JWTutils.TOKEN_SECRET);
        SecretKey key = new SecretKeySpec(encodeKey,0, encodeKey.length, "AES");
        */
        byte[] encodeKey = Decoders.BASE64.decode(JWTutils.TOKEN_SECRET);
        Key key= Keys.hmacShaKeyFor(encodeKey);
        return key;

    }

    /**
     * 解析JWT
     *
     * @param jwt 要解析的jwt
     * @return
     * @throws Exception
     */
    public static Claims parseJWT(String jwt) throws Exception{
        //SecretKey secretKey = generalKey(); jwt0.9.0
        Key secretKey = generalKey();
        return Jwts
                /*.parser() jwt(0.9.0)
                //.setSigningKey(secretKey)
                 */
                .parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(jwt)
                .getBody();
    }

    private static String getUUID(){
        return UUID.randomUUID().toString();
    }
    /**
     * 測試JWT生成與解析的工具
     *
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        //生成
        String token = JWTutils.creatJWT("測試", null);
        System.out.println("生成token=:" + token);
        //解析
        try {
        Claims claims = JWTutils.parseJWT(token);
        System.out.println("解析成功" + claims.getSubject());

        }catch (Exception exception){
        System.out.println("解析失敗:");
        exception.printStackTrace();
        }

    }
}
```
