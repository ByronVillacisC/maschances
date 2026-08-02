// src/modules/notifications/email.consumer.js
const nodemailer = require('nodemailer');
const emailQueue = require('../../queues/email.queue');
const logger = require('../../utils/logger');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // estándar
    auth: user && pass ? { user, pass } : undefined
  });

  return transporter;
}

emailQueue.process(async (job) => {
  const { to, subject, html, text } = job.data || {};
  const from = process.env.SMTP_FROM;

  if (!to || !subject || (!html && !text)) {
    logger.error({ jobId: job.id }, 'Email job invalid payload');
    throw new Error('Invalid email payload');
  }

  if (!from) {
    logger.error('SMTP_FROM not configured');
    throw new Error('SMTP_FROM not configured');
  }

  const t = getTransporter();

  await t.sendMail({
    from,
    to,
    subject,
    html,
    text
  });

  logger.info({ to, subject, jobId: job.id }, 'Email sent');
});

logger.info('Email consumer registered');