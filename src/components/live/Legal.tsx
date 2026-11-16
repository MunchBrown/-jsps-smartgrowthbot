import React from "react";
import { BrandMark, APP_NAME } from "./Brand";

// DRAFT legal pages — have a Pennsylvania attorney review before launch.
// Update these details to match the legal entity that sells the service.
export const LEGAL = {
  entity: "Johnny Sons Painting Services L.L.C., doing business as Smart Growth Bot",
  shortName: "Smart Growth Bot",
  state: "Pennsylvania",
  county: "York County",
  email: "support@smartgrowthbot.com",
  effective: "November 16, 2026",
};

function Shell({ title, children, onBack }: { title: string; children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button onClick={onBack} className="cursor-pointer" aria-label="Back to home"><BrandMark size="sm" /></button>
          <nav className="flex gap-4 text-sm text-slate-400">
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/messaging-policy" className="hover:text-white">Messaging policy</a>
          </nav>
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-4 py-10 leading-relaxed [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 text-[15px]">
        <h1 className="text-3xl font-bold font-serif text-white text-balance">{title}</h1>
        <p className="text-sm text-slate-500 mt-2">Effective {LEGAL.effective}</p>
        {children}
      </article>
    </div>
  );
}

export function Terms({ onBack }: { onBack: () => void }) {
  return (
    <Shell title="Terms of Service" onBack={onBack}>
      <p>These Terms govern your use of {APP_NAME} (the "Service"), provided by {LEGAL.entity} ("{LEGAL.shortName}", "we", "us"). By creating an account or using the Service you agree to these Terms on behalf of yourself and the business you represent ("you").</p>
      <h2>1. The Service</h2>
      <p>The Service is software for painting contractors to manage leads, estimates, scheduling, invoices and customer communication, including AI-assisted features and connections to third-party services you choose to connect (such as Vapi, Twilio, Google and Stripe).</p>
      <h2>2. Accounts</h2>
      <ul>
        <li>You must be at least 18 and able to enter contracts for your business.</li>
        <li>Keep your login secure. You're responsible for activity under your account and your team members' accounts.</li>
        <li>Give us accurate company information and keep it current.</li>
      </ul>
      <h2>3. Free trial, subscription and cancellation</h2>
      <ul>
        <li>Paid plans start with a free trial (currently 14 days) unless an offer says otherwise. A payment card is required to start the trial.</li>
        <li><strong>Unless you cancel before the trial ends, your subscription starts automatically and your card is charged the plan price shown at checkout, then again every month until you cancel.</strong></li>
        <li>You can cancel anytime in Settings → Billing &amp; payments. Cancellation takes effect at the end of the current billing period; we don't give partial-month refunds except where the law requires.</li>
        <li>We may change prices with at least 30 days' notice by email. Changes apply from your next billing period.</li>
        <li>Plans include limits (users, new leads per month, daily AI requests). We'll tell you in the app when you reach a limit.</li>
      </ul>
      <h2>4. Your responsibilities for calls, texts and email</h2>
      <p>You — not {LEGAL.shortName} — are the sender of calls, texts and emails made through your connected accounts. You agree to follow our <a className="text-orange-400" href="/messaging-policy">Messaging &amp; AI Calling Policy</a> and all applicable laws, including the Telephone Consumer Protection Act (TCPA), the Telemarketing Sales Rule, CAN-SPAM, carrier rules (including A2P 10DLC registration) and state telemarketing and recording laws. In particular, you must have the consent the law requires before placing AI-voice calls or sending marketing texts, and you must honor opt-out requests.</p>
      <h2>5. AI features</h2>
      <p>AI features (lead scoring, scopes of work, photo measurements, proposals, call summaries and similar) can be wrong or incomplete. Review AI output before you rely on it or send it to anyone. Measurements and prices are estimates, not guarantees, and you remain responsible for your quotes, contracts and work.</p>
      <h2>6. Payments from your customers</h2>
      <p>Online invoice payments are processed by Stripe through a Stripe account connected to your business, subject to the <a className="text-orange-400" href="https://stripe.com/legal/connect-account" target="_blank" rel="noreferrer">Stripe Connected Account Agreement</a>. You are the merchant for those payments and are responsible for refunds, disputes and taxes on your sales. {LEGAL.shortName} doesn't hold your funds.</p>
      <h2>7. Your data</h2>
      <p>You own the data you and your customers put into the Service ("Customer Data"). You give us permission to store and process Customer Data only to provide, secure and support the Service. You're responsible for having the right to give us your customers' information. You can ask us to export or delete your Customer Data at any time by emailing {LEGAL.email}. Our <a className="text-orange-400" href="/privacy">Privacy Policy</a> explains how we handle personal information.</p>
      <h2>8. Third-party services</h2>
      <p>When you connect Vapi, Twilio, Google, Stripe or another service, your use of it is governed by that provider's terms and pricing, which you pay directly. We aren't responsible for third-party services or their outages.</p>
      <h2>9. Acceptable use</h2>
      <ul>
        <li>No unlawful, deceptive, harassing or unsolicited communications.</li>
        <li>No attempts to access other customers' data, probe or overload the Service, or reverse engineer it.</li>
        <li>No reselling the Service without our written agreement.</li>
      </ul>
      <p>We may suspend accounts that violate these rules or put others at risk, with notice where practical.</p>
      <h2>10. Disclaimers</h2>
      <p>The Service is provided "as is" and "as available". To the fullest extent the law allows, we disclaim all implied warranties, including merchantability, fitness for a particular purpose and non-infringement. We don't promise any particular number of leads, jobs or revenue.</p>
      <h2>11. Limitation of liability</h2>
      <p>To the fullest extent the law allows, {LEGAL.shortName} won't be liable for indirect, incidental, special, consequential or punitive damages, or lost profits or revenue, and our total liability for any claim is limited to the amount you paid us in the 12 months before the claim.</p>
      <h2>12. Indemnity</h2>
      <p>You'll defend and indemnify {LEGAL.shortName} against claims arising from your communications with your customers, your Customer Data, or your violation of these Terms or the law.</p>
      <h2>13. Ending the agreement</h2>
      <p>You can stop using the Service and cancel anytime. We may end these Terms with 30 days' notice, or immediately for serious breach. After termination you can request an export of your Customer Data for 30 days, after which we may delete it.</p>
      <h2>14. General</h2>
      <p>These Terms are governed by the laws of the Commonwealth of {LEGAL.state}, and disputes will be heard in the state or federal courts serving {LEGAL.county}, {LEGAL.state}. If we change these Terms in a material way we'll notify you by email or in the app at least 30 days before the change takes effect. Questions: {LEGAL.email}.</p>
    </Shell>
  );
}

export function Privacy({ onBack }: { onBack: () => void }) {
  return (
    <Shell title="Privacy Policy" onBack={onBack}>
      <p>This policy explains how {LEGAL.entity} ("we") handles personal information in {APP_NAME}.</p>
      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account information:</strong> your name, email, company details and team members.</li>
        <li><strong>Customer Data you add:</strong> your leads' and customers' names, phone numbers, emails, addresses, project details, estimates, invoices, appointments, text messages, and AI call summaries, transcripts and recording links.</li>
        <li><strong>Billing information:</strong> handled by Stripe. We receive your subscription status and the last details Stripe shares with us, not your full card number.</li>
        <li><strong>Technical information:</strong> log data such as IP address and browser type, used for security and troubleshooting.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To provide and secure the Service, process payments, provide support, send service notices, and improve the Service. We act as a service provider (processor) to you for Customer Data and use it only on your instructions. <strong>We do not sell personal information</strong>, and we don't use your Customer Data to advertise to your customers.</p>
      <h2>Service providers</h2>
      <p>We use these providers to run the Service: Google Cloud and Firebase (hosting, sign-in and database), Google Gemini (AI features), Stripe (payments), and — only when you connect them — Vapi (AI phone calls), Twilio (text messages), Google Calendar and Gmail, and an email delivery provider. They process data under their own privacy and security commitments.</p>
      <h2>Google user data</h2>
      <p>If you connect Google, we request permission to create calendar events and send email on your behalf. We use this access only to add bookings to your calendar and send the estimates, invoices and invites you ask us to send. {APP_NAME}'s use and transfer of information received from Google APIs adheres to the <a className="text-orange-400" href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements. We don't read your inbox, and we don't use Google user data for advertising or to train AI models.</p>
      <h2>Security</h2>
      <p>Data is encrypted in transit. Connection secrets (such as Twilio and Vapi keys and Google tokens) are encrypted at rest. Each company's data is separated, and every request is checked against the signed-in user's company. No system is perfectly secure; tell us right away at {LEGAL.email} if you suspect a problem.</p>
      <h2>Retention</h2>
      <p>We keep Customer Data while your account is active. After you cancel, we keep it for 30 days so you can request an export, then delete it from active systems within 90 days, except where the law requires us to keep records.</p>
      <h2>Your choices and rights</h2>
      <p>You can view and update most information in the app. To request access, correction, export or deletion, email {LEGAL.email}. If you're a customer of a painting company that uses {APP_NAME}, please contact that company first — they control your information — and we'll help them respond.</p>
      <h2>Text messages</h2>
      <p>Mobile numbers and SMS opt-in consent collected through the Service are not shared with third parties or affiliates for their marketing purposes.</p>
      <h2>Children</h2>
      <p>The Service is for businesses and isn't directed to children under 13.</p>
      <h2>Changes and contact</h2>
      <p>We'll post updates here and notify account owners of material changes. Questions: {LEGAL.email}.</p>
    </Shell>
  );
}

export function MessagingPolicy({ onBack }: { onBack: () => void }) {
  return (
    <Shell title="Messaging & AI Calling Policy" onBack={onBack}>
      <p>{APP_NAME} lets painting companies call and text their leads and customers using their own Vapi and Twilio accounts. Every company using these features must follow this policy. It is not legal advice; talk to your attorney about your situation.</p>
      <h2>1. Get consent first</h2>
      <ul>
        <li>Calls that use an AI or artificial voice, and marketing texts, require the person's <strong>prior express written consent</strong> under the TCPA. Record how and when you got it in the lead's consent box. Leads from your {APP_NAME} form record consent automatically when the person ticks the box.</li>
        <li>The app blocks AI calls and outbound texts to leads without recorded consent. You may reply to a person who texted you first.</li>
        <li>Don't buy or rent contact lists for AI calling or texting.</li>
      </ul>
      <h2>2. Identify yourself</h2>
      <p>Your AI assistant must say at the start of each call that it is an AI assistant calling for your company, and give the company name. Texts must identify your company.</p>
      <h2>3. Honor opt-outs immediately</h2>
      <p>If someone replies STOP (or a similar word), or asks on a call not to be contacted, stop. The app marks STOP replies and blocks further texts and AI calls to that lead. Also honor opt-out requests made any other reasonable way.</p>
      <h2>4. Respect calling hours and Do-Not-Call lists</h2>
      <ul>
        <li>Only call or text between 8 a.m. and 9 p.m. in the recipient's local time, or narrower hours where state law requires.</li>
        <li>Scrub marketing contacts against the National Do Not Call Registry and your own internal do-not-call list, unless you have the person's written consent or an established business relationship that allows the contact.</li>
      </ul>
      <h2>5. Recording</h2>
      <p>Pennsylvania and several other states require all parties' consent to record a call. If your assistant records calls, it must tell the caller at the start.</p>
      <h2>6. Carrier registration</h2>
      <p>Register your business texting (A2P 10DLC) in your Twilio account before texting customers. Unregistered texts may be blocked.</p>
      <h2>7. Content</h2>
      <p>No misleading claims, prohibited content, or messages unrelated to the customer's request. Keep messages relevant to estimates, appointments, jobs and payments.</p>
      <h2>8. Enforcement</h2>
      <p>We may suspend calling or texting features for accounts that violate this policy. Report abuse to {LEGAL.email}.</p>
    </Shell>
  );
}
