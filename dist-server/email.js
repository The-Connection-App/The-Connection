import {
  SESClient,
  SendEmailCommand,
  CreateTemplateCommand,
  UpdateTemplateCommand,
  DeleteTemplateCommand,
  ListTemplatesCommand,
  GetTemplateCommand,
  SendTemplatedEmailCommand
} from "@aws-sdk/client-ses";
import { BASE_URL, EMAIL_FROM, APP_URLS } from "./config/domain.js";
let emailFunctionalityEnabled = false;
const ENABLE_REAL_EMAIL = process.env.ENABLE_REAL_EMAIL === "true";
const forceMockMode = !ENABLE_REAL_EMAIL;
console.log(`\u{1F4E7} [SETUP] Email mock mode = ${forceMockMode ? "ON" : "OFF"} (ENABLE_REAL_EMAIL=${process.env.ENABLE_REAL_EMAIL || "unset"})`);
if (forceMockMode) {
  console.log("\u{1F4E7} Email functionality running in MOCK MODE. No actual emails will be sent.");
  console.log("\u{1F4E7} All email operations will simulate success for testing purposes.");
} else if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  console.warn("\u26A0\uFE0F AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION) not set. Email functionality will be disabled.");
  console.warn("\u26A0\uFE0F Users can still register but won't receive actual emails.");
} else {
  console.log("\u{1F4E7} Email functionality enabled with AWS SES");
  emailFunctionalityEnabled = true;
}
let awsRegion = "us-east-1";
if (process.env.AWS_REGION) {
  const regions = process.env.AWS_REGION.split(",");
  if (regions.length > 0) {
    awsRegion = regions[0].trim();
  }
}
const sesClient = new SESClient({
  region: awsRegion,
  credentials: emailFunctionalityEnabled ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : void 0
});
async function sendEmail(params) {
  if (forceMockMode || !emailFunctionalityEnabled) {
    console.log("\u{1F4E7} [MOCK] Would have sent email to:", params.to);
    console.log("\u{1F4E7} [MOCK] Email subject:", params.subject);
    if (process.env.NODE_ENV !== "production") {
      console.log("\u{1F4E7} [MOCK] Email content (Text):", params.text?.substring(0, 100) + (params.text && params.text.length > 100 ? "..." : ""));
      console.log("\u{1F4E7} [MOCK] Email content (HTML):", params.html?.substring(0, 100) + (params.html && params.html.length > 100 ? "..." : ""));
    }
    return true;
  }
  try {
    const sendEmailCommand = new SendEmailCommand({
      Destination: {
        ToAddresses: [params.to]
      },
      Message: {
        Body: {
          ...params.html && {
            Html: {
              Charset: "UTF-8",
              Data: params.html
            }
          },
          ...params.text && {
            Text: {
              Charset: "UTF-8",
              Data: params.text
            }
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: params.subject
        }
      },
      Source: params.from
    });
    const response = await sesClient.send(sendEmailCommand);
    console.log(`Email sent successfully to ${params.to}`, response.MessageId);
    return true;
  } catch (error) {
    console.error("AWS SES email error:", error);
    console.log("Failed to send email to:", params.to);
    console.log("Email subject:", params.subject);
    if (process.env.NODE_ENV !== "production" && process.env.MOCK_EMAIL_SUCCESS === "true") {
      console.log("MOCK_EMAIL_SUCCESS is enabled - simulating successful email delivery");
      return true;
    }
    return false;
  }
}
async function createEmailTemplate(params) {
  if (forceMockMode || !emailFunctionalityEnabled) {
    console.log("\u{1F4E7} [MOCK] Would have created template:", params.TemplateName);
    return true;
  }
  try {
    const createTemplateCommand = new CreateTemplateCommand({
      Template: {
        TemplateName: params.TemplateName,
        SubjectPart: params.SubjectPart,
        TextPart: params.TextPart,
        HtmlPart: params.HtmlPart
      }
    });
    await sesClient.send(createTemplateCommand);
    console.log("Email template created:", params.TemplateName);
    return true;
  } catch (error) {
    console.error("Error creating email template:", error);
    return false;
  }
}
async function updateEmailTemplate(params) {
  if (forceMockMode || !emailFunctionalityEnabled) {
    console.log("\u{1F4E7} [MOCK] Would have updated template:", params.TemplateName);
    return true;
  }
  try {
    const updateTemplateCommand = new UpdateTemplateCommand({
      Template: {
        TemplateName: params.TemplateName,
        SubjectPart: params.SubjectPart,
        TextPart: params.TextPart,
        HtmlPart: params.HtmlPart
      }
    });
    await sesClient.send(updateTemplateCommand);
    console.log("Email template updated:", params.TemplateName);
    return true;
  } catch (error) {
    console.error("Error updating email template:", error);
    return false;
  }
}
async function deleteEmailTemplate(templateName) {
  if (forceMockMode || !emailFunctionalityEnabled) {
    console.log("\u{1F4E7} [MOCK] Would have deleted template:", templateName);
    return true;
  }
  try {
    const deleteTemplateCommand = new DeleteTemplateCommand({
      TemplateName: templateName
    });
    await sesClient.send(deleteTemplateCommand);
    console.log("Email template deleted:", templateName);
    return true;
  } catch (error) {
    console.error("Error deleting email template:", error);
    return false;
  }
}
async function listEmailTemplates() {
  if (forceMockMode || !emailFunctionalityEnabled) {
    console.log("\u{1F4E7} [MOCK] Would have listed templates.");
    return Object.values(DEFAULT_TEMPLATES);
  }
  try {
    const listTemplatesCommand = new ListTemplatesCommand({});
    const response = await sesClient.send(listTemplatesCommand);
    return (response.TemplatesMetadata || []).map((template) => template.Name || "");
  } catch (error) {
    console.error("Error listing email templates:", error);
    return [];
  }
}
async function getEmailTemplate(templateName) {
  if (forceMockMode || !emailFunctionalityEnabled) {
    console.log("\u{1F4E7} [MOCK] Would have retrieved template:", templateName);
    return {
      TemplateName: templateName,
      SubjectPart: `Mock subject for ${templateName}`,
      TextPart: `Mock text content for ${templateName}`,
      HtmlPart: `<div>Mock HTML content for ${templateName}</div>`
    };
  }
  try {
    const getTemplateCommand = new GetTemplateCommand({
      TemplateName: templateName
    });
    const response = await sesClient.send(getTemplateCommand);
    return response.Template || null;
  } catch (error) {
    console.error("Error getting email template:", error);
    return null;
  }
}
async function sendTemplatedEmail(params) {
  const { to, from, templateName, templateData } = params;
  if (forceMockMode || !emailFunctionalityEnabled) {
    console.log("\u{1F4E7} [MOCK] Would have sent templated email to:", to);
    console.log("\u{1F4E7} [MOCK] Template:", templateName);
    console.log("\u{1F4E7} [MOCK] Template data:", JSON.stringify(templateData));
    return true;
  }
  try {
    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand({
      Destination: {
        ToAddresses: [to]
      },
      Source: from,
      Template: templateName,
      TemplateData: JSON.stringify(templateData)
    });
    const response = await sesClient.send(sendTemplatedEmailCommand);
    console.log(`Templated email sent successfully to ${to}`, response.MessageId);
    return true;
  } catch (error) {
    console.error("Error sending templated email:", error);
    return false;
  }
}
const DEFAULT_TEMPLATES = {
  WELCOME: "TheConnection_Welcome",
  PASSWORD_RESET: "TheConnection_PasswordReset",
  NOTIFICATION: "TheConnection_Notification",
  LIVESTREAM_INVITE: "TheConnection_LivestreamInvite",
  APPLICATION_NOTIFICATION: "TheConnection_LivestreamerApplicationNotification",
  APPLICATION_STATUS_UPDATE: "TheConnection_ApplicationStatusUpdate",
  COMMUNITY_INVITATION: "TheConnection_CommunityInvitation"
};
async function initializeEmailTemplates() {
  console.log("Initializing email templates...");
  console.log(`Email functionality enabled: ${emailFunctionalityEnabled}`);
  console.log(`Using AWS Region: ${awsRegion}`);
  console.log(`Forced mock mode: ${forceMockMode}`);
  if (forceMockMode) {
    console.log("\u{1F4A1} Running in FORCED MOCK MODE - skipping actual AWS SES template setup");
    console.log("\u2713 Welcome template setup complete (mock)");
    console.log("\u2713 Password reset template setup complete (mock)");
    console.log("\u2713 Notification template setup complete (mock)");
    console.log("\u2713 Livestream invite template setup complete (mock)");
    console.log("\u2713 Application notification template setup complete (mock)");
    console.log("\u2713 Application status update template setup complete (mock)");
    console.log("\u2713 Community invitation template setup complete (mock)");
    console.log("\u2713 All email templates successfully initialized in mock mode.");
    return;
  }
  if (!emailFunctionalityEnabled) {
    console.log("Email functionality disabled. Skipping template initialization.");
    console.log("Email templates initialized in mock mode.");
    return;
  }
  try {
    try {
      const listResult = await listEmailTemplates();
      console.log(`Found ${listResult.length} existing email templates`);
    } catch (error) {
      console.error("Error testing AWS SES credentials:", error);
      console.log("Email template initialization aborted due to credential issues.");
      console.log("Email templates initialized in fallback mode.");
      return;
    }
    await setupWelcomeTemplate();
    console.log("\u2713 Welcome template setup complete");
    await setupPasswordResetTemplate();
    console.log("\u2713 Password reset template setup complete");
    await setupNotificationTemplate();
    console.log("\u2713 Notification template setup complete");
    await setupLivestreamInviteTemplate();
    console.log("\u2713 Livestream invite template setup complete");
    const { setupApplicationNotificationTemplate, setupApplicationStatusUpdateTemplate } = await import("./email-templates.js");
    await setupApplicationNotificationTemplate();
    console.log("\u2713 Application notification template setup complete");
    await setupApplicationStatusUpdateTemplate();
    console.log("\u2713 Application status update template setup complete");
    await setupCommunityInvitationTemplate();
    console.log("\u2713 Community invitation template setup complete");
    console.log("\u2713 All email templates successfully initialized.");
  } catch (error) {
    console.error("Error initializing email templates:", error);
    console.log("Email templates initialized with errors.");
  }
}
async function setupWelcomeTemplate() {
  const templateName = DEFAULT_TEMPLATES.WELCOME;
  const subjectPart = "Welcome to The Connection!";
  const htmlPart = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0B132B; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">The Connection</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <h2>Welcome, {{name}}!</h2>
        <p>Thank you for joining The Connection, a Christian community platform for spiritual growth, apologetics, and Bible study.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Join communities based on your interests</li>
          <li>Participate in discussions about faith</li>
          <li>Access apologetics resources</li>
          <li>Watch and participate in livestreams</li>
          <li>Form or join private groups for Bible study</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${BASE_URL}/auth" style="background-color: #0B132B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Sign In Now</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This email was sent to {{email}}. If you did not create this account, please disregard this email.
        </p>
      </div>
    </div>
  `;
  try {
    const template = await getEmailTemplate(templateName);
    if (template) {
      return updateEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    } else {
      return createEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    }
  } catch (error) {
    console.error("Error setting up welcome template:", error);
    return false;
  }
}
async function setupPasswordResetTemplate() {
  const templateName = DEFAULT_TEMPLATES.PASSWORD_RESET;
  const subjectPart = "Reset Your Password - The Connection";
  const htmlPart = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0B132B; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">The Connection</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <h2>Password Reset Request</h2>
        <p>Hello {{name}},</p>
        <p>We received a request to reset your password for your account at The Connection. To complete this process, please click the button below.</p>
        <p>This link will expire in 24 hours.</p>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="{{resetLink}}" style="background-color: #0B132B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </div>
        
        <p style="margin-top: 20px;">If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This email was sent to {{email}}. 
        </p>
      </div>
    </div>
  `;
  try {
    const template = await getEmailTemplate(templateName);
    if (template) {
      return updateEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    } else {
      return createEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    }
  } catch (error) {
    console.error("Error setting up password reset template:", error);
    return false;
  }
}
async function setupNotificationTemplate() {
  const templateName = DEFAULT_TEMPLATES.NOTIFICATION;
  const subjectPart = "{{subject}}";
  const htmlPart = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0B132B; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">The Connection</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <h2>{{title}}</h2>
        <p>Hello {{name}},</p>
        <p>{{message}}</p>
        
        {{#if actionUrl}}
        <div style="margin-top: 30px; text-align: center;">
          <a href="{{actionUrl}}" style="background-color: #0B132B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">{{actionText}}</a>
        </div>
        {{/if}}
        
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This email was sent to {{email}}.<br>
          You're receiving this email because you have an account on The Connection.
        </p>
      </div>
    </div>
  `;
  try {
    const template = await getEmailTemplate(templateName);
    if (template) {
      return updateEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    } else {
      return createEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    }
  } catch (error) {
    console.error("Error setting up notification template:", error);
    return false;
  }
}
async function setupLivestreamInviteTemplate() {
  const templateName = DEFAULT_TEMPLATES.LIVESTREAM_INVITE;
  const subjectPart = "You're Invited: {{streamTitle}} - Live on The Connection";
  const htmlPart = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0B132B; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">The Connection</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <h2>You're Invited to a Livestream</h2>
        <p>Hello {{name}},</p>
        <p>{{hostName}} has invited you to join their upcoming livestream:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0B132B;">{{streamTitle}}</h3>
          <p style="margin-bottom: 5px;"><strong>When:</strong> {{streamDate}} at {{streamTime}}</p>
          <p style="margin-top: 0;"><strong>Description:</strong> {{streamDescription}}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="{{streamUrl}}" style="background-color: #0B132B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Join Livestream</a>
        </div>
        
        <p style="margin-top: 20px;">Don't miss out on this opportunity to connect and grow in your faith journey!</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This email was sent to {{email}}.<br>
          You're receiving this invitation because you're a member of The Connection community.
        </p>
      </div>
    </div>
  `;
  try {
    const template = await getEmailTemplate(templateName);
    if (template) {
      return updateEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    } else {
      return createEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    }
  } catch (error) {
    console.error("Error setting up livestream invite template:", error);
    return false;
  }
}
async function sendWelcomeEmail(email, displayName = "") {
  const name = displayName || email.split("@")[0];
  const from = EMAIL_FROM;
  const template = await getEmailTemplate(DEFAULT_TEMPLATES.WELCOME);
  if (template) {
    return sendTemplatedEmail({
      to: email,
      from,
      templateName: DEFAULT_TEMPLATES.WELCOME,
      templateData: {
        name,
        email
      }
    });
  } else {
    return sendEmail({
      to: email,
      from,
      subject: "Welcome to The Connection!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0B132B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">The Connection</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for joining The Connection, a Christian community platform for spiritual growth, apologetics, and Bible study.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>Join communities based on your interests</li>
              <li>Participate in discussions about faith</li>
              <li>Access apologetics resources</li>
              <li>Watch and participate in livestreams</li>
              <li>Form or join private groups for Bible study</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${BASE_URL}/auth" style="background-color: #0B132B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Sign In Now</a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
              This email was sent to ${email}. If you did not create this account, please disregard this email.
            </p>
          </div>
        </div>
      `
    });
  }
}
async function sendPasswordResetEmail(email, displayName = "", resetToken) {
  const name = displayName || email.split("@")[0];
  const from = EMAIL_FROM;
  const resetLink = `${APP_URLS.RESET_PASSWORD}?token=${resetToken}&email=${encodeURIComponent(email)}`;
  const template = await getEmailTemplate(DEFAULT_TEMPLATES.PASSWORD_RESET);
  if (template) {
    return sendTemplatedEmail({
      to: email,
      from,
      templateName: DEFAULT_TEMPLATES.PASSWORD_RESET,
      templateData: {
        name,
        email,
        resetLink
      }
    });
  } else {
    return sendEmail({
      to: email,
      from,
      subject: "Reset Your Password - The Connection",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0B132B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">The Connection</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password for your account at The Connection. To complete this process, please click the button below.</p>
            <p>This link will expire in 24 hours.</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${resetLink}" style="background-color: #0B132B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
            </div>
            
            <p style="margin-top: 20px;">If you did not request a password reset, please ignore this email or contact our support team if you have concerns.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
              This email was sent to ${email}. 
            </p>
          </div>
        </div>
      `
    });
  }
}
async function sendNotificationEmail(params) {
  const name = params.name || params.email.split("@")[0];
  const from = EMAIL_FROM;
  const template = await getEmailTemplate(DEFAULT_TEMPLATES.NOTIFICATION);
  if (template) {
    return sendTemplatedEmail({
      to: params.email,
      from,
      templateName: DEFAULT_TEMPLATES.NOTIFICATION,
      templateData: {
        name,
        email: params.email,
        subject: params.subject,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl || "",
        actionText: params.actionText || "View Details"
      }
    });
  } else {
    let actionButton = "";
    if (params.actionUrl) {
      actionButton = `
        <div style="margin-top: 30px; text-align: center;">
          <a href="${params.actionUrl}" style="background-color: #0B132B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">${params.actionText || "View Details"}</a>
        </div>
      `;
    }
    return sendEmail({
      to: params.email,
      from,
      subject: params.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0B132B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">The Connection</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>${params.title}</h2>
            <p>Hello ${name},</p>
            <p>${params.message}</p>
            
            ${actionButton}
            
            <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
              This email was sent to ${params.email}.<br>
              You're receiving this email because you have an account on The Connection.
            </p>
          </div>
        </div>
      `
    });
  }
}
async function sendLivestreamInviteEmail(params) {
  const name = params.recipientName || params.email.split("@")[0];
  const from = EMAIL_FROM;
  const template = await getEmailTemplate(DEFAULT_TEMPLATES.LIVESTREAM_INVITE);
  if (template) {
    return sendTemplatedEmail({
      to: params.email,
      from,
      templateName: DEFAULT_TEMPLATES.LIVESTREAM_INVITE,
      templateData: {
        name,
        email: params.email,
        hostName: params.hostName,
        streamTitle: params.streamTitle,
        streamDate: params.streamDate,
        streamTime: params.streamTime,
        streamDescription: params.streamDescription,
        streamUrl: params.streamUrl
      }
    });
  } else {
    return sendEmail({
      to: params.email,
      from,
      subject: `You're Invited: ${params.streamTitle} - Live on The Connection`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0B132B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">The Connection</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>You're Invited to a Livestream</h2>
            <p>Hello ${name},</p>
            <p>${params.hostName} has invited you to join their upcoming livestream:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0B132B;">${params.streamTitle}</h3>
              <p style="margin-bottom: 5px;"><strong>When:</strong> ${params.streamDate} at ${params.streamTime}</p>
              <p style="margin-top: 0;"><strong>Description:</strong> ${params.streamDescription}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${params.streamUrl}" style="background-color: #0B132B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Join Livestream</a>
            </div>
            
            <p style="margin-top: 20px;">Don't miss out on this opportunity to connect and grow in your faith journey!</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
              This email was sent to ${params.email}.<br>
              You're receiving this invitation because you're a member of The Connection community.
            </p>
          </div>
        </div>
      `
    });
  }
}
async function setupCommunityInvitationTemplate() {
  const templateName = DEFAULT_TEMPLATES.COMMUNITY_INVITATION;
  const subjectPart = `You're invited to join "{{communityName}}" - The Connection`;
  const htmlPart = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0B132B; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">The Connection</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <h2>You've Been Invited!</h2>
        <p>Hello {{recipientName}},</p>
        <p>{{inviterName}} has invited you to join the private community <strong>"{{communityName}}"</strong> on The Connection.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0B132B;">{{communityName}}</h3>
          <p style="margin: 5px 0;"><strong>Description:</strong> {{communityDescription}}</p>
          <p style="margin: 5px 0;"><strong>Invited by:</strong> {{inviterName}}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong>Invitation expires:</strong> {{expirationDate}}</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="{{invitationUrl}}" style="background-color: #0B132B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Join Community</a>
        </div>
        
        <p style="margin-top: 20px;">This is a private community, so you'll need to use this special invitation link to join. Click the button above to accept the invitation and become a member.</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          This invitation was sent to {{email}} by {{inviterName}}.<br>
          If you don't want to join this community, you can safely ignore this email.<br>
          This invitation will expire on {{expirationDate}}.
        </p>
      </div>
    </div>
  `;
  try {
    const template = await getEmailTemplate(templateName);
    if (template) {
      return updateEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    } else {
      return createEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subjectPart,
        HtmlPart: htmlPart
      });
    }
  } catch (error) {
    console.error(`Error setting up ${templateName}:`, error);
    return false;
  }
}
async function sendCommunityInvitationEmail(params, name, p0, token) {
  const recipientName = params.recipientName || params.email.split("@")[0];
  const from = EMAIL_FROM;
  const template = await getEmailTemplate(DEFAULT_TEMPLATES.COMMUNITY_INVITATION);
  if (template) {
    return sendTemplatedEmail({
      to: params.email,
      from,
      templateName: DEFAULT_TEMPLATES.COMMUNITY_INVITATION,
      templateData: {
        recipientName,
        email: params.email,
        inviterName: params.inviterName,
        communityName: params.communityName,
        communityDescription: params.communityDescription,
        invitationUrl: params.invitationUrl,
        expirationDate: params.expirationDate
      }
    });
  } else {
    return sendEmail({
      to: params.email,
      from,
      subject: `You're invited to join "${params.communityName}" - The Connection`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0B132B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">The Connection</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h2>You've Been Invited!</h2>
            <p>Hello ${recipientName},</p>
            <p>${params.inviterName} has invited you to join the private community <strong>"${params.communityName}"</strong> on The Connection.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0B132B;">${params.communityName}</h3>
              <p style="margin: 5px 0;"><strong>Description:</strong> ${params.communityDescription}</p>
              <p style="margin: 5px 0;"><strong>Invited by:</strong> ${params.inviterName}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #666;"><strong>Invitation expires:</strong> ${params.expirationDate}</p>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${params.invitationUrl}" style="background-color: #0B132B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Join Community</a>
            </div>
            
            <p style="margin-top: 20px;">This is a private community, so you'll need to use this special invitation link to join. Click the button above to accept the invitation and become a member.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
              This invitation was sent to ${params.email} by ${params.inviterName}.<br>
              If you don't want to join this community, you can safely ignore this email.<br>
              This invitation will expire on ${params.expirationDate}.
            </p>
          </div>
        </div>
      `
    });
  }
}
export {
  DEFAULT_TEMPLATES,
  createEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplate,
  initializeEmailTemplates,
  listEmailTemplates,
  sendCommunityInvitationEmail,
  sendEmail,
  sendLivestreamInviteEmail,
  sendNotificationEmail,
  sendPasswordResetEmail,
  sendTemplatedEmail,
  sendWelcomeEmail,
  setupCommunityInvitationTemplate,
  setupLivestreamInviteTemplate,
  setupNotificationTemplate,
  setupPasswordResetTemplate,
  setupWelcomeTemplate,
  updateEmailTemplate
};
