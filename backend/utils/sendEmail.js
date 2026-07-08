// Render ke free tier pe SMTP ports (25, 465, 587) blocked hain,
// isliye nodemailer/SMTP ki jagah Brevo ki HTTP API use kar rahe hain (HTTPS pe chalti hai, SMTP pe nahi)
const sendEmail = async (to, subject, html) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: { name: 'Food Delivery', email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Brevo API error: ${response.status}`);
  }

  return response.json();
};

module.exports = sendEmail;