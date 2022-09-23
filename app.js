// @ts-check

const Koa = require('koa');

const app = new Koa();
const PORT = 4500;

app.use(async (ctx, next) => {
  console.log(ctx.request);
  console.log(ctx.response);
  ctx.body = 'hello';
});

app.listen(PORT, () => {
  console.log(`서버 : ${PORT}`);
});
