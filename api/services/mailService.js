const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');

const mailService = (function() {
  const email = process.env.MAILER_EMAIL_ID || 'tothuongthanh@gmail.com';
  const pass = process.env.MAILER_PASSWORD || 'thuongkute';
  const smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE_PROVIDER || 'gmail',
    auth: {
      user: email,
      pass: pass
    }
  });
  const handlebarsOptions = {
    viewEngine: {
      extname: '.html',
      layoutsDir: path.resolve('./api/templates/'),
      defaultLayout: 'register-success-email',
      partialsDir: path.resolve('./api/templates/')
    },
    viewPath: path.resolve('./api/templates/'),
    extName: '.html'
  };

  smtpTransport.use('compile', hbs(handlebarsOptions));

  async function sendMail(template, to, subject, context) {
    try {
      const data = {
        to,
        from: email,
        template,
        subject,
        context
      };

      smtpTransport.sendMail(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  return { sendMail };
})();

module.exports = mailService;
