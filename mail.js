const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = (html) => {
  resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: [process.env.EMAIL_1, process.env.EMAIL_2],
    subject: process.env.EMAIL_SUBJECT,
    html,
  });
};

const formatMail = (data) => {
  if (data.length) {
    return data
      .map(
        ({ link, title }) => `
	  <h2>${title}</h2>
	  <p>${link}</p>
	`
      )
      .join("\n");
  } else {
    return "<p>no new posts</p>";
  }
};

module.exports = { sendMail, formatMail };
