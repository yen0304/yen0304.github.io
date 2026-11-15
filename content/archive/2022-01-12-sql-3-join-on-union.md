---
title: "SQL學習筆記(3)-水平合併(JOIN ON)與垂直合併(UNION)"
description: "了解JOIN ON、UNION的使用方式，也用實際例子來做筆記"
date: "2022-01-12"
categories: ["SQL學習筆記"]
tags: ["SQL學習筆記", "SQL", "SQLite"]
cover: "/archive/2022-01-12-sql-3-join-on-union/cover.jpeg"
legacyUrl: "/p/sql學習筆記3-水平合併join-on與垂直合併union/"
---

## 前言

本系列大多部分來自Hahow的課程－[SQL的50道練習](https://hahow.in/courses/5fd24f017687e53b086c7fe7/discussions)，學習過程中得到的筆記，文章內容也有部份都是從教材擷取出來，如果有興趣可以去上課看看。

那這章的基本語法其實網路上的網站[fooish](https://www.fooish.com/sql/)都講得蠻完善的了，部分文章內容也會引用網站文章內容。

網路上有人說程式會忘記是很正常的，也因為這次JOIN ON的用法很有趣，所以這次的文章比較多是自己做的圖片，或是個人見解，我希望把程式用白話的方式一一來理解，讓自己能真正的理解他。

## 開發環境

電腦系統：macOS（Big Sur）

資料庫管理工具：DBeaver

使用語言：SQLite

## JOIN ON 水平合併

在JOIN功能中，SQLite分為`LEFT JOIN ON`以及`JOIN ON`，但其實差別不大，`LEFT JOIN ON`的意思是希望保留以左側觀測值為主的資料，但一般來說都會指定要顯示的資料來自於哪個資料表， 所以在SQL中就只有`LEFT JOIN ON`而沒有`JOIN ON`。

### 格式

概念圖：

![](/archive/2022-01-12-sql-3-join-on-union/1.jpg)

```sql
SELECT left_table.column_names,
       right_table.column_names
  FROM table_name AS left_table
  LEFT JOIN table_name AS right_table
    ON left_table.join_key = right_table.join_key;
```

### 實際使用情境舉例

水平合併的作用在於，今天如果有兩個資料表，一個是

以及學生個人資料表table1資料表，其中裡面存放學生的學號number以及姓名name

學生的考試成績table2資料表，其中存放成績score以及學號number

所以我們想要顯示學生的成績以及姓名時，就需要把兩個欄位一起合併再來顯示，

概念大概是這樣：

| number | name |     | number | score |     | number | name | score |
|--------|------|-----|--------|-------|-----|--------|------|-------|
| 1      | A    | \+  | 1      | 90    | =   | 1      | A    | 90    |
| 2      | B    | \+  | 2      | 100   | =   | 2      | B    | 100   |
| 3      | C    | \+  | 3      | 80    | =   | 3      | C    | 80    |

上面的例子來說，我們要合併的關鍵是兩個資料表所擁有一樣定義的值，這個值在**資料庫的實體關係圖**（ER Diagram, Entity Relationship Diagram）找到，這些值就是來自於元資料的定義，那在上面的例子中就是學生的學號，這時學號我們就會稱為他為**結合鍵**（Join Key），

### 撰寫流程

在流程上

1.可以先決定左側表格

```sql
SELECT
    FROM table1 ---先決定有學生學號的左側表格
```

2.決定右側要合併的表格，以及跟左側表格合併的結合鍵

```sql
LEFT JOIN table2 --要合併的表格
         ON table2.number = table1.number --結合鍵
```

３.結合1+2之後，寫上SELECT後面要選擇顯示的資料

```sql
SELECT table1.number,table1.name,table2.score
    FROM table1
    LEFT JOIN table2 --要合併的表格
               ON table2.number = table1.number --結合鍵
```

就完成了，

再來看比較複雜的應用

### 進階使用

***在50道連習題當中，有一題目如下：***

從 nba 資料庫查詢各個球隊的得分王（生涯場均得分 ppg 全隊最高）是誰，將查詢結果依隊伍名排序，參考下列的預期查詢結果。

                          team                   player   ppg
    0            Atlanta Hawks               Trae Young  24.0
    1           Boston Celtics             Kemba Walker  19.8
    2            Brooklyn Nets             Kevin Durant  27.1
    3        Charlotte Hornets              LaMelo Ball  15.9
    4            Chicago Bulls              Zach LaVine  18.8
    5      Cleveland Cavaliers            Collin Sexton  19.7
    6         Dallas Mavericks              Luka Doncic  25.6
    7           Denver Nuggets             Nikola Jokic  18.0
    8          Detroit Pistons             Josh Jackson  12.0
    9    Golden State Warriors            Stephen Curry  23.8
    10         Houston Rockets                John Wall  19.0

​

ER圖：

![](/archive/2022-01-12-sql-3-join-on-union/nbaer.jpg)

#### 分析

Career_summaries資料表記錄著用球員id「personId」來做主鍵，裡面放著有關於得分的資料，再來players資料表裡面用「personId」記錄著球員的姓名以及其他球員資料還有所屬球隊的id「teamId」，再來teams資料表裡面用「teamId」記錄著隊伍的資料，所以我們先把希望呈現出來的成果分為左右表格分析，

可以從預期結果裡面來規劃，隊伍連結球員，球員連結得分

#### 撰寫流程

1.在最左側的隊伍名稱在隊伍裡面，所以：

```sql
SELECT   
    FROM teams
```

2.再來用裡面的teamId來連結players資料表，也因為球員資料裡面記錄著所屬球隊的id：

```sql
SELECT   --1.
    FROM teams 
    LEFT JOIN players  --2.
      ON teams .teamId =players .teamId 
```

3.再來，要連結球員個人資料表players，他跟Career_summaries資料表可以用記錄著用球員id「personId」來跟players 資料表中的teamId 做結合鍵。

```sql
LEFT JOIN teams --加入 
     ON players .personId =career_summaries .personId
```

4.1+2+3變成了：

```sql
SELECT   --1.
    FROM teams 
    LEFT JOIN players  --2.
      ON teams .teamId =players .teamId 
    LEFT JOIN teams --加入  --3
      ON players .personId =career_summaries .personId
```

5.再來會要使用聚合函數MAX來取ppg的最大值，所以一想到聚合函數還有隊伍，就會想到分組的GROUP BY

所以：

```sql
SELECT teams .fullName AS team,
        players.firstName ||' '||players.lastName AS player,
        MAX(career_summaries.ppg)
    FROM teams 
    LEFT JOIN players  
      ON teams .teamId =players .teamId
    LEFT JOIN teams --加入 
      ON players .personId =career_summaries .personId
GROUP BY teams.teamId
```

## UNION 垂直合併

垂直合併簡單多了，他跟子查詢很像，就是位於資料表上方的SQL語句放UNION上面，要從下方合併的放UNION下面，

```sql
A SELECT statement
UNION
Another SELECT statement
```

### 使用 `UNION` 的注意事項

- 垂直合併的欄位數要相同。（如果沒有會產生error)
- 垂直合併的 SQL 若有使用到 `ORDER BY` 只能放在 `UNION` 之後。
- 垂直合併的重複觀測值會被省略。

如果不要省略重複的觀測值，使用

### UNION ALL

```sql
A SELECT statement
UNION ALL
Another SELECT statement
```

就可以了

![垂直合併示意圖](/archive/2022-01-12-sql-3-join-on-union/union.jpg)

## 水平合併＆垂直合併的進階使用

***在50道連習題當中，有一題目如下：***

***從twElection2020 資料庫查詢中國國民黨、民主進步黨與親民黨在不分區立委與區域立委的得票率，參考下列的預期查詢結果。***

***PS 不分區立委的投票資料記錄於資料表 legislative_at_large***

***，區域立委的投票資料記錄於資料表 legislative_regional。***

預期輸出結果：

| party      | election   | votes_percentage |
|------------|------------|------------------|
| 中國國民黨 | 不分區立委 | 0.3336           |
| 民主進步黨 | 不分區立委 | 0.3338           |
| 親民黨     | 不分區立委 | 0.0366           |
| 中國國民黨 | 區域立委   | 0.4071           |
| 民主進步黨 | 區域立委   | 0.4511           |
| 親民黨     | 區域立委   | 0.0043           |

​

首先，先觀察個資料表

ER圖：

![ER圖](/archive/2022-01-12-sql-3-join-on-union/twer.jpg)

這題要先知道

不分區立委：簡單說就是政黨的得票，投黨不投人

所以不分區的比較簡單，連接兩種table就好，連結政黨parties資料表，再來這個資料表裡面存放黨派的id「id」，還有政黨名字「party」,透過存放政黨票的資料表 legislative_at_large，有得票數vote以及得票的政黨id「partyid」。

所以結合鍵就是政黨的id，

然後中間用UNION隔開，再來看區域立委：

再來是區域立委：投人的，

所以分區立委的投票率計算方法是：黨派裡面的所有所屬立委的得票數總和，要連接三張table，第一張是黨派的id名單，再來是立委所屬的黨派，再來是立委得票結果，

詳細解答：

```sql
SELECT parties.party ,

        '不分區立委' election, --4.

        ROUNCAST(SUM(legislative_at_large.votes )AS REAL)/(SELECT SUM(votes ) --5

                                    FROM legislative_at_large),4) AS votes_percentage

    FROM parties --在最左邊的「黨派」

    JOIN legislative_at_large --1.先設定好右側連結表

  ON parties.id = legislative_at_large.party_id --2.連結條件

    WHERE parties.party IN ('中國國民黨','民主進步黨','親民黨') --3.直接篩選特定黨派

GROUP BY parties.party 

UNION -------------------垂直相加第一步，複製上面跟下面，中間用UNION隔開

SELECT parties.party ,

      '區域立委' AS election,

        ROUND(CAST (SUM(legislative_regional.votes )AS REAL)/(SELECT SUM(legislative_regional.votes )--6

                                                                FROM legislative_regional) ,4)AS votes_percentage --6

    FROM parties --1左邊的黨派

    JOIN candidates --2.要先得知立委所屬黨派，目標是黨派LINK立委LINE立委編號

     ON parties.id = candidates.party_id --3.條件(得知立委所屬黨派，黨派表連結立委黨派表）

    JOIN legislative_regional --4.加入立委得票數（立委黨派表連結立委得票數表）

     ON candidates.id = legislative_regional.candidate_id --5.立委個人id-立委得票id連結 

    WHERE parties.party IN ('中國國民黨','民主進步黨','親民黨')

GROUP BY parties.party 

ORDER BY election ;--垂直相加第二步，排版
```

差不多就是這樣！
