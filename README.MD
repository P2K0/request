# @p2k0/request



一个基于 `axios` 封装的类支持 `TypeScript`，支持 `get、post、put、patch、delete、head、options、downloadSteam` 方法并在此基础上添加了拦截器、回调、取消重复请求功能。

- `before`：在发送请求之前修改请求配置（拦截器）。
- `after`：在成功响应后对响应数据进行处理（拦截器）。
- `error`：在出现错误时进行处理（回调）。
- `final`：在请求结束时进行一些额外的处理（回调）。

以上拦截器跟回调都是可选的，可以在实例化 `Request` 时传入，也可以在每次请求时添加。

> 如果在方法实例化中都添加了拦截器，那么它们的执行顺序是：方法拦截器 => 实例化拦截器
>
> `downloadSteam` 不会触发拦截器，它没有用回初始化后的实例。您需要重新传入配置项。



## 安装

### npm

```bash
npm install @p2k0/request -S
```



### yarn

```bash
yarn add @p2k0/request -S
```



### pnpm

```bash
pnpm add @p2k0/request -S
```



## 示例

### New Request

```js
import Request from '@p2k0/request';

const request = new Request({
   baseURL: "https://example.com",
   interceptors: {
      before: config => {
         config.headers["Authorization"] = "Bearer xxxxxx";
         return config;
      },
      after: res => {
         if (res.status !== 200) {
            return Promise.reject(new Error("Response error"));
         }
         return res.data;
      },
      error: err => {
         console.error("Error occurred:", err);
         if (axios.isCancel(err)) {
            console.log("Request canceled.");
         } else {
            return Promise.reject(err);
         }
      },
      final: config => {
         console.log("请求结束了", config);
          // dosome...
      }
   }
});
```



### GET

```js
request.get<{ data: string }>("/endpoint").then(res => {
  console.log(res.data); // 输出响应数据
});
```



### POST

```js
request.post<{ message: string }>("/endpoint", { data: "example" }).then(res => {
  console.log(res.message); // 输出响应消息
});
```



### PUT

```js
request.put<{ success: boolean }>("/endpoint/123", { data: "example" }).then(res => {
  console.log(res.success); // 输出 PUT 方法是否成功
});
```



### PATCH

```js
request.patch<{ updated: boolean }>("/endpoint/456", { data: "example" }).then(res => {
  console.log(res.updated); // 输出 PATCH 方法是否成功
});
```



### DELETE

```js
request.delete<{ deleted: boolean }>("/endpoint/789").then(res => {
  console.log(res.deleted); // 输出 DELETE 方法是否成功
});
```



### HEAD

```js
request.head("/endpoint").then(res => {
  console.log(res.headers); // 输出响应头信息
});
```



### OPTIONS

```js
request.options<{ allowedMethods: string[] }>("/endpoint").then(res => {
  console.log(res.allowedMethods); // 输出该端点允许的 HTTP 方法列表
});
```



### DownloadSteam

```js
request.downloadSteam({ url: "/files/example.pdf", filename: "example.pdf" });
```



### 取消重复请求

```js
request.post({
  url: "/api/login",
  data: {
    username: "test",
    password: "test123"
  },
  cancelable: true // 开启取消重复请求的功能
});
```
