import { Link } from "react-router-dom";
import { ArrowUpRight, Info } from "lucide-react";
import { PageHeader } from "@/components/SectionHeading";
import { PAYMENT_DISCLOSURE, PAYMENT_MODE } from "@/lib/payments";
import { paymentsOpen } from "@/lib/config";
import { backendMode } from "@/lib/api";

interface Section {
  id?: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

function LegalPage({
  eyebrow,
  title,
  description,
  sections,
  footnote,
  notice,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: Section[];
  footnote?: string;
  notice?: string;
}) {
  return (
    <div className="container max-w-4xl py-12 sm:py-16">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <p className="mt-5 text-[11.5px] text-muted-foreground">
        Last updated 27 October 2026 · {backendMode === "local-demo" ? "Demo build" : "Live deployment"}
      </p>

      {notice && (
        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3.5 text-[12px] leading-relaxed text-amber-100/80">
          {notice}
        </div>
      )}

      <div className="mt-10 space-y-10">
        {sections.map((section, index) => (
          <section key={section.title} id={section.id} className="scroll-mt-24">
            <h2 className="text-[17px] font-semibold tracking-[-0.01em]">
              <span className="mr-2 text-[12px] tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 text-[13.5px] leading-[1.75] text-muted-foreground">
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-pretty">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2 pt-1">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      {footnote && (
        <div className="mt-12 flex items-start gap-2.5 rounded-xl border border-border/70 bg-card/30 p-4 text-[12px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} />
          <span>{footnote}</span>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4 border-t border-border/60 pt-6 text-[12px]">
        <Link to="/rules" className="text-muted-foreground hover:text-foreground">
          Platform rules
        </Link>
        <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
          Privacy policy
        </Link>
        <Link to="/payments" className="text-muted-foreground hover:text-foreground">
          Payment disclosure
        </Link>
        <a
          href="mailto:moderation@wishdrop.demo"
          className="ml-auto inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
        >
          Contact moderation
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

export function RulesPage() {
  return (
    <LegalPage
      eyebrow="Trust & safety"
      title="Platform rules"
      description="WishDrop works only if people can trust what they read here. These rules apply to every wish, thank-you, report and profile."
      sections={[
        {
          title: "Who can be here",
          paragraphs: [
            "You need to be 18 or older to post a wish or support one with money. Accounts exist so wishes can be edited, reports can be handled, and contributions can be refunded. Browsing is open to everyone.",
            "One account per person. Throwaway accounts used to repost removed wishes or evade a suspension are removed.",
          ],
        },
        {
          title: "What a wish should be",
          bullets: [
            "A specific item or a verifiable expense — education, essential costs, a necessary repair, a modest experience.",
            "Priced honestly, with a link or quote when one exists. The platform limit is 2,000 in your chosen currency.",
            "Written by the person it is for. You may post on behalf of a family member only if you say so, and only with their knowledge.",
            "One open wish per person at a time is enough to keep the feed readable. Duplicate wishes are merged or removed.",
          ],
        },
        {
          title: "What gets removed",
          bullets: [
            "Requests for cash, gift cards, crypto, wire transfers, or any payment arranged off-platform.",
            "Loans, investment promises, “repay 5x”, guaranteed returns, or anything that smells like advance-fee fraud.",
            "Wishes that collect personal data: home addresses, phone numbers, ID numbers, school names, or children's details.",
            "Copied stories, stock photos presented as personal items, or claims that cannot be checked.",
            "Harassment, pressure, gendered or discriminatory requests, and wishes aimed at mocking someone.",
            "Anything illegal, or that requires a third party's private information to fulfil.",
          ],
        },
        {
          title: "How supporters should behave",
          paragraphs: [
            "Supporting a wish is a gift, not a transaction and not a relationship. Do not use a contribution to demand contact, attention or favours. Do not ask for a recipient's address, workplace or phone number.",
            "Anonymity is real here. If a supporter chooses to stay anonymous, do not try to work out who they are, and do not pressure the recipient to reveal them.",
          ],
        },
        {
          title: "Privacy by default",
          paragraphs: [
            "Do not publish anyone's personal information, including your own delivery details. Fulfilment is arranged privately after a wish is funded, using the platform's consent-based handoff.",
            "Wishes are public. Assume anyone can read them, and share only what a stranger would need to understand and verify the request.",
          ],
        },
        {
          id: "reporting",
          title: "Reporting and moderation",
          paragraphs: [
            "Every wish can be reported from its page. Reports go to a human queue with a reason and your description; the person who posted the wish does not see who reported them.",
            "Moderators can dismiss a report, remove a wish, or suspend an account. Removals always include a reason, and the author is notified.",
            "If you believe a decision was wrong, reply to the moderation email on this site with the wish link and what you think was missed. Appeals are read by a person.",
          ],
        },
        {
          title: "Enforcement",
          bullets: [
            "First offence for an honest mistake: a warning and a request to edit.",
            "Payment abuse, impersonation, or a second attempt after a warning: removal and suspension.",
            "Scams, harassment, or attempts to obtain personal data: immediate suspension, and law-enforcement referral where required.",
          ],
        },
        {
          title: "What WishDrop is not",
          paragraphs: [
            "WishDrop is not a charity, a lender, an escrow service, or a shop. We do not guarantee that a wish will be fulfilled, and we do not verify every claim before it appears. We do remove what we find, respond to every report, and publish our limitations openly.",
          ],
        },
      ]}
      footnote="This demo build stores moderation actions in your browser only. In a live deployment, rules are enforced against the reports and audit tables described in the database schema."
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy policy"
      description="WishDrop is built so that asking for help does not require giving up your privacy. This is what we hold, where it appears, and how to remove it."
      sections={[
        {
          title: "What we collect",
          bullets: [
            "Account basics: email, password hash, display name, optional photo, optional short bio.",
            "Wishes you post: title, story, category, amount, optional image, optional retailer link, and whether you want to be anonymous.",
            "Support records: amount, currency, method, anonymity preference, a payment reference, and a short optional message.",
            "Safety records: reports about wishes, their resolution, and moderation actions.",
            "Usage basics needed for the app to function, such as saved wishes and notifications.",
          ],
        },
        {
          title: "What is public",
          paragraphs: [
            "Wishes, their stories, amounts, progress, status and thank-you messages are public. So is your display name or anonymous handle, unless you choose anonymity.",
            "You can browse the entire platform without an account, and without creating a profile.",
          ],
        },
        {
          title: "What we never display publicly",
          bullets: [
            "Home addresses, delivery details, phone numbers, or ID documents.",
            "Card numbers or bank details — WishDrop never collects them; a payment provider handles them.",
            "Supporter identities when they choose to stay anonymous.",
            "Email addresses. Your email is used for account access and safety notices, not shown on your profile.",
          ],
        },
        {
          title: "How anonymity works",
          paragraphs: [
            "An anonymous wish shows a stable handle derived from your account, so the feed stays coherent without revealing who you are. Your display name is not rendered, but moderators can still see the account behind a wish — anonymity protects you from the public, not from accountability.",
            "Supporters can stay anonymous publicly. A live payment flow would still hold the payer's identity with the payment provider for refunds and legal obligations.",
          ],
        },
        {
          title: "Delivery arrangements",
          paragraphs: [
            "WishDrop never publishes an address. When a wish is fulfilled, delivery is agreed privately between the two people involved, with consent. Share only what a courier needs, and never post it in the wish or a public message.",
          ],
        },
        {
          title: "Storage in this build",
          paragraphs: [
            "This is a demo build. Accounts, wishes, contributions, reports and saved wishes are stored in your browser's local storage on this device. Nothing is sent to a server, and clearing site data deletes it.",
            `With Supabase credentials configured, the same data would live in a Postgres database with row-level security policies, auth sessions, and private storage buckets. ${PAYMENT_DISCLOSURE}`,
          ],
        },
        {
          title: "Retention and your choices",
          bullets: [
            "You can edit or delete your wishes at any time from your dashboard.",
            "Deleting a wish removes it from the feed and from saved lists. Supporter contribution history remains with the supporter.",
            "Reports are retained for safety even if a wish is deleted, because they are the record of a moderation decision.",
            "In a live deployment you can request account export or deletion by emailing moderation.",
          ],
        },
        {
          title: "Children and sensitive data",
          paragraphs: [
            "WishDrop is for adults. Do not post a child's full name, school, or photograph, and do not include health records, identity documents, or anyone else's personal information in a wish.",
          ],
        },
      ]}
      footnote="Questions about this policy can go to moderation@wishdrop.demo. This document describes the demo build; a production launch requires review against applicable data-protection law in the markets served."
    />
  );
}

export function PaymentsPage() {
  return (
    <LegalPage
      eyebrow="Money, transparently"
      title="Payment disclosure"
      description="WishDrop does not process real payments in this build. Here is exactly what the demo does, and what a live version must have in place before it ever charges anyone."
      notice={
        paymentsOpen
          ? undefined
          : "Donations are closed on this deployment. The sections below describe the demo build and the requirements a live payment flow must meet before it can accept money."
      }
      sections={[
        {
          title: "This build runs in demo mode",
          paragraphs: [
            PAYMENT_DISCLOSURE,
            "Every contribution you record here is simulated. It produces a DEMO- reference, updates the wish's progress locally, and is labeled as demo throughout the interface. No card details are requested, no retailer is contacted, and no order is placed.",
          ],
        },
        {
          title: "No money is ever claimed to have moved",
          paragraphs: [
            "A wish is only shown as fulfilled when its recorded contributions reach the goal. In demo mode that state is simulated. In a live build, a contribution is only marked confirmed after the payment provider sends a verified webhook confirming the charge.",
          ],
        },
        {
          title: "What a live build must have",
          bullets: [
            "A merchant account with a supported payment provider (for example Stripe), with all secret keys kept server-side.",
            "A webhook endpoint that verifies signatures and is the only thing allowed to mark a contribution confirmed.",
            "A written refund and cancellation policy, including what happens if a wish is removed after a contribution.",
            "Payout and delivery terms that explain who buys the item, who holds the money before delivery, and who is responsible if an item never arrives.",
            "KYC and charitable-giving compliance review for each market, plus applicable tax reporting.",
            "Moderation capacity switched on before the first real contribution is accepted.",
          ],
        },
        {
          title: "Refunds and chargebacks",
          paragraphs: [
            "In a live build, unspent contributions would be refundable on request until the wish is fulfilled and the item is purchased. If a wish is removed for breaking the rules, unspent contributions would be returned. Once an item has been bought and delivered, refunds follow the retailer's policy rather than WishDrop's.",
            "Chargebacks would be investigated with the payment provider; accounts used for fraudulent chargebacks would be suspended.",
          ],
        },
        {
          title: "Fees",
          paragraphs: [
            "There is no platform fee in this demo. A live build must publish any platform fee and the payment provider's fee before accepting a contribution — no hidden deductions from a gift.",
          ],
        },
        {
          title: "Not a charity, not tax advice",
          paragraphs: [
            "Contributions here are personal gifts, not charitable donations, and no tax receipt is issued. WishDrop is not a lender, an escrow service, or a financial adviser.",
          ],
        },
        {
          title: "Gift-an-item flow",
          paragraphs: [
            "In a live build, gifting means buying the exact item from a verified retailer. The recipient never sees your payment details or address, and delivery is arranged through a consent-based handoff.",
          ],
        },
      ]}
      footnote={
        PAYMENT_MODE === "demo"
          ? "Real payments must not be enabled until the payment flow, refund process, legal requirements and moderation system are configured and reviewed. This page is part of that disclosure."
          : "Payment mode is configured as live. Confirm that the disclosures above match your provider, refund policy and local legal requirements."
      }
    />
  );
}
