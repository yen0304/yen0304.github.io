---
title: "Spingboot+Freemarker基本配置"
description: "spring boot連結前端引擎Freemarker,到測試成功的過程"
date: "2021-08-08"
categories: ["SpringBoot學習筆記"]
tags: ["Freemarker", "Springboot", "HTML"]
cover: ""
legacyUrl: "/p/spingboot-freemarker基本配置/"
---

## 前言

### Springboot + Freemaker 基本設置

前端複習的差不多了，所以來試試如何將後端數據傳到前，在google的幫助下，瞭解了要用搜尋關鍵字Springboot + Freemaker，Freemaker 跟thymeleaf是差不多功能的東西，雖然Springboot官方是推薦使用thymeleaf，但網路上比較上是Freemaker勝出，且在設定上好像較容易，所以就使用Freemaker作為模板引擎了

在網路上的資源很多，從官方到個人網站都有教學，大同小異，但是到了最後連結上還是出了小問題，幸好最終解決了，所以在這紀錄一下架設過程，希望大家需要時能按圖施工保證成功！！

## 環境介紹

開發平台：IntelliJ 2020.3

Springboot版本：2.3.7.release

前端：html、css、皆快速使用bootstrap

## 1.maven添加Freemaker

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-freemarker</artifactId>
</dependency>
```

## 2.檔案路徑&Freemaker環境配置

**接下來檔案路徑就很重要了**，

步驟1.

將自己index.html檔案放在resources/templates裡面，步驟是將檔案拉進去resources/templates後，intellij會詢問檔案名稱，**這時候把副檔名改成ftl**

接著要修改模板預設參數，在application.properties裡打上以下程式碼

```yaml
spring.freemarker.cache=false
# 模版後綴名 默認為ftl
spring.freemarker.suffix=.ftl
# 文件編碼
spring.freemarker.charset=UTF-8
# 模版加載的目錄
spring.freemarker.template-loader-path=classpath:/templates/
```

步驟2.

css、js檔案放在resources/static底下，切記，\*\*一定要在static下新增css以及js資料夾！\*\*否則會無法成功取得（我就是在這邊卡很久）。

## 3.測試用程式碼

接著新增controller,並使用getmapping

如下：

```java
@Controller
public class Logincontroller {

    @GetMapping("/page")
    public String show(Model model)
    {
        model.addAttribute("name","測試");
        return "/index";
    }
}
```

這邊要注意的地方是，

```java
return "/index";
```

return的值就是ftl的檔案名稱

接著到index.ftl到隨便一個地方 加入 `${name}` 來測試

我的長這樣：

```html
<label>
  <input type="checkbox" value="remember-me"/>
  ${name}
</label>
```

## 4.檔案結構＆成果

這邊附上完整的檔案路徑配置

![](/archive/2021-08-08-spingboot-freemarker/filepath.jpg)

運行成果：

![](/archive/2021-08-08-spingboot-freemarker/result.jpg)
