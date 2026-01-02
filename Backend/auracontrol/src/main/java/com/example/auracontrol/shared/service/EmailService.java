package com.example.auracontrol.shared.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendResetPasswordEmail(String toEmail, String resetToken) {
        try {
            String resetLink = "http://localhost:80/reset-password?token=" + resetToken;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🌿 Reset Your Password - Aura Spa");

            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f5f2;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #2d5a47 0%%, #4a8c6f 100%%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px;">AURA SPA</h1>
                            <p style="color: #c8e6c9; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px;">WELLNESS & BEAUTY</p>
                        </div>
                        
                        <!-- Decorative Line -->
                        <div style="height: 4px; background: linear-gradient(90deg, #d4a574, #e8c9a0, #d4a574);"></div>
                        
                        <!-- Content -->
                        <div style="padding: 50px 40px; text-align: center;">
                            <div style="font-size: 50px; margin-bottom: 20px;">🔐</div>
                            <h2 style="color: #2d5a47; margin: 0 0 20px 0; font-size: 24px; font-weight: 500;">Password Reset Request</h2>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                                We received a request to reset the password for your Aura Spa account. 
                                Click the button below to create a new password and continue your journey to relaxation.
                            </p>
                            
                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #2d5a47 0%%, #4a8c6f 100%%); color: #ffffff; padding: 16px 50px; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: 500; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(45, 90, 71, 0.3);">
                                Reset Password
                            </a>
                            
                            <p style="color: #999999; font-size: 14px; margin: 30px 0 0 0;">
                                ⏰ This link will expire in <strong>15 minutes</strong>
                            </p>
                        </div>
                        
                        <!-- Divider -->
                        <div style="padding: 0 40px;">
                            <div style="height: 1px; background-color: #e8e8e8;"></div>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="padding: 30px 40px; text-align: center;">
                            <p style="color: #888888; font-size: 13px; line-height: 1.6; margin: 0;">
                                🛡️ If you didn't request this password reset, please ignore this email or contact our support team.
                                Your account remains secure.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8f5f2; padding: 30px 40px; text-align: center;">
                            <p style="color: #2d5a47; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Aura Spa - Where Serenity Meets Beauty</p>
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                🌸 Thank you for choosing Aura Spa for your wellness journey 🌸
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """, resetLink);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("Password reset email sent to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Error sending reset password email: " + e.getMessage());
        }
    }

    @Async
    public void sendVerificationEmail(String toEmail, String name, String token) {
        try {
            String verifyLink = "http://localhost:80/verify-account?token=" + token;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🌿 Welcome to Aura Spa - Verify Your Account");

            String htmlContent = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f5f2;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #2d5a47 0%%, #4a8c6f 100%%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 3px;">AURA SPA</h1>
                            <p style="color: #c8e6c9; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px;">WELLNESS & BEAUTY</p>
                        </div>
                        
                        <!-- Decorative Line -->
                        <div style="height: 4px; background: linear-gradient(90deg, #d4a574, #e8c9a0, #d4a574);"></div>
                        
                        <!-- Content -->
                        <div style="padding: 50px 40px; text-align: center;">
                            <div style="font-size: 50px; margin-bottom: 20px;">🌺</div>
                            <h2 style="color: #2d5a47; margin: 0 0 10px 0; font-size: 26px; font-weight: 500;">Welcome, %s!</h2>
                            <p style="color: #d4a574; font-size: 16px; margin: 0 0 30px 0; font-style: italic;">Your journey to relaxation begins here</p>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                                Thank you for joining the Aura Spa family! We're thrilled to have you with us. 
                                Please verify your email address to unlock a world of premium spa services, 
                                exclusive offers, and personalized wellness experiences.
                            </p>
                            
                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #d4a574 0%%, #c49a6c 100%%); color: #ffffff; padding: 16px 50px; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: 500; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(212, 165, 116, 0.4);">
                                ✨ Activate My Account
                            </a>
                            
                            <!-- Benefits Section -->
                            <div style="margin-top: 40px; text-align: left; background-color: #f8f5f2; padding: 25px; border-radius: 15px;">
                                <p style="color: #2d5a47; font-size: 15px; margin: 0 0 15px 0; font-weight: 600;">As a member, you'll enjoy:</p>
                                <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">🧖‍♀️ Easy online booking for all spa services</p>
                        
                            </div>
                        </div>
                        
                        <!-- Divider -->
                        <div style="padding: 0 40px;">
                            <div style="height: 1px; background-color: #e8e8e8;"></div>
                        </div>
                        
                        <!-- Help Section -->
                        <div style="padding: 30px 40px; text-align: center;">
                            <p style="color: #888888; font-size: 13px; line-height: 1.6; margin: 0;">
                                Questions? Our wellness team is here to help. Simply reply to this email or visit our spa.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8f5f2; padding: 30px 40px; text-align: center;">
                            <p style="color: #2d5a47; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Aura Spa - Where Serenity Meets Beauty</p>
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                🌸 Relax • Rejuvenate • Renew 🌸
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """, name, verifyLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Verification email sent to: " + toEmail);

        } catch (Exception e) {
            System.err.println("Error sending verification email: " + e.getMessage());
        }
    }
}