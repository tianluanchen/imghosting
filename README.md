<div align="center">
<img src="./demo.png">
</div>

# IMG HOSTING

[![TypeScriptVersion](https://img.shields.io/badge/TypeScript-v5-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![React Version](https://img.shields.io/badge/React-v18-blue?style=flat-square&logo=React)](https://react.dev/)
[![React Router Version](https://img.shields.io/badge/React%20Router-v6-red?style=flat-square&logo=ReactRouter)](https://reactrouter.com/)

A universal front-end program for image hosting, with support for dark mode and internationalization.

English | [中文](./README.zh-CN.md)

## Tech Stack

Typescript + React18(Hooks) + React-Router v6(Data Api) + [Zustand](https://github.com/pmndrs/zustand) + [React-i18next](https://github.com/i18next/react-i18next) + [Ant Design](https://github.com/ant-design/ant-design) + [Vite](https://vitejs.dev/)

## Install

```bash
npm install
npm run dev
# start a simple example server to handle uploaded images, auth key is "example"
npm run serve

# build using vite
npm run build
```

## Adding Interfaces

Create a new ts file in the `src/apis` directory and export an object that implements the `UploadApi` interface. You can learn more from the existing interface files.

Please refer to the simple example in the `example/server.js` file for building the server-side functionality.

```typescript
type UploadRequest = {
    method?: "GET" | "POST" | "PUT" | "DELETE" | string;
    url: string;
    body: any;
    headers?: HeadersInit;
    /** auto parse response according to type */
    responseType?: "json" | "text";
};

type UploadResult = {
    success: boolean;
    message?: string;
    url: string;
    unauthorized?: boolean;
};

interface UploadApi<T = any> {
    title: string;
    /** unique key */
    name: string;
    /** maximum bytes */
    maxSize?: number;
    /** default "image/*" */
    accept?: string;
    /** sort according to the value */
    order?: number;
    /** self hosted APIs maybe require authkey */
    handleAuthKey?: (key: string) => string | Promise<string>;
    disabled?: boolean;
    /** sync/async */
    buildRequest: (args: {
        file: File;
        md5Hash: string;
        authKey?: string;
    }) => UploadRequest | Promise<UploadRequest>;
    /** sync/async */
    resolveResponse: (
        response: HttpResponse<T>,
        authKey?: string
    ) => UploadResult | Promise<UploadResult>;
}
```

## License

[GPL-3.0](./LICENSE) © Ayouth
