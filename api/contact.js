const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // CORS ayarları (Gerekirse)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { user_name, user_email, message } = req.body;

    if (!user_name || !user_email || !message) {
        return res.status(400).json({ error: "Lütfen tüm alanları doldurun." });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // 587 portu için false olmalı
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
            subject: `Yeni İletişim Formu Mesajı: ${user_name}`,
            text: `İletişim formundan yeni bir mesaj aldınız.

Ad Soyad: ${user_name}
E-posta: ${user_email}

Mesaj:
${message}`
        };

        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({ success: true, message: "E-posta başarıyla gönderildi." });
    } catch (error) {
        console.error("E-posta gönderme hatası:", error);
        return res.status(500).json({ error: "E-posta gönderilirken bir hata oluştu." });
    }
};
