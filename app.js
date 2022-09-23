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

// console.log(app.ws);

// 모든 주소를 ./chat으로 받아줌
app.ws.use(
  route.all('/chat', (ctx) => {
    // const server = app.ws.server;
    // 구조분해할당 방식으로 받아옴
    const { server } = app.ws;

    server?.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          name: '서버',
          msg: `새로운 유저가 참여 했습니다. 현재 유저 수 ${server.clients.size}`,
          bg: 'bg-danger',
          text: 'text-white',
        })
      );
      // client.send('모든 클라이언트에게 데이터를 보냄');
      // client.send('새로운 유저가 입장하였습니다.');
    });
    // ctx.websocket.send('여긴 서버');
    ctx.websocket.on('message', (message) => {
      // console.log(message.toString());
      server?.clients.forEach((client) => {
        client.send(message.toString());
      });
    });
    // 어떤 클라이언트가 close(나갔을)시
    ctx.websocket.on('close', () => {
      server?.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            name: '서버',
            msg: `유저 한명이 나갔습니다. 현재 유저 수 ${server.clients.size}`,
            bg: 'bg-dark',
            text: 'text-white',
          })
        );
      });
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
