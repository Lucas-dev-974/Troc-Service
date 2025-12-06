import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;
  private frontendUrl: string;

  constructor() {
    this.fromEmail = process.env.SMTP_FROM || 'noreply@troc-services.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Configuration du transporteur email
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // Si les variables SMTP sont configurées, créer le transporteur
    if (smtpHost && smtpUser && smtpPassword) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true pour 465, false pour les autres ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
    } else {
      console.warn('⚠️  SMTP non configuré. Les emails ne seront pas envoyés. Configurez SMTP_HOST, SMTP_USER et SMTP_PASSWORD dans .env');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      console.warn(`⚠️  Email non envoyé (SMTP non configuré): ${options.subject} à ${options.to}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      });
      console.log(`✅ Email envoyé: ${options.subject} à ${options.to}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Failed to send email');
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  // Templates d'emails

  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur Troc & Services !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${username}</strong>,</p>
              <p>Merci de vous être inscrit sur Troc & Services ! Nous sommes ravis de vous accueillir dans notre communauté.</p>
              <p>Vous pouvez maintenant :</p>
              <ul>
                <li>Publier des offres de troc et services</li>
                <li>Rechercher des offres près de chez vous</li>
                <li>Échanger avec d'autres membres de la communauté</li>
              </ul>
              <a href="${this.frontendUrl}" class="button">Accéder à la plateforme</a>
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              <p>À bientôt,<br>L'équipe Troc & Services</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Bienvenue sur Troc & Services !',
      html,
    });
  }

  async sendVerificationEmail(to: string, username: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Vérifiez votre adresse email</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${username}</strong>,</p>
              <p>Merci de vous être inscrit sur Troc & Services. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
              <a href="${verificationUrl}" class="button">Vérifier mon email</a>
              <p>Ou copiez-collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
              <div class="warning">
                <p><strong>⚠️ Important :</strong> Ce lien est valide pendant 24 heures. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.</p>
              </div>
              <p>Si le bouton ne fonctionne pas, vous pouvez également copier le lien ci-dessus dans votre navigateur.</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Vérifiez votre adresse email - Troc & Services',
      html,
    });
  }

  async sendPasswordResetEmail(to: string, username: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${username}</strong>,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe sur Troc & Services. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              <p>Ou copiez-collez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
              <div class="warning">
                <p><strong>⚠️ Important :</strong> Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.</p>
              </div>
              <p>Si le bouton ne fonctionne pas, vous pouvez également copier le lien ci-dessus dans votre navigateur.</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: 'Réinitialisation de mot de passe - Troc & Services',
      html,
    });
  }

  async sendOfferConfirmationEmail(to: string, username: string, offerTitle: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Votre offre a été publiée !</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${username}</strong>,</p>
              <p>Votre offre "<strong>${offerTitle}</strong>" a été publiée avec succès sur Troc & Services.</p>
              <p>Vous pouvez la consulter et la modifier depuis votre profil.</p>
              <a href="${this.frontendUrl}" class="button">Voir mon offre</a>
              <p>Merci de contribuer à notre communauté !</p>
              <p>À bientôt,<br>L'équipe Troc & Services</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: `Votre offre "${offerTitle}" a été publiée`,
      html,
    });
  }
}

