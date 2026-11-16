// Server-rendered pages a painting company's customers see: estimates,
// invoices and the lead-capture form. Plain HTML, mobile-friendly, no JS.
import { escapeHtml as e } from "./integrations";
import { usd } from "./money";
import { APP_NAME } from "./config";

export function page(title: string, org: any, body: string) {
  const contact = [org?.profile?.phone, org?.profile?.email].filter(Boolean).map(e).join(" · ");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)} — ${e(org?.name || APP_NAME)}</title><meta name="robots" content="noindex">
<style>
:root{--bg:#f7f5f0;--card:#fff;--ink:#1f2421;--muted:#5f665f;--line:#e4e0d6;--accent:#c4552b;--ok:#2f7d4f;color-scheme:light}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:28px max(16px,env(safe-area-inset-left))}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:24px;margin-bottom:16px}
h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1.1rem;margin:0 0 12px}.muted{color:var(--muted);font-size:.92rem}
table{width:100%;border-collapse:collapse;font-size:.95rem}th,td{padding:10px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th:last-child,td:last-child{text-align:right}tfoot td{border:0;padding:6px}.total td{font-weight:700;font-size:1.1rem}
.btn{display:inline-block;background:var(--accent);color:#fff;border:0;border-radius:10px;padding:13px 22px;font:600 1rem system-ui;cursor:pointer;text-decoration:none}
.btn.secondary{background:transparent;color:var(--muted);border:1px solid var(--line)}
.badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:.8rem;font-weight:600;background:#eee}
.badge.ok{background:#e3f1e8;color:var(--ok)}label{display:block;font-weight:600;font-size:.9rem;margin:14px 0 6px}
input,textarea,select{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:9px;font:inherit;background:#fff}
.row{display:flex;gap:12px;flex-wrap:wrap}.row>*{flex:1 1 220px;min-width:0}.check{display:flex;gap:10px;align-items:flex-start;font-weight:400;font-size:.88rem}
.check input{width:auto;margin-top:4px}.scope{white-space:pre-wrap}footer{text-align:center;color:var(--muted);font-size:.8rem;padding:10px}
</style></head><body><div class="wrap">
<div style="margin-bottom:18px"><strong style="font-size:1.15rem">${e(org?.name || "")}</strong><div class="muted">${contact}</div></div>
${body}
<footer>Sent with ${e(APP_NAME)}</footer></div></body></html>`;
}

function lineTable(doc: any) {
  const rows = (doc.lineItems || [])
    .map((li: any) => `<tr><td>${e(li.description)}</td><td>${e(li.qty)}</td><td>${usd(li.unitPrice)}</td><td>${usd(li.amount)}</td></tr>`)
    .join("");
  return `<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody>
<tfoot><tr><td colspan="3">Subtotal</td><td>${usd(doc.subtotal)}</td></tr>
${doc.tax ? `<tr><td colspan="3">Tax (${e(doc.taxRate)}%)</td><td>${usd(doc.tax)}</td></tr>` : ""}
<tr class="total"><td colspan="3">Total</td><td>${usd(doc.total)}</td></tr></tfoot></table>`;
}

export function estimatePage(org: any, est: any, token: string, flash = "") {
  const accepted = est.status === "Accepted";
  const declined = est.status === "Declined";
  const expires = est.createdAt ? new Date(Date.parse(est.createdAt) + (est.validDays || 30) * 86400000) : null;
  const expired = !accepted && expires && expires.getTime() < Date.now();
  const action = accepted
    ? `<p><span class="badge ok">Accepted</span> by ${e(est.acceptedName || "")} on ${e(new Date(est.acceptedAt).toLocaleDateString("en-US"))}. ${e(org.name)} will be in touch to schedule.</p>`
    : declined
    ? `<p><span class="badge">Declined</span> Changed your mind? Contact ${e(org.name)}.</p>`
    : expired
    ? `<p><span class="badge">Expired</span> This estimate expired on ${e(expires!.toLocaleDateString("en-US"))}. Contact ${e(org.name)} for an updated price.</p>`
    : `<form method="post" action="/e/${e(token)}/respond">
<h2>Ready to move forward?</h2>
<label for="name">Your full name</label><input id="name" name="name" required maxlength="120" autocomplete="name">
<label class="check"><input type="checkbox" name="agree" value="1" required> I accept this estimate and authorize ${e(org.name)} to schedule the work described above.</label>
<div class="row" style="margin-top:16px"><button class="btn" name="decision" value="accept">Accept estimate</button>
<button class="btn secondary" name="decision" value="decline" formnovalidate>Decline</button></div></form>`;
  return page(`Estimate ${est.number}`, org, `
${flash ? `<div class="card"><strong>${e(flash)}</strong></div>` : ""}
<div class="card"><h1>Estimate ${e(est.number)}</h1>
<div class="muted">Prepared for ${e(est.clientName)}${est.address ? " · " + e(est.address) : ""}${expires ? ` · Valid until ${e(expires.toLocaleDateString("en-US"))}` : ""}</div></div>
${est.scope ? `<div class="card"><h2>Scope of work</h2><div class="scope">${e(est.scope)}</div></div>` : ""}
<div class="card">${lineTable(est)}${est.notes ? `<p class="muted scope">${e(est.notes)}</p>` : ""}</div>
<div class="card">${action}</div>`);
}

export function invoicePage(org: any, inv: any, token: string, opts: { paidNow?: boolean; canPay: boolean }) {
  const due = Math.max(0, Number(inv.total) - Number(inv.amountPaid || 0));
  const status = inv.status === "Paid"
    ? `<p><span class="badge ok">Paid</span> Thank you! Paid ${inv.paidAt ? "on " + e(new Date(inv.paidAt).toLocaleDateString("en-US")) : ""}.</p>`
    : inv.status === "Void"
    ? `<p><span class="badge">Void</span> This invoice was canceled.</p>`
    : opts.paidNow
    ? `<p><span class="badge ok">Payment received</span> Your payment is processing. You'll get a receipt by email.</p>`
    : opts.canPay
    ? `<form method="post" action="/i/${e(token)}/pay"><p><strong>Amount due: ${usd(due)}</strong> · Due ${e(inv.dueDate)}</p><button class="btn">Pay ${usd(due)} by card</button></form>`
    : `<p><strong>Amount due: ${usd(due)}</strong> · Due ${e(inv.dueDate)}</p><p class="muted">Contact ${e(org.name)} for payment options.</p>`;
  return page(`Invoice ${inv.number}`, org, `
<div class="card"><h1>Invoice ${e(inv.number)}</h1><div class="muted">Billed to ${e(inv.clientName)}${inv.address ? " · " + e(inv.address) : ""}</div></div>
<div class="card">${lineTable(inv)}${inv.amountPaid ? `<p class="muted">Paid so far: ${usd(inv.amountPaid)}</p>` : ""}${inv.notes ? `<p class="muted scope">${e(inv.notes)}</p>` : ""}</div>
<div class="card">${status}</div>`);
}

export function leadFormPage(org: any, token: string, flash = "") {
  const services = (org.profile?.services || []).length ? org.profile.services : ["Interior painting", "Exterior painting", "Commercial painting", "Cabinets", "Other"];
  return page("Request a free estimate", org, `
<div class="card"><h1>Request a free estimate</h1><p class="muted">Tell ${e(org.name)} about your project and we'll reach out to schedule a visit.</p>
${flash ? `<p><strong>${e(flash)}</strong></p>` : ""}
<form method="post" action="/f/${e(token)}">
<div class="row"><div><label for="n">Name</label><input id="n" name="clientName" required maxlength="120" autocomplete="name"></div>
<div><label for="p">Phone</label><input id="p" name="phone" required maxlength="40" autocomplete="tel" inputmode="tel"></div></div>
<div class="row"><div><label for="em">Email</label><input id="em" name="email" type="email" maxlength="200" autocomplete="email"></div>
<div><label for="t">Property type</label><select id="t" name="clientType"><option>Residential</option><option>Commercial</option></select></div></div>
<label for="a">Project address</label><input id="a" name="address" maxlength="200" autocomplete="street-address">
<label for="s">Service</label><select id="s" name="service">${services.map((s: string) => `<option>${e(s)}</option>`).join("")}</select>
<label for="d">Project details</label><textarea id="d" name="projectDescription" rows="4" maxlength="2000" placeholder="Rooms or surfaces, condition, timeline"></textarea>
<label class="check"><input type="checkbox" name="contactConsent" value="1"> I agree that ${e(org.name)} may contact me about my request by phone call, text message and email, including automated and AI-assisted calls and texts, at the number provided. Consent is not a condition of purchase. Message and data rates may apply. Reply STOP to opt out.</label>
<input type="text" name="company_website" tabindex="-1" autocomplete="off" style="position:absolute;left:-5000px" aria-hidden="true">
<div style="margin-top:18px"><button class="btn">Request my estimate</button></div>
</form></div>`);
}

export function messagePage(org: any, title: string, message: string) {
  return page(title, org, `<div class="card"><h1>${e(title)}</h1><p>${e(message)}</p></div>`);
}
