//import Resend from "@auth/core/providers/resend";
//import { Resend as ResendAPI } from "resend";
//import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
//
//export const ResendOTP = Resend({
//  id: "resend-otp",
//  apiKey: process.env.AUTH_RESEND_KEY,
//  async generateVerificationToken() {
//    const random: RandomReader = {
//      read(bytes) {
//        crypto.getRandomValues(bytes);
//      },
//    };
//
//    const alphabet = "0123456789";
//    const length = 6;
//    return generateRandomString(random, alphabet, length);
//  },
//  async sendVerificationRequest({ identifier: email, provider, token }) {
//    const resend = new ResendAPI(provider.apiKey);
//    
//    const htmlTemplate = `
//    <!DOCTYPE html>
//    <html lang="en">
//    <head>
//        <meta charset="UTF-8">
//        <meta name="viewport" content="width=device-width, initial-scale=1.0">
//        <meta http-equiv="X-UA-Compatible" content="IE=edge">
//        <title>WorldFriends Verification Code</title>
//        <!--[if mso]>
//        <noscript>
//            <xml>
//                <o:OfficeDocumentSettings>
//                    <o:PixelsPerInch>96</o:PixelsPerInch>
//                </o:OfficeDocumentSettings>
//            </xml>
//        </noscript>
//        <![endif]-->
//        <style>
//            * {
//                margin: 0;
//                padding: 0;
//                box-sizing: border-box;
//            }
//            
//            body {
//                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
//                line-height: 1.6;
//                color: #0F172A;
//                background-color: #F8FAFC;
//                margin: 0;
//                padding: 20px;
//                min-height: 100vh;
//            }
//            
//            .email-container {
//                max-width: 600px;
//                margin: 0 auto;
//                background: #FFFFFF;
//                border-radius: 20px;
//                overflow: hidden;
//                box-shadow: 0 20px 40px rgba(100, 116, 139, 0.1);
//            }
//            
//            .header {
//                background-color: #6366F1;
//                padding: 40px 30px;
//                text-align: center;
//                color: #FFFFFF;
//            }
//            
//            .logo {
//                font-size: 28px;
//                font-weight: 700;
//                margin-bottom: 0;
//                letter-spacing: -0.5px;
//            }
//            
//            .content {
//                padding: 50px 30px;
//                text-align: center;
//            }
//            
//            .welcome-text {
//                font-size: 24px;
//                font-weight: 600;
//                color: #0F172A;
//                margin-bottom: 15px;
//                line-height: 1.3;
//            }
//            
//            .description {
//                font-size: 16px;
//                color: #475569;
//                margin-bottom: 40px;
//                line-height: 1.5;
//            }
//            
//            .otp-container {
//                background-color: #F8FAFC;
//                border-radius: 16px;
//                padding: 30px;
//                margin: 30px 0;
//                border: 2px dashed #CBD5E1;
//            }
//            
//            .otp-label {
//                font-size: 14px;
//                color: #64748B;
//                margin-bottom: 15px;
//                text-transform: uppercase;
//                letter-spacing: 1px;
//                font-weight: 600;
//            }
//            
//            .otp-code {
//                font-size: 48px;
//                font-weight: 700;
//                color: #6366F1;
//                letter-spacing: 8px;
//                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
//                margin: 10px 0;
//                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//            }
//            
//            .otp-validity {
//                font-size: 14px;
//                color: #DC2626;
//                margin-top: 15px;
//                font-weight: 500;
//            }
//            
//            .footer {
//                background-color: #F8FAFC;
//                padding: 30px;
//                text-align: center;
//                border-top: 1px solid #E2E8F0;
//            }
//            
//            .footer-text {
//                color: #475569;
//                font-size: 14px;
//                line-height: 1.5;
//                margin-bottom: 15px;
//            }
//            
//            .contact-info {
//                color: #6366F1;
//                font-size: 14px;
//                margin: 15px 0;
//                font-weight: 500;
//            }
//            
//            .company-info {
//                color: #000;
//                font-size: 12px;
//                margin-top: 20px;
//            }
//            
//            /* Mobile Optimizations */
//            @media only screen and (max-width: 600px) {
//                body {
//                    padding: 10px;
//                }
//                
//                .email-container {
//                    border-radius: 12px;
//                    margin: 10px 0;
//                }
//                
//                .header {
//                    padding: 30px 20px;
//                }
//                
//                .logo {
//                    font-size: 24px;
//                }
//                
//                .content {
//                    padding: 30px 20px;
//                }
//                
//                .welcome-text {
//                    font-size: 20px;
//                }
//                
//                .description {
//                    font-size: 15px;
//                }
//                
//                .otp-container {
//                    padding: 20px;
//                    margin: 20px 0;
//                }
//                
//                .otp-code {
//                    font-size: 36px;
//                    letter-spacing: 4px;
//                }
//                
//                .footer {
//                    padding: 20px;
//                }
//            }
//        </style>
//    </head>
//    <body>
//        <div class="email-container">
//            <div class="header">
//                <div class="logo">WorldFriends</div>
//            </div>
//            
//            <div class="content">
//                <div class="welcome-text">Welcome to WorldFriends! 🌍</div>
//                <div class="description">
//                    We're excited to have you join our global community. Use the verification code below to complete your sign-up process.
//                </div>
//                
//                <div class="otp-container">
//                    <div class="otp-label">Your Verification Code</div>
//                    <div class="otp-code">${token}</div>
//                    <div class="otp-validity">⏰ Valid for 10 minutes</div>
//                </div>
//            
//            </div>
//            
//            <div class="footer">
//                <div class="footer-text">
//                    If you didn't request this code, you can safely ignore this email. Your account remains secure.
//                </div>
//                <div class="contact-info">
//                    Need help? Contact us at hello@worldfriends.app
//                </div>
//                <div class="company-info">
//                    © ${new Date().getFullYear()} WorldFriends App, Inc. All rights reserved.
//                </div>
//            </div>
//        </div>
//    </body>
//    </html>
//    `;
//
//    const { error } = await resend.emails.send({
//      from: "WorldFriends SignUp <auth@worldfriends.app>",
//      to: [email],
//      subject: `🛡️ Your WorldFriends Verification Code`,
//      text: `Welcome to WorldFriends! 🌍
//
//        Your verification code is: ${token}
//
//        This code is valid for 10 minutes. Enter it in the app to complete your sign-up.
//
//        For security, don't share this code with anyone. We'll never ask for your verification code via phone, email, or social media.
//
//        If you didn't request this code, you can safely ignore this email.
//
//        Need help? Contact us at hello@worldfriends.app
//
//        Welcome to our global community!
//
//        —The WorldFriends Team`,
//      html: htmlTemplate,
//    });
//
//    if (error) {
//      throw new Error("Could not send");
//    }
//  },
//});
