import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmailConfirmationCode = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Підтвердження електронної пошти на сайті "Кулінарний куточок"',
    text: `Вас вітає команда "Кулінарний куточок"!\n\nВаш код для підтвердження електронної пошти: ${code}\n\nЯкщо ви не реєструвались на нашому сайті, просто проігноруйте цей лист.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Вас вітає "Кулінарний куточок"!</h2>
        <p>Щоб підтвердити вашу електронну адресу, використайте цей код:</p>
        <p style="font-size: 1.5em; font-weight: bold;">${code}</p>
        <p>Цей код дійсний протягом обмеженого часу.</p>
        <hr />
        <p style="font-size: 0.9em; color: gray;">
          Якщо ви не створювали обліковий запис на сайті "Кулінарний куточок", просто проігноруйте цей лист.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmailConfirmationCode;
