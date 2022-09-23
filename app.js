// @ts-check

const Koa = require('koa');

const Pug = require('koa-pug');
const path = require('path');

const app = new Koa();
const PORT = 4500;

const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app,
});

app.use(async (ctx, next) => {
  // console.log(ctx.request);
  // console.log(ctx.response);
  // ctx.body = 'hello, koa world';
  await ctx.render('chat');
});

app.listen(PORT, () => {
  console.log(`서버 : ${PORT}`);
});
