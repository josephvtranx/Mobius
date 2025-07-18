import express from 'express';
import { resend } from '../email/transport.js';

const router = express.Router();

router.post('/api/register-institution', async (req, res) => {
  const data = req.body;

  // basic required fields
  const required = ['institutionName','institutionLocation','institutionSize',
                    'phone','email'];
  for (const f of required) {
    if (!data[f]) return res.status(400).json({ error:`${f} is required`});
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'josephvtranx@gmail.com',
      subject: `New workspace request – ${data.institutionName}`,
      html: `
        <h2>New Institution Registration Request</h2>
        <p><strong>Name:</strong> ${data.institutionName}</p>
        <p><strong>Location:</strong> ${data.institutionLocation}</p>
        <p><strong>Size (people):</strong> ${data.institutionSize}</p>
        <p><strong>Instructors:</strong> ${data.instructors || 'n/a'}</p>
        <p><strong>Students:</strong> ${data.students || 'n/a'}</p>
        <p><strong>Staff:</strong> ${data.staff || 'n/a'}</p>
        <hr>
        <h3>Contact Information</h3>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Website:</strong> ${data.website || 'n/a'}</p>
        <hr>
      `
    });
    res.sendStatus(202);          // accepted
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Email failed' });
  }
});

export default router; 