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
            String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - Aura Spa");

            // HTML Content
            String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello,</h2>
                    <p>You recently requested to reset your password at Aura Spa.</p>
                    <p>Please click the button below to continue:</p>
                    <a href="%s" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Reset Password
                    </a>
                    <p>This link will expire in 15 minutes.</p>
                    <p>If you did not make this request, please ignore this email.</p>
                </div>
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
            String verifyLink = "http://localhost:5173/verify-account?token=" + token;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Aura Spa Account Verification");

            String htmlContent = String.format("""
            <h3>Hello %s,</h3>
            <p>Thank you for registering. Please click the link below to activate your account:</p>
            <a href="%s">ACTIVATE ACCOUNT</a>
            """, name, verifyLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Error sending verification email: " + e.getMessage());
        }
    }
}