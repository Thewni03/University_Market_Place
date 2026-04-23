// src/utils/marketplaceEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = `UniMarket <${process.env.EMAIL_USER}>`;

const send = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[Email] ✓ ${subject} → ${to}`);
  } catch (err) {
    console.error(`[Email] ✗ Failed → ${to}:`, err.message);
    // Never throw — email failure must never crash the API
  }
};

const header = (icon, title, subtitle) => `
  <div style="background:#22c55e;border-radius:12px 12px 0 0;padding:24px 28px;text-align:center;">
    <div style="font-size:36px;margin-bottom:8px;">${icon}</div>
    <div style="color:white;font-size:20px;font-weight:700;">${title}</div>
    <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px;">${subtitle}</div>
  </div>`;

const productCard = ({ title, price, category, condition, faculty }) => `
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:16px 0;">
    <div style="font-size:11px;color:#94a3b8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">ITEM DETAILS</div>
    <div style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:10px;">${title}</div>
    <div style="font-size:22px;font-weight:800;color:#22c55e;margin-bottom:12px;">LKR ${Number(price).toLocaleString()}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <span style="background:#dcfce7;color:#166534;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:600;">${category}</span>
      <span style="background:#fef3c7;color:#92400e;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:600;">${condition}</span>
      <span style="background:#ede9fe;color:#6d28d9;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:600;">${faculty}</span>
    </div>
  </div>`;

const contactCard = (color, bg, label, name, email) => `
  <div style="background:${bg};border-radius:10px;padding:14px 16px;margin-bottom:12px;">
    <div style="font-size:11px;color:${color};font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">${label}</div>
    <div style="font-size:14px;font-weight:700;color:#0f172a;">${name}</div>
    <div style="font-size:13px;color:#475569;margin-top:2px;">${email}</div>
  </div>`;

const wrap = (content) => `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#f0fdf4;padding:20px;border-radius:16px;">
  <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    ${content}
    <div style="padding:20px 28px;">
      <div style="border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;font-size:11px;color:#94a3b8;">
        UniMarket · Campus Skill &amp; Product Exchange<br/>
        <a href="http://localhost:5173/marketplace" style="color:#22c55e;text-decoration:none;">Open Marketplace →</a>
      </div>
    </div>
  </div>
</div>`;

export const sendCampusMeetSeller = async ({
  sellerEmail, sellerName, buyerName, buyerEmail,
  productTitle, price, category = "—", condition = "—", faculty = "—"
}) => {
  const html = wrap(`
    ${header("New Campus Meeting Request", "Someone wants to buy your item!")}
    <div style="padding:24px 28px;">
      <p style="font-size:15px;color:#0f172a;margin:0 0 4px;">Hi <strong>${sellerName}</strong>,</p>
      <p style="font-size:14px;color:#475569;margin:0 0 16px;"><strong>${buyerName}</strong> wants to buy your listing and meet on campus to complete the transaction.</p>
      ${productCard({ title: productTitle, price, category, condition, faculty })}
      ${contactCard("#166534","#dcfce7","Buyer — Contact Them","${buyerName}","${buyerEmail}")}
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
        <div style="font-size:13px;color:#92400e;"><strong>Next steps:</strong> Reach out to ${buyerName} at <strong>${buyerEmail}</strong> to arrange a campus meeting. Once handed over, mark the item as <strong>Sold</strong> in your listings.</div>
      </div>
    </div>
  `);
  await send(sellerEmail, `${buyerName} wants to buy "${productTitle}"`, html);
};


export const sendCampusMeetBuyer = async ({
  buyerEmail, buyerName, sellerName, sellerEmail,
  productTitle, price, category = "—", condition = "—", faculty = "—"
}) => {
  const html = wrap(`
    ${header("Request Sent!", "Your campus meeting request is on its way")}
    <div style="padding:24px 28px;">
      <p style="font-size:15px;color:#0f172a;margin:0 0 4px;">Hi <strong>${buyerName}</strong>,</p>
      <p style="font-size:14px;color:#475569;margin:0 0 16px;">Your request to buy the following item has been sent to the seller. They will contact you soon to arrange a campus meetup.</p>
      ${productCard({ title: productTitle, price, category, condition, faculty })}
      ${contactCard("#0369a1","#f0f9ff","Seller — They Will Contact You","${sellerName}","${sellerEmail}")}
      <div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:14px 16px;">
        <div style="font-size:13px;color:#166534;">Keep an eye on your inbox — the seller will reach out to arrange the meeting time and place on campus.</div>
      </div>
    </div>
  `);
  await send(buyerEmail, `Campus meeting request sent for "${productTitle}"`, html);
};


export const sendFavouriteNotification = async ({ sellerEmail, sellerName, buyerName, productTitle }) => {
  const html = wrap(`
    ${header("Someone Saved Your Listing!", "You might have a buyer soon")}
    <div style="padding:24px 28px;">
      <p style="font-size:15px;color:#0f172a;margin:0 0 4px;">Hi <strong>${sellerName}</strong>,</p>
      <p style="font-size:14px;color:#475569;margin:0 0 16px;"><strong>${buyerName}</strong> just saved your listing <strong>"${productTitle}"</strong> to their favourites. They might reach out soon!</p>
      <div style="background:#fff1f2;border:1px solid #fca5a5;border-radius:10px;padding:14px 16px;">
        <div style="font-size:13px;color:#9f1239;">Your listing is getting attention. Make sure your contact details are up to date in case the buyer reaches out.</div>
      </div>
    </div>
  `);
  await send(sellerEmail, `❤️ "${productTitle}" was saved by ${buyerName}`, html);
};


export const sendPaymentInitiatedSeller = async ({
  sellerEmail, sellerName, buyerName, buyerEmail, productTitle, price
}) => {
  const html = wrap(`
    ${header("Payment In Progress", "A buyer is completing payment for your item")}
    <div style="padding:24px 28px;">
      <p style="font-size:15px;color:#0f172a;margin:0 0 4px;">Hi <strong>${sellerName}</strong>,</p>
      <p style="font-size:14px;color:#475569;margin:0 0 16px;"><strong>${buyerName}</strong> is in the process of paying for your item.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:16px;">
        <div style="font-size:17px;font-weight:700;color:#0f172a;">${productTitle}</div>
        <div style="font-size:22px;font-weight:800;color:#6366f1;margin-top:4px;">LKR ${Number(price).toLocaleString()}</div>
      </div>
      ${contactCard("#4338ca","#eef2ff","Buyer","${buyerName}","${buyerEmail}")}
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
        <div style="font-size:13px;color:#92400e;">Once payment is confirmed, hand over the item and mark it as <strong>Sold</strong> in your listings.</div>
      </div>
    </div>
  `);
  await send(sellerEmail, `Payment initiated for "${productTitle}"`, html);
};


export const sendPaymentConfirmationBuyer = async ({
  buyerEmail, buyerName, sellerName, sellerEmail, productTitle, price, orderId
}) => {
  const html = wrap(`
    ${header("Payment Confirmed!", "Your purchase is complete")}
    <div style="padding:24px 28px;">
      <p style="font-size:15px;color:#0f172a;margin:0 0 4px;">Hi <strong>${buyerName}</strong>,</p>
      <p style="font-size:14px;color:#475569;margin:0 0 16px;">Your payment has been received. Order reference: <strong>#${orderId?.slice(-8)}</strong></p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:16px;">
        <div style="font-size:17px;font-weight:700;color:#0f172a;">${productTitle}</div>
        <div style="font-size:22px;font-weight:800;color:#22c55e;margin-top:4px;">LKR ${Number(price).toLocaleString()}</div>
      </div>
      ${contactCard("#0369a1","#f0f9ff","Seller — Will Arrange Handover","${sellerName}","${sellerEmail}")}
      <div style="background:#dcfce7;border:1px solid #86efac;border-radius:10px;padding:14px 16px;">
        <div style="font-size:13px;color:#166534;">The seller has been notified. They will contact you to arrange handover of the item.</div>
      </div>
    </div>
  `);
  await send(buyerEmail, `Payment confirmed for "${productTitle}"`, html);
};