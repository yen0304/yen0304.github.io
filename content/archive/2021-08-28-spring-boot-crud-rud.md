---
title: "Spring Boot 管理會員資料（二）-CRUD之RUD操作"
description: "練習使用Spring Boot 實現對資料庫之CRUD操作的練習"
date: "2021-08-28"
categories: ["SpringBoot學習筆記"]
tags: ["Springboot", "MYSQL", "HTML", "Spring MVC", "Jquery", "Javascript", "JDBC", "Vue", "CRUD"]
cover: ""
legacyUrl: "/p/spring-boot-管理會員資料二-crud之rud操作/"
---

## 本文章涉及的知識

1.  Springboot 、 Spring MVC
2.  HTTP method
3.  RESTful API
4.  JDBC
5.  mySQL語法
6.  Html、css（小部分）
7.  Javascript 、Jquery、vue（小部分）

## 上一次的進度

\[[Spring Boot 管理會員資料（一）-會員創建](https://yen0304.github.io/p/spring-boot-%e7%ae%a1%e7%90%86%e6%9c%83%e5%93%a1%e8%b3%87%e6%96%99%e4%b8%80-%e6%9c%83%e5%93%a1%e5%89%b5%e5%bb%ba/)\]([https://yen0304.github.io/p/spring-boot-%E7%AE%A1%E7%90%86%E6%9C%83%E5%93%A1%E8%B3%87%E6%96%99%E4%B8%80-%E6%9C%83%E5%93%A1%E5%89%B5%E5%BB%BA/#%E8%B3%87%E6%96%99%E5%BA%AB%E9%80%A3%E7%B7%9A%E8%A8%AD%E5%AE%9A-%E4%BD%BF%E7%94%A8jdbc](https://yen0304.github.io/p/spring-boot-%E7%AE%A1%E7%90%86%E6%9C%83%E5%93%A1%E8%B3%87%E6%96%99%E4%B8%80-%E6%9C%83%E5%93%A1%E5%89%B5%E5%BB%BA/#%E8%B3%87%E6%96%99%E5%BA%AB%E9%80%A3%E7%B7%9A%E8%A8%AD%E5%AE%9A-%E4%BD%BF%E7%94%A8jdbc))

上次的進度用到了CRUD操作中的Create,創建了會員資料，這次就做完剩下的Read、Update、Delete功能，所以HTTP method以及RESTful API的部分請參照上一章節

為了閱讀方便，附上一些本章節會使用到的資訊

Member Class:

```java
public class Member {

    Integer id;

    @NotBlank
    String name;
    @NotBlank
    String account;
    @NotBlank
    String password;
    
    //Getter&Setter
 }
```

## 本章節Dao Interface、Service Dao＆Implement

#### Dao

```java
public interface MemberDao {

    //返回值 依據名稱對應資料庫動作（參數類型 參數名稱）
    String CreatMember(Member member);
    List<Member> ReadMember();
    List<Member> ReadByAccount(String membersAccount);
    String UpdateByAccount(String membersAccount,Member member);
    String DeleteByAccount(String membersAccount);
}
```

#### Service

```java
public interface MemberService {

    String CreatMember(Member member);
    List<Member> ReadMember();
    List<Member> ReadByAccount(String membersAccount);
    String DeleteByAccount(String membersAccount);
    String UpdateByAccount(String membersAccount,Member member);

    }
```

#### ServiceImpl

```java
@Component
public class MemberServiceImpl implements MemberService{

    @Autowired//使用InterFace 發揮spring Ioc特性
    private MemberDao memberDao;

    @Override
    public String CreatMember(Member member) {
        return memberDao.CreatMember(member);
    }

    @Override
    public List<Member> ReadMember() {
        return memberDao.ReadMember();
    }

    @Override
    public List<Member> ReadByAccount(String membersAccount) {
        return memberDao.ReadByAccount(membersAccount);
    }
  
    @Override
    public String DeleteByAccount(String membersAccount) {
        return memberDao.DeleteByAccount(membersAccount);
    }
  
    @Override
    public String UpdateByAccount(String membersAccount,Member member) {
        return memberDao.UpdateByAccount(membersAccount,member);
    }
}
```

## CRUD -Read

#### Read-所有會員資料

在進行Read操作時，在sql是使用SELECT語法，所以在JDBC裡面是使用Query，在query中，會用到RowMapper參數，這個RowMapper的功能就是將資料庫查詢出來的數據轉會成我們要的Java Object。

#### MemberRowMapper設計

```java
public class MemberRowMapper implements RowMapper<Member> {

    @Override
    public Member mapRow(ResultSet resultSet, int i) throws SQLException {
        //ResultSet resultSet = 從資料庫中查詢出來的數據
            Member member=new Member();
            member.setId(resultSet.getInt("id"));
            member.setName(resultSet.getString("name"));
            member.setAccount(resultSet.getString("account"));
            member.setPassword(resultSet.getString("password"));

        return member;
        //返回值= 要轉換的Java Object
    }
}
```

#### Dao設計

```java
@Override
//重要！當方法返回類型為自定義class,spring boot再返回時會自動轉換為json格式
public List<Member> ReadMember() {
    //query(放要執行sql的語法,放spl語法裡面變數的值,將資料查詢出來的數據轉換成java object)
    //SELECT id, name...這邊是想要查詢的數據，不要用SELECT * FROM 查詢所有數據，很浪費流量
    String sql="SELECT id, name ,password ,account FROM member";

    Map<String,Object>map= new HashMap<>();

    List<Member> list =namedParameterJdbcTemplate.query(sql,map,new MemberRowMapper());

    return list;
}
```

#### Controller

```java
@GetMapping("/members")  //讀取所有會員資料
public List<Member> read(){

    return memberService.ReadMember();
}
```

#### HTML & Javascript

HTML方面就是創造一行表格，其他下面的資料交給Vue來自動產生

```html
<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>顯示會員資料</title>
  <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css'><link rel="stylesheet" href="/css/allmemberdatastyle.css">

</head>
<body>
<!-- partial:index.partial.html -->
<div id="memberlist">
  <h1>會員資料</h1>
  <table class="table table-striped table-info">
    <thead>
      <tr>
        <th scope="col">id</th>
        <th scope="col">名稱</th>
        <th scope="col">帳號</th>
        <th scope="col">密碼</th>
      </tr>
    </thead>
    <tbody id="databody"></tbody>
  </table>
</div>
<!-- partial -->
  <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js'></script><script  src="/js/allmemberdatascript.js"></script>

</body>
</html>
```

Javascript

這裡在定義自動生成的html時加上了各個資料的css class名稱，目的是為了在使用JQuery時能順利抓到資料。

```javascript
//新增物件
var memberlist={}; //如果要測試的話這裡可以先填上Json資料
var apiurl="/members";

//定義自動生成的html （資料）
var list_html="<tr><th class='id 'scope='col'>{{id}}</th><th class='name 'scope='col'>{{name}}</th><th class='account' scope='col'>{{account}}</th><th class='password 'scope='col'>{{password}}</th><th scope='col'> <button class='btn btn-primary edit' type='button'>編輯</button><button class='btn btn-danger remove' type='button'>刪除</button></th></tr>";
$.ajax({
  url: apiurl,
  dataType:"json",
  success:function(res){
    memberlist.list=(res);
    for(var i=0;i<memberlist.list.length;i++){
      var current_html=
          list_html.replace("{{id}}",memberlist.list[i].id)
              .replace("{{name}}",memberlist.list[i].name)
              .replace("{{account}}",memberlist.list[i].account)
              .replace("{{password}}",memberlist.list[i].password);
            //memberlist.list[i]代表後端回傳Json格式中的第i筆數據, .xxx代表資料名稱
      $("#databody").append(current_html);
    }
  }
});
```

結果：

![](/archive/2021-08-28-spring-boot-crud-rud/allmemberdata.png)

#### Read-依據帳號查詢

方法跟查詢所有資料幾乎一樣，用了一樣的RowMapper等等，唯一不同的就是SQL語法部分

#### DAO

整理一下差別：

查詢所有資料：

`String sql="SELECT id, name ,password ,account FROM member ";`

依據帳號查詢：

`String sql="SELECT id, name ,password ,account FROM member WHERE account=:memberAccount";`

```java
@Override
public List<Member> ReadByAccount(String membersAccount) {
    String sql="SELECT id, name ,password ,account FROM member WHERE account=:memberAccount";

    Map<String,Object>map= new HashMap<>();
    map.put("memberAccount",membersAccount);

    List<Member> list =namedParameterJdbcTemplate.query(sql,map,new MemberRowMapper());

    return list;
}
```

#### Controller

```java
@GetMapping("members/{membersAccount}") //根據帳號做查詢
public List<Member> read(@PathVariable String membersAccount){

    return memberService.ReadByAccount(membersAccount);
}
```

![](/archive/2021-08-28-spring-boot-crud-rud/resultgetbyaccount.png)

## CRUD -Update

這裡在實作的時候想了一下，傳遞的參數內容，先確認call api的時候果然put method有BODY可以放Json資料，所以設計上就是收到前端傳來的Json格式之後，再依據URL做帳號資料修改。

DAO

```java
@Override
public String UpdateByAccount(String membersAccount,Member member) {
    String sql ="UPDATE member SET name=:memberName,password=:memberPassword WHERE account=:memberAccount";

    Map<String, Object> map =new HashMap<>();
    //put(SQL變數,值）
    map.put("memberName",member.getName());
    map.put("memberAccount",membersAccount);
    map.put("memberPassword",member.getPassword());
    namedParameterJdbcTemplate.update(sql,map);
    
    return "修改成功";
}
```

Controller

```java
@PutMapping("members/{membersAccount}") //根據帳號做修改
public String update(@PathVariable String membersAccount,@RequestBody Member member){ //@Path用來取得url路徑的值

    return memberService.UpdateByAccount(membersAccount,member);
}
```

結果：

![](/archive/2021-08-28-spring-boot-crud-rud/resulupdatebyaccount.png)

資料庫數據成功修改：

![](/archive/2021-08-28-spring-boot-crud-rud/resulupdatebyaccount2.png)

## CRUD -Delete

會前面的這裡應該就沒什麼問題了

#### Dao

```java
@Override
public String DeleteByAccount(String membersAccount) {

    String sql ="DELETE FROM member WHERE account = :membersAccount";
    Map<String,Object>map= new HashMap<>();
    map.put("membersAccount",membersAccount);
    namedParameterJdbcTemplate.update(sql,map);

    return "刪除成功";
}
```

#### Controller

```java
@DeleteMapping("members/{membersAccount}") //根據帳號做刪除
public String delete(@PathVariable String membersAccount){ //@Path用來取得url路徑的值

    return memberService.DeleteByAccount(membersAccount);
}
```

#### Javascript

html跟查詢所有帳號的一樣,所以js檔案是同一個，在產生清單資料時按鈕加上了.remove 定義了刪除的class，在使用document去監聽事件觸發

```javascript
$(document).on("click",'.remove',function(){
  console.log($(this).parent().parent().children('.account').text());
  $.ajax({
    type: 'DELETE',
    url:apiurl + '/' + $(this).parent().parent().children('.account').text(),
    success: function(){
    $(this).parent().parent().remove();
    window.location.reload();//刪除後重新整理視窗
    }
  });
```

刪除結果就是資料不見了，應該就沒辦法展示了，哈。

## GitHub

直接附上GitHub，希望對各位有幫助，一方面自己之後要用也不用怕丟失啦～

[檔案連結](https://github.com/yen0304/memberpractice)
