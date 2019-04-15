const Koa = require("koa");
const auth = require("koa-basic-auth");
const S3 = require("aws-sdk/clients/s3");

const app = (module.exports = new Koa());

// custom 401 handling

app.use(async function(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.set("WWW-Authenticate", "Basic");
      ctx.body = "cant haz that";
    } else {
      throw err;
    }
  }
});

// require auth

app.use(auth({ name: "tick", pass: "tock" }));

// secret response

app.use(async function(ctx) {
  const s3 = new S3({
    apiVersion: "2006-03-01",
    region: "us-east-1"
  });

  const signedUrl = s3.getSignedUrl("getObject", {
    Bucket: "slib-content",
    Key: "bbb_sunflower_1080p_60fps_normal.mp4",
    Expires: 300
  });

  console.log("-- signed", signedUrl);

  if (signedUrl) {
    ctx.redirect(signedUrl);
  } else {
    ctx.body = "ERROR AHHH";
  }
});

if (!module.parent) app.listen(3000);
