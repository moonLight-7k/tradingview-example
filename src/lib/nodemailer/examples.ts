/**
 * Example usage of Nodemailer functions
 * This file demonstrates how to send emails in your application
 */

import { sendWelcomeEmail, sendNewsSummaryEmail } from '@/lib/nodemailer';

/**
 * Example: Send a welcome email to a new user
 * Call this after user registration
 */
export async function sendWelcomeEmailExample() {
    try {
        await sendWelcomeEmail({
            email: 'user@example.com',
            name: 'John Doe',
            intro: `
                <p class="mobile-text dark-text-secondary" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">
                    Thanks for joining! We're excited to have you on board. 
                    Get ready to track your favorite assets and stay updated with real-time market insights.
                </p>
            `
        });
        console.log('Welcome email sent successfully');
    } catch (error) {
        console.error('Failed to send welcome email:', error);
    }
}

/**
 * Example: Send a daily news summary
 * Call this from a cron job or scheduled task
 */
export async function sendDailyNewsSummaryExample() {
    try {
        const newsContent = `
            <h3 class="mobile-news-title dark-text" style="margin: 30px 0 15px 0; font-size: 18px; font-weight: 600; color: #f8f9fa; line-height: 1.3;">
                Market Highlights
            </h3>
            <p class="mobile-text dark-text-secondary" style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">
                The S&P 500 gained 1.2% today as tech stocks rallied following strong earnings reports from major companies.
            </p>
            
            <h3 class="mobile-news-title dark-text" style="margin: 30px 0 15px 0; font-size: 18px; font-weight: 600; color: #f8f9fa; line-height: 1.3;">
                Top Movers
            </h3>
            <p class="mobile-text dark-text-secondary" style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">
                <strong style="color: #FDD458;">AAPL</strong> up 3.5%, <strong style="color: #FDD458;">TSLA</strong> up 2.8%, 
                <strong style="color: #FDD458;">NVDA</strong> down 1.2%
            </p>
        `;

        const today = new Date().toISOString().split('T')[0];

        await sendNewsSummaryEmail({
            email: 'user@example.com',
            date: today,
            newsContent
        });

        console.log('News summary email sent successfully');
    } catch (error) {
        console.error('Failed to send news summary:', error);
    }
}

/**
 * Example: Send email from a server action
 * Use this in app/actions/email.ts or similar
 */
export async function handleUserSignup(email: string, name: string) {
    'use server';

    try {
        // Your signup logic here...

        // Send welcome email
        await sendWelcomeEmail({
            email,
            name,
            intro: `
                <p class="mobile-text dark-text-secondary" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">
                    Welcome to Dexbit! You're all set to start trading and tracking your portfolio.
                </p>
            `
        });

        return { success: true, message: 'User registered and email sent' };
    } catch (error) {
        console.error('Error during signup:', error);
        return { success: false, message: 'Failed to complete signup' };
    }
}

/**
 * Example: Test your email configuration
 * Run this to verify your SMTP settings work
 */
export async function testEmailConfiguration() {
    try {
        const testEmail = process.env.NODEMAILER_EMAIL || 'test@example.com';

        await sendWelcomeEmail({
            email: testEmail,
            name: 'Test User',
            intro: `
                <p class="mobile-text dark-text-secondary" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">
                    This is a test email to verify your Nodemailer configuration is working correctly.
                </p>
            `
        });

        console.log('✅ Test email sent successfully to:', testEmail);
        return true;
    } catch (error) {
        console.error('❌ Test email failed:', error);
        return false;
    }
}
