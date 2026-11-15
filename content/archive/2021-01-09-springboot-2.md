---
title: "SpringBoot電商平台實戰(2)，商品詳情、熱門商品排序"
description: "SpringBoot電商平台實戰(2)，商品詳情、熱門商品排序"
date: "2021-01-09"
categories: ["SpringBoot實戰"]
tags: ["SpringBoot電商平台實戰", "Springboot"]
cover: "/archive/2021-01-09-springboot-2/cover.jpeg"
legacyUrl: "/p/springboot電商平台實戰2商品詳情熱門商品排序/"
---

本章承[SpringBoot電商平台實戰(1)](https://yen0304.github.io/p/springboot%E9%9B%BB%E5%95%86%E5%B9%B3%E5%8F%B0%E5%AF%A6%E6%88%B01%E7%94%A8%E6%88%B6%E8%A8%BB%E5%86%8A%E7%94%A8%E6%88%B6%E7%99%BB%E5%85%A5%E4%BF%AE%E6%94%B9%E8%B3%87%E6%96%99/)的專案，所以配置、工具等等都一樣。

在實作商品有關的MVC時，其實沒有遇到什麼困難，畢竟東西熟悉了，也不用去用到session或是驗證等等，時間花最久的應該是在前端的javascript吧！因為本身沒有在做太多的研究，所以就依照兩年前學的也把它做完了，那些東西看了程式碼應該都知道，所以有興趣的可以至github下載，這章節就不做太多的介紹了。

## 免跨域註解@CrossOrigin的另一個方法

之後看到網路上的連接，得知不用加上@CrossOrigin(origins = “\*")

[可以參考本連結](https://www.796t.com/article.php?id=225523&fbclid=IwAR2RVVOsP9oY8ZQVIiTOje6lSb05O7-LlF8IbxY3F6w4QZv1C4LUmparTXQ)，也是透過設置webconfiguration的方式

程式碼：

```java
@Configuration
public class CORSConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedHeaders("*")
                        .allowedMethods("*")
                        .allowedOrigins("*");
            }
        };
    }
}
```

所以maven中也可以省去了

```xml
        <dependency>
            <groupId>commons-codec</groupId>
            <artifactId>commons-codec</artifactId>
            <version>1.11</version>
        </dependency>
```

## 規劃資料庫中的商品數據

資料表創建相關數據：

```mysql
CREATE TABLE t_product (
    id INT AUTO_INCREMENT PRIMARY KEY ,
    categoryId INT(20) DEFAULT NULL COMMENT '商品分類id',
    type  CHAR(100) DEFAULT NULL COMMENT '商品類別',
    title CHAR(60) DEFAULT NULL COMMENT '商品標題（名稱）',
    price INT(20) COMMENT '單價',
    num INT(20) COMMENT '數量',
    imagepath VARCHAR(100) COMMENT'圖片路徑',
    priority INT(10) DEFAULT NULL COMMENT '顯示優先程度',
    status INT(1) DEFAULT  1 COMMENT '上架狀態1是0否',
    created_user VARCHAR(20) COMMENT'創建人',
    created_time DATETIME COMMENT '創建時間',
    modified_user VARCHAR(20)COMMENT'最後修改人',
    modified_time DATETIME COMMENT'最后修改時間'
)
```

### Product Class

接下來創建Product這個類別，當然繼承了BaseEntity

```java
@Data
public class Product extends BaseEntity implements Serializable {
    private Integer id;
    private Integer categoryId;
    private String type;
    private String title;
    private Integer price;
    private Integer num;
    private String imagepath;
    private Integer status;
    private Integer priority;
}
```

### ProductRowMapper

```java
public class ProductRowMapper implements RowMapper<Product> {

    @Override
    public Product mapRow(ResultSet resultSet, int i) throws SQLException {

        Product product=new Product();
        //後面result.getxx()，()裡面放的是要取得的資料在資料庫中的名字
        product.setId(resultSet.getInt("id"));
        product.setCategoryId(resultSet.getInt("categoryId"));
        product.setType(resultSet.getString("type"));
        product.setTitle(resultSet.getString("title"));
        product.setPrice(resultSet.getInt("price"));
        product.setNum(resultSet.getInt("num"));
        product.setStatus(resultSet.getInt("status"));
        product.setPriority(resultSet.getInt("priority"));
        product.setCreated_user(resultSet.getString("created_user"));
        product.setCreated_time(resultSet.getDate("created_time"));
        product.setModified_user(resultSet.getString("modified_user"));
        product.setModified_time(resultSet.getDate("modified_time"));
        return product;
    }

}
```

## 商品熱門查詢、商品詳情

這邊商品是用SQL新增的，因為其他新增商品的操作跟user的差不多，為了有效學習就省略了

### Product-Dao

#### Interface

```java
public interface ProductDao {

    //商品熱門排行
    List<Product> findHostList();

    //商品詳細數據
    Product ReadById(Integer id);
}
```

#### Implement

```java
@Component
public class ProductDaoImpl implements ProductDao{

    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Override
    public List<Product> findHostList() {
        //https://www.fooish.com/sql/order-by.html DESC or ASC Sql語法排序
        String sql="SELECT * FROM t_product where status=1 order by priority desc limit 0,4";
        Map<String,Object> map= new HashMap<>();

        List<Product> list =namedParameterJdbcTemplate.query(sql,map,new ProductRowMapper());

        if(list.size()>0){
            return list;
        }else {
            //如果是空集合[]
            return null;
        }
    }

    @Override
    public Product ReadById(Integer id) {
        String sql="SELECT * FROM t_product where id=:Id";
        Map<String,Object> map= new HashMap<>();
        map.put("Id",id);

        List<Product> list =namedParameterJdbcTemplate.query(sql,map,new ProductRowMapper());

        if(list.size()>0){
            return list.get(0);
        }else {
            //如果是空集合[]
            return null;
        }
    }
}
```

### Product-Service

#### Interface

```java
public interface ProductService {

    List<Product> getHostList();

    //查詢商品詳細數據
    Product ReadById(Integer id);

}
```

#### Implements

在實作Implement時，

發現網路上的寫法是：

```java
private List<Product> findHostList() {
    return productDao.findHostList();
}

private Product findById(Integer id){
    return productDao.ReadById(id);
}
```

把資料庫的servicem用成了private，應該是為了日後其他操作上要用，目前還不知道為什麼要用私有的方式實現。

完整程式碼：

```java
@Component
public class ProductServiceImpl implements ProductService{

    @Autowired
    private ProductDao productDao;

    @Override
    public List<Product> getHostList() {
        List<Product> products = findHostList();

        return products;
    }

    @Override
    public Product ReadById(Integer id) {

        Product product=findById(id);
        if(product == null){
            throw new ProductNotFoundException("找不到商品數據");
        }
        return product;
    }

    private List<Product> findHostList() {
        return productDao.findHostList();
    }

    private Product findById(Integer id){
        return productDao.ReadById(id);
    }
}
```

### Product-Controller

```java
@RestController

@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    //
    @GetMapping("/list/hot")
    public List<Product> getHostList(){
        return productService.getHostList();
    }

    @GetMapping
    public Product ReadById(@RequestParam Integer id){
        return productService.ReadById(id);
    }
}
```

### 部分Javascript

#### 獲取商品資訊的Javascript

```javascript
function loading_product_data() {
  $.ajax({
    url: producturl,
    dataType: "json",
    success:function(data) {
      console.log(data);
      $("#itemname").text(data.title);
      $("#price").text("$" + data.price);
      $("#num").text("剩餘數量：" + data.num);

      pid=data.id;

      if(data.status == 0){
        alert("此商品已下架");
      }
    }
  });
}
```

#### 熱門排行Javascript

```javascript
unction showHotList() {
  $("#hot-list").empty();
  $.ajax({
    url: "/products/list/hot",
    dataType: "json",
    success:function(data) {
      hotlist=data;
      console.log(hotlist);
      for (var i = 0; i < hotlist.length; i++) {
        var html ='<div class="content col-md-2">'
            +'<div class="title">#{title}</div>'
            +'<div class="price">$#{price}</div><a class="d-flex justify-content-end" href="#{href}">查看商品</a>'
            +'</div>';
        html = html.replace(/#{title}/g, hotlist[i].title);
        html = html.replace(/#{price}/g, hotlist[i].price);
        html = html.replace(/#{href}/g, "/product?id=" + hotlist[i].id);

        $("#hot-list").append(html);
      }
    }
  });
}
```

## 規劃本專案所有返回Model的Controller

```java
@org.springframework.stereotype.Controller
public class Controller {

    @GetMapping("/login")
    public String loginpage(Model model)
    {
        return "login";
    }

    //登入頁面
    @GetMapping("/login_success")
    public String successpage(Model model)
    {
        return "/login_success";
    }

    //首頁
    @GetMapping("/")
    public String index(Model model)
    {
        return "/index";
    }

    //註冊頁面
    @GetMapping("/register")
    public String register(Model model){ return  "/register";}

    //user修改資料頁面
    @GetMapping("/users/@{username}")
    public String usermodified(Model model){ return  "/user_modified";}

    //商品詳情頁面
    @GetMapping("/product")
    public String products(Model model){ return  "/product";}

    //購物車詳情頁面
    @GetMapping("/mycarts")
    public String mycarts(Model model){ return  "/mycarts";}

}
```

其他頁面HTML、ＣＳＳ、ＪＳ以及狀態程式碼、class資料夾位置都放在github裡面。需要的大家可以去看看。

## Github

[https://github.com/yen0304/Electronic-business-platform](https://github.com/yen0304/Electronic-business-platform)
