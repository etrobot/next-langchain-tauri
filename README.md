# Next-Langchain-Tauri

Next-Langchain-Tauri is a desktop application that combines the power of Next.js for frontend development, Langchain.js for AI processing, and Tauri for packaging the application as a desktop app.

<img width="1280" alt="image" src="https://github.com/etrobot/next-langchain-tauri/assets/3889058/bad52bde-375b-478a-82c2-158c271f9329">

## How to use

Click the ``` Key Setting``` button to enter API keys, which are only stored in your computer, and then start to chat.

<img width="1392" alt="Screenshot 2024-03-06 at 12 00 48 AM" src="https://github.com/etrobot/Next-Langchain-Tauri/assets/3889058/8bb2b96e-3a57-45f1-a134-7ebfa9cbeffd">

## Development

1. Ensure you have Node.js v20, npm, rust, and cargo installed on your system.

2. Installation
``` bash
   pnpm install
``` 

3. use [yao-pkg](https://github.com/yao-pkg/pkg-binaries) to pack the server into a single executable file and make it as a sidecar binary for Tauri, before packing you need to check your computer arch by running:
``` bash
   rustc -Vv | grep host | cut -f2 -d' '
```
then change the word ```server-aarch64-apple-darwin``` to ```server-yours``` in packages.json, for example ```server-x86_64-apple-darwin```

save and run:
``` bash
   pnpm install -g @yao-pkg/pkg
   pnpm pkg-server
```

4. Change 'next.config.mjs' to the part for tarui


5. Build
``` bash
   pnpm tauri build
```

## Credits

This project was inspired by and incorporates code from the following repositories:

- [Vercel/ai-chatbot](https://github.com/vercel/ai-chatbot)
- [langchain-ai/langchain-nextjs-template](https://github.com/langchain-ai/langchain-nextjs-template)
- [srsholmes/tauri-nextjs-api-routes](https://github.com/srsholmes/tauri-nextjs-api-routes)

