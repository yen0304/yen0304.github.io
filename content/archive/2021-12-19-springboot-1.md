---
title: "SpringBoot學習筆記-單元測試(1)-基礎介紹"
description: "SpringBoot學習筆記-單元測試(1)，將介紹如何在開發springboot中進行測試，方便開發時除錯"
date: "2021-12-19"
categories: ["Spring Boot單元測試"]
tags: ["SpringBoot學習筆記", "Springboot", "SpringBoot單元測試", "JUnit5"]
cover: "/archive/2021-12-19-springboot-1/cover.png"
legacyUrl: "/p/springboot學習筆記-單元測試1-基礎介紹/"
---

在學了SpringBoot中，不少的核心知識CRUD操作，接下來要學習的是該如何去測試我們撰寫好的功能

## 何謂單元測試（Unit Testing）？

目的：自動化測試程式的正確性

所謂的單元測試，就是一次只測試一個功能點，一個單元可以是一個method，或是一個API

## 單元測試的特性＆注意事項

#### 單元測試的特性

1.可以被自動化運行

2.各個單元測試互相獨立，彼此之間不能有依賴關係

3.測試結果穩定，不受外部服務影響

#### 單元測試的注意事項

1.測試的程式要放在test資料夾裡面

2.測試的class名稱以「原class的名字加上Test做為結尾」來命名

3.測試的class的package要跟原class的package保持一致

## 環境部署&基礎範例

#### 

#### 環境部署

如果想要在springboot裡面使用單元測試功能，要在pom.xml裏面新增這個maven，不過這段程式碼在一般創建springboot程式中就會加上去了

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

###### 

#### 開始測試

先在demo的package底下新增一個簡易的計算機class Calcultor ，

首先如果我們一般在進行撰寫時，程式大概會長這樣：

```java
public class Calcultor {

    public int add(int x,int y){
        return(x+y);
    }

    public static void main(String[] args) {
        Calcultor calcultor =new Calcultor();
        int result = calcultor.add(1,2);
        System.out.println("結果為" + result);
    }
}
```

結果會理所當然的出現結果為3，但假設今天某個工程師在add方法裡寫錯了，就必須花時間去尋找add方法裡是否有錯誤，所以我們這時候就要去利用單元測試去完成自動化測試。

首先在Calcultor 裡面點擊右鍵，選擇Generate-\>Test ，Testing Library選擇JUnit5 如下圖：

![](/archive/2021-12-19-springboot-1/create_test.jpg)

接著就可以看到在Test底下的demo Package看到CalculatorTest這個Class，我們用以下程式碼來完成第一個測試的程式：

```java
class CalcultorTest   {

    //加上@Test註解，要使用org.junit.jupiter.api這一個
    @Test
    public void test() {
        Calcultor calcultor = new Calcultor();
        int result = calcultor.add(1, 2);

        //以上應該都不用解釋
        //接下來最重要,assertEquals就是斷言，也就是我認為的意思，格式如下
        // assertEquals(expected應該要是多少,result變數(結果));
        assertEquals(3,result);
    }
}
```

![](/archive/2021-12-19-springboot-1/run1.jpg)

當我們完成上面add方法的返回值時，就算是自動化測試了
