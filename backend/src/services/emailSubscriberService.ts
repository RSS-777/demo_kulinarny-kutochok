import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import type { IRecipe } from "../models/Recipe.js";
import { Subscription } from "../models/Subscription.js";
import Recipe from "../models/Recipe.js";
import logger from "../logger/logger.js";

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailNewRecipeParams {
  email: string;
  recipe: IRecipe;
  recipeUrl: string;
}

export const sendEmailNewRecipe = async ({email, recipe, recipeUrl}:SendEmailNewRecipeParams):Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "🍳 На сайті Кулінарний куточок з’явився новий рецепт!",
    text: `Новий рецепт: ${recipe.title}. Подивитися можна тут: ${recipeUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Новий рецепт: ${recipe.title}</h2>
        <p>Ви можете переглянути його за посиланням:</p>
        <p><a href="${recipeUrl}">${recipeUrl}</a></p>
        <hr />
        <p style="font-size: 0.9em; color: gray;">Ви отримали це повідомлення, бо підписані на нові рецепти.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendWeeklyRecipeNewsletter  = async(): Promise<void> => {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const latestRecipe = await Recipe.findOne({ createdAt: { $gte: oneWeekAgo } })
    .sort({ createdAt: -1 })
    .exec();

  if (!latestRecipe) {
    logger.info('There are no new recipes this week - we don`t send emails.');
    return;
  }

  const subscribers = await Subscription.find().exec();

  if (subscribers.length === 0) {
    logger.info('There are no subscribers for the newsletter.');
    return;
  }

  const recipeUrl = `${process.env.RECIPE_SITE_URL}/recipe/${latestRecipe._id}`;

  for (const subscriber of subscribers) {
    try {
      await sendEmailNewRecipe({
        email: subscriber.email,
        recipe: latestRecipe,
        recipeUrl,
      });
      logger.info(`The letter has been sent!`);
      await delay(20000);
    } catch (error: unknown) {
      if(error instanceof Error) {
        logger.error(`Error sending emails from mailing lists!: ${error.message}`);
      } else {
         logger.error(`Error sending emails from mailing lists!`);
      }
    }
  }
}

export default sendWeeklyRecipeNewsletter;
