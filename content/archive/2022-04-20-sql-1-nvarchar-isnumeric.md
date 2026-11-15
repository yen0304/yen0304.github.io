---
title: "SQL職場實戰(1)-nvarchar型態轉換學習之不要相信ISNUMERIC"
description: "SQL職場實戰-nvarchar型態轉換學習之不要相信ISNUMERIC"
date: "2022-04-20"
categories: ["SQL職場實戰"]
tags: ["SQL職場實戰", "SQL"]
cover: "/archive/2022-04-20-sql-1-nvarchar-isnumeric/cover.jpeg"
legacyUrl: "/p/sql職場實戰1-nvarchar型態轉換學習之不要相信isnumeric/"
---

進入公司的第三個星期，碰到了一個題目，內容就是需要將好幾萬筆資料的table取值並比大小，因為資料數量龐大，資料欄位的型態是nvarchar，所以在過程中學到了不少需要轉換的方式。

## 第一步驟 了解nvarchar欄位內容

其中最有印象的就是其中有一個欄位的最後面需要判斷值是否大於12，如果是就保留，不是就為0，

還有特殊格式需做處理，所以在不斷Error出現之後，學到了**使用DISTINCT（早就知道有這個方法，但是沒想到那麼好用）**，因為資料都是客戶輸入的，所以需先了解資料有哪些樣子，對欄位的數值去做對應的處理。

```sql
SELECT DISTINCT [column] FROM [table]
```

那印出來之後，主要資料分這幾種型態： （實際上爆幹多…這邊列出幾個重點）

| column 欄位名稱以下都是A |
|--------------------------|
| 1,000.00                 |
| Bcolumn欄位值的8倍       |
| 80/1000                  |
| 10                       |
| 12.00                    |
| 1000\[全形空白鍵\]       |
| 1000/12/20               |

在規格需求時，也有特別說明，80/1000這類的格式要選擇小的（要求真的很多），但像是1000/12/20就要為0，不符合格式，簡單說除了上面提到的特殊格式，還有大於12的數字，其他都要為0。

那在最後進行比較數值是否大於12時，可能會這樣寫：

```mssql
SELECT [item] --（item可能是商品名稱之類的，不是重點）
    ,[A] =CASE WHEN [A] >12 THEN [A]  ELSE  0 END
FROM 
```

## nvarchar 轉換方向

我們一般會很直覺的想要用CONVERT、CAST，但是由於我們上面的資料太多種類，甚至出現了中文、還有小數點甚至出現了全形空白符號等等，在轉換的時候一定會出現Error navrchar 不能轉換int之類的訊息，所以我分成了兩個表之後在使用union垂直合併。

## 開始轉換

所以轉換分成兩種：

### 使用REPLAC + TRIM 對所有欄位進行過濾，去除不必要的符號

在最終，我們的型態是int，所以我們要設定的值會是數字，所以要確保下面在轉換的過程中順利，先去除有可能在欄位中，全行與半形符號，至於我怎麼找到有全形空白鍵，那又是另一則故事了…（總之我也是DISTINCT慢慢點擊欄位看出來的），只能說工作上學到的東西真的蠻多的…吧

所以用WITH AS的方式讓下面的table使用REPLAC + TRIM 對所有欄位進行過濾，去除不必要的符號，再讓其他人使用：

```mssql
WITH real_table AS (
SELECT [item]
    ,[A] =REPLACE(TRIM(' 　' FROM [A]),',','')
    ,[Date]
    FROM [table]
)
```

### 在SQL中小數轉整數

在數字轉換的部分，我們要在SQL小數轉整數，所以我們的邏輯流程如下

1.選出是數字的欄位

2.使用CAST + ROUND小數點四捨五入/無條件捨去，轉整數

在選出是數字的時候，本來最初是用ISNUMERIC作處理，但是使用WHERE +ISNUMERIC / DISTINCT 的時候發現1,000以及1000\[全形被掃出來\]，所以查了之後使用PATINDEX(搜尋關鍵字)去判斷小數以及數字才是我們要的欄位（我就是這邊卡超久！！）

```mssql
SELECT [item]
    ,[A] =CASE WHEN  PATINDEX('%[^0-9|.]%', [A])=0  THEN CAST(ROUND([A],0)AS int) ELSE 0 END 
    ,[Date]
    FROM real_table
    WHERE  PATINDEX('%[^0-9|.]%', [A])=0 
)
```

### 非數字轉換

相對的不是數字的就為0

```mssql
SELECT [item]
    ,[MP_MOQ] =ISNULL(CASE WHEN  PATINDEX('%[^0-9|.]%', [A])=1  THEN 0 END,0)
    ,[Date]
    FROM real_table
    WHERE  NOT(PATINDEX('%[^0-9|.]%', [A])=0)
```

### 特殊格式轉換

就是練習各種搜尋之類的字串處理

```mssql
    SELECT [item]
        ,[MP_MOQ] = CASE WHEN CONVERT (int,SUBSTRING ([A] ,1 , CHARINDEX('/', [A])-1 ))
                                < CONVERT (int,SUBSTRING ([A ,CHARINDEX('/', [A])+1, LEN([A]))) THEN ISNULL(CONVERT (int,SUBSTRING ([A] ,1 , CHARINDEX('/', [A])-1 )) ,0)
        ELSE ISNULL(CONVERT (int,SUBSTRING ([A] ,CHARINDEX('/', [A])+1, LEN([A]))),0) END
        ,[Date]
        FROM  real_table
    WHERE ( [A] LIKE  '[0-9]%/[0-9]%' ) AND  ([A]  NOT LIKE  '%/%/%')
```

之後再把他們全部UNION ALL就可以了

## 總結

乍看之下程式碼都很簡單，但在實際上第一個不會想到欄位值有那麼多的狀況、或是ISNUMBERIC不準確的時候，這次最寶貴的經驗就是知道了要用DISTINCT觀察資料型態，也可以用於驗證（畢竟都有顯示出來就沒問題了），更知道了很多好用的函式可以用！
