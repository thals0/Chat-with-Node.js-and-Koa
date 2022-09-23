// @ts-check

const Koa = require('koa');
const websockify = require('koa-websocket');
const route = require('koa-route');
const serve = require('koa-static');
const mount = require('koa-mount');

const Pug = require('koa-pug');
const path = require('path');

const app = websockify(new Koa());
const PORT = 4500;

app.use(mount('/public', serve('public')));

const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app,
});

// 모든 주소를 ./chat으로 받아줌
app.ws.use(
  route.all('/chat', (ctx) => {
    ctx.websocket.send('여긴 서버');
    ctx.websocket.on('message', (message) => {
      console.log(message.toString());
    });
  })
);

app.use(async (ctx, next) => {
  // console.log(ctx.request);
  // console.log(ctx.response);
  // ctx.body = 'hello, koa world';
  await ctx.render('chat');
});

app.listen(PORT, () => {
  console.log(`서버 : ${PORT}`);
});
