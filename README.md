# Segment Stamper (Web)
A web app to record timestamps as on and off segments.

![Screenshot](readme/screenshot.png)

## Features
* Record timestamps as on and off segments
* Display a detailed history and visualization of segments in 7 days.
* HTTP API
* [Native Android App](https://github.com/blueset/segment-stamper-android)

## Attention
Protect your deploy environment. No security measure is in place for the app. This means that everyone got access to the web interface can stamp for you.

## Prerequisites
* Node.js
* Yarn
* MongoDB database

## Install and run
```bash
git clone https://github.com/blueset/segment-stamper-web
cd segment-stamper-web
yarn
yarn build
export MONGO_URL="mongodb+srv://username:password@databaseServerAddress/databaseName?retryWrites=true&w=majority"
yarn serve
```

## Deploy with Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fblueset%2Fsegment-stamper-web&env=MONGO_URL&envDescription=MongoDB%20connection%20string%2C%20usually%20starts%20with%20%E2%80%9Cmongodb%2Bsrv%3A%2F%2F%E2%80%9D&envLink=https%3A%2F%2Fgithub.com%2Fblueset%2Fsegment-stamper-web&project-name=segment-stampler-web-hD6VgqkQo&repo-name=segment-stampler-web-hD6VgqkQo)