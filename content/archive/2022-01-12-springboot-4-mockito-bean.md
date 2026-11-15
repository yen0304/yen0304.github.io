---
title: "SpringBoot學習筆記-單元測試(4)-使用Mockito來減少單元測試中的Bean依賴"
description: "使用Mockito來減少單元測試中的Bean依賴"
date: "2022-01-12"
categories: ["Spring Boot單元測試"]
tags: ["SpringBoot學習筆記", "Springboot", "SpringBoot單元測試", "Mockito"]
cover: "/archive/2022-01-12-springboot-4-mockito-bean/cover.png"
legacyUrl: "/p/springboot學習筆記-單元測試4-使用mockito來減少單元測試中的bean依賴/"
---

## 前言

部分文章內容來自於古老師在[hahow的課程](https://hahow.in/courses/5fe22e7fe810e10fc483dd78/discussions)，還有古老師的[部落格](https://kucw.github.io/blog/2020/2/spring-unit-test-mockito/)，想要做筆記的原因是因為，邊記變做會比較容易記住，改天忘了也可以用自己的方式去理解。

## Mock測試目的與特性

單元測試的特性為下：

1.可以被自動化運行

2.各個單元測試互相獨立，彼此之間不能有依賴關係

3.測試結果穩定，不受外部服務影響

在前面的筆記，如果要測試Service層的話，應該會這樣寫：

```java
@SpringBootTest
public class StudentServiceImplMockTest {

    @Autowired StudentService studentService;

    @Test
    public void getById(){
        Student student=studentService.getById(3);
        assertNotNull(student);
        assertEquals(3,student.getId());
        assertEquals("Judy",student.getName());
    }

}
```

在上面的測試單元裡，StudentService其實用到了StudentDao這個Bean，

並不符合地２點，Bean之前在上面是有依賴關係的，所以Mock測試的

- 目的：避免測試某一個單元測試，而去建構整個bean的依賴。
- 作法：創造一個假的bean，替換掉容器原有的bean。

在程式裡面Mock的意思為「假的」的意思，而非英文單字模仿。

## Mockito

Mockito是Spring Boot中，進行Mock測試的工具

功能大致上分為：

- 模擬方法的返回值
- 模擬拋出Exception
- 記錄方法的使用次數、順序

### @MockBean

```java
@Test
public void getById(){
    //第二步
    Student mockStudent = new Student();
    mockStudent.setId(100);
    mockStudent.setName("mockname");

    //這句話的意思就是，當有人使用studentDao.getById(3)時，固定return mockStudent這個object
    Mockito.when(studentDao.getById(3)).thenReturn(mockStudent);

    Student student=studentService.getById(3);
    assertNotNull(student);
    assertEquals(3,student.getId());
    assertEquals("Judy",student.getName());
}
```

執行結果：

    org.opentest4j.AssertionFailedError: 
    Expected :3
    Actual   :100

再把

`assertEquals(3,student.getId());`改成`assertEquals(3,student.getId());`就會顯示測試成功了

### 使用MockBean注意事項

承上，如果把`Student student=studentService.getById(3)`改成了`Student student=studentService.getById(2)`下面的單元測試依然會運行錯誤，**原因是因為在沒有定義返回值是多少的情況下，這個假的mockbean預設會傳NULL**

```java
@Test
public void getById(){
    Student mockStudent = new Student();
    mockStudent.setId(100);
    mockStudent.setName("mockname");
        Mockito.when(studentDao.getById(3)).thenReturn(mockStudent);

    Student student=studentService.getById(2);
    assertNotNull(student);
    assertEquals(3,student.getId());
    assertEquals("Judy",student.getName());
}
```

所以我們會利用

### Mockito.any()

來固定返回mockStudent這個數值

由`Mockito.when(studentDao.getById(3)).thenReturn(mockStudent);`

變成`Mockito.when(studentDao.getById(Mockito.any())).thenReturn(mockStudent);`

這樣不論參數是多少，都還是會固定返回mockStudent出來。

### 補充thenReturn doReturn

其實只是寫法上的不同，下面的程式碼是等價的

```java
Mockito.when(studentDao.getById(Mockito.any())).thenReturn(mockStudent);
Mockito.doReturn(mockStudent).when(studentDao.getById(Mockito.any()));
```

### Throw Expection

```java
Mockito.when(studentDao.insert(Mockito.any())).thenThrow(new RuntimeException());
Mockito.doThrow(new RuntimeException()).when(studentDao).deleteById(Mockito.any());
```

### Verify

用來記錄方法的使用次數、順序（少用）

```java
Mockito.doThrow(new RuntimeException()).when(studentDao).deleteById(Mockito.any());
```

### Mockito 的限制

上述就是 Mockito 的 mock 對象使用方法，不過當使用 Mockito 在 mock 對象時，有一些限制需要遵守

- 不能 mock 靜態方法

- 不能 mock private 方法

- 不能 mock final class
