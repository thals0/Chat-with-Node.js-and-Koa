// @ts-check

const Koa = require('koa');
const websockify = require('koa-websocket');
const route = require('koa-route');
const serve = require('koa-static');
const mount = require('koa-mount');

const Pug = require('koa-pug');
const path = require('path');

const mongoClient = require('./public/mongo');
const _client = mongoClient.connect();

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
  route.all('/chat', async (ctx) => {
    // const server = app.ws.server;
    // 구조분해할당 방식으로 받아옴
    const { server } = app.ws;
    const client = await _client;
    const cursor = client.db('node1').collection('chats');
    // 전체를 가져올 때는 await안 걸어줘도됨(커서랑 별반 다른거 없으므로)
    const chats = cursor.find(
      {},
      {
        sort: {
          // 1(오름차순), -1(내림차순)
          createdAt: 1,
        },
      }
    );
    // 데이터화하는 것에서는 await 필요
    const chatsData = await chats.toArray();

    // 최초 접속 -> db에 있는 정보를 받아오면 됨
    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        data: {
          chatsData,
        },
      })
    );

    server?.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: 'chat',
          data: {
            name: '서버',
            msg: `새로운 유저가 참여 했습니다. 현재 유저 수 ${server.clients.size}`,
            bg: 'bg-danger',
            text: 'text-white',
          },
        })
      );
      // client.send('모든 클라이언트에게 데이터를 보냄');
      // client.send('새로운 유저가 입장하였습니다.');
    });
    // ctx.websocket.send('여긴 서버');
    ctx.websocket.on('message', async (message) => {
      // db에 저장
      const chat = JSON.parse(message);
      const insertClient = await _client;
      const chatCursor = insertClient.db('node1').collection('chats');
      await chatCursor.insertOne({
        // name: chat.name,
        // msg: chat.msg,
        // bg: chat.bg,
        // text: chat.text,
        ...chat,
        createdAt: new Date(),
      });

      // console.log(message.toString());
      server?.clients.forEach((client) => {
        // client.send(message.toString());
        client.send(
          JSON.stringify({
            type: 'chat',
            data: {
              ...chat,
            },
          })
        );
      });
    });
    // 어떤 클라이언트가 close(나갔을)시
    ctx.websocket.on('close', () => {
      server?.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            data: {
              name: '서버',
              msg: `유저 한명이 나갔습니다. 현재 유저 수 ${server.clients.size}`,
              bg: 'bg-dark',
              text: 'text-white',
            },
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
