# Next-Langchain-Tauri

Next-Langchain-Tauri is a desktop application that combines the power of Next.js for frontend development, Langchain.js for AI processing, and Tauri for packaging the application as a desktop app.

![](https://github.com/etrobot/next-langchain-tauri/assets/3889058/a50640eb-ae60-4685-9b2d-7f6f715d821a)

## How to use

Click ```Key Setting``` button to enter OpenAI Api key and Serpapi key, they are only stored in your computer, then start to chat.

![](https://github.com/etrobot/next-langchain-tauri/assets/3889058/e2a6fe96-950b-4ac8-a6d3-905dfe193788)


## Development

1. Make sure you have Node.js v20, npm ,rust and cargo installed on your system.

2. Installation
``` bash
   pnpm install
``` 

3. use [yao-pkg](https://github.com/yao-pkg/pkg-binaries) to pack the server into a single excutable file and make it as a sidecar binary for Tauri, before packing you need to check your compter arch by running:
``` bash
   rustc -Vv | grep host | cut -f2 -d' '
```
then change the word ```server-x86_64-apple-darwin``` to ```server-yours``` in packages.json

save and run:
``` bash
   pnpm install -g @yao-pkg/pkg
   pnpm pkg-server
```

4. Run in dev mode
``` bash
   pnpm tauri dev
```

5. The langchain part is in ./server , you need to run ```pnpm build-server``` after development, and run ```node ./build/server.js``` to test.

## Credits

This project was inspired by and incorporates code from the following repositories:

- [Vercel/ai-chatbot](https://github.com/vercel/ai-chatbot)
- [langchain-nextjs-template](https://github.com/langchain-ai/langchain-nextjs-template)

