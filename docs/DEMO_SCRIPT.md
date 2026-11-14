# DGIX demo script

A click-by-click script for showing how DGIX works, end to end, across all three roles. Every step below changes real (local) data, and each hand-off sends a notification to the next person, so the audience can watch work move from buyer to DGIX to seller and back.

**Time:** about 12 minutes for the buying track, 4 minutes for the seller onboarding track.

## Before you start

1. Run the app (`npm run dev`) and open http://localhost:3000/sign-in.
2. Click **Reset demo data** so you start from the seed state.
3. Switch people with the **Sign in as** buttons in the **Test accounts** panel on `/sign-in`. To get back there, open the account menu (your avatar, top right) and choose **Sign out**.
4. Use a wide window (1280px or more) so the sidebar stays open.

| Person | Role | Signs in as | What they do in the story |
| --- | --- | --- | --- |
| Omar Khalid | Buyer, Gulf Retail Group (UAE) | Buyer | Asks for software, books a demo, signs, accepts work, pays |
| Asha Rahman | DGIX advisor | Staff | Confirms the shortlist, writes the offer |
| Farhan Hossain | DGIX finance | Staff | Verifies payments, releases payouts |
| Nadia Chowdhury | Seller, Daffodil Software (makes Smart Hospital) | Seller | Runs the demo, delivers milestones, gets paid |
| Rahim Karim | Seller, SoftHealth | Seller | Lists a new product (onboarding track) |

> Tip: the bell icon in the top bar shows each person's new notification. Open it after every hand-off; it's the clearest way to show the audience "the next person now knows".

---

## Track 1 · Buying, delivery and money

### 1. The buyer describes the need (Omar)

1. Sign in as **Omar**. Click **New request** in the top bar.
2. Type in plain words, for example:
   *"We run 18 clinics in Dubai. We need patient billing and insurance claims in Arabic and English."*
3. Click **Get my shortlist**.

**Audience sees:** the request page with AI-ranked matches (Smart Hospital, ClinicDesk, Central AI) and the status **Matching**. Say: *AI does the first pass, but a person confirms it.*

**Notification:** Asha gets "New request · Gulf Retail Group".

### 2. DGIX confirms the shortlist (Asha)

1. Sign in as **Asha**. Open **Matching desk**.
2. The new request is at the top. Leave the top two products ticked (Smart Hospital and ClinicDesk) and add a note if you like.
3. Click **Send 2 products to buyer**.

**Audience sees:** only the ticked products go to the buyer. Say: *an advisor checks price, SLA and country fit before the buyer sees anything.*

**Notification:** Omar gets "Your shortlist is ready".

### 3. The buyer books a demo (Omar)

1. Sign in as **Omar**. Open **Requests** and select the new request (or use the notification).
2. On **Smart Hospital**, click **Book demo**.

**Audience sees:** the request moves to **Demos**.

**Notification:** Nadia (the Smart Hospital seller) gets "New demo request".

### 4. The seller confirms and holds the demo (Nadia)

1. Sign in as **Nadia**. Open **Leads & demos**.
2. On the dark "New · demo requested" card, click **Confirm** with the proposed time.
3. The card becomes **Demo booked**. After "holding" the demo, click **Mark demo held**.

**Audience sees:** buyer names stay anonymous ("Retail group, UAE") until after the demo.

**Notifications:** Omar gets "Demo confirmed", then "How was the demo?".

### 5. The buyer rates the demo (Omar)

1. Sign in as **Omar**. Open **Demos**.
2. In **How did it go?** for Smart Hospital, click **Strong fit**.

**Audience sees:** the rating is saved, and the card moves on to the next demo waiting for a rating.

**Notification:** Asha gets "Demo rated “Strong fit” · ready for an offer".

### 6. DGIX writes the offer (Asha)

1. Sign in as **Asha**. Open **Offers & contracts**.
2. **Ready for an offer** lists Gulf Retail Group with "demo rated Strong fit". Click **Draft offer**.
3. Show the pre-filled offer: price from the product, 99.5% SLA, 12-month warranty, no-lock-in exit terms, and three milestones split 30 / 40 / 30. Change the price if you want.
4. Click **Send to buyer**. (Use **Save draft** to show that offers can also wait in **Drafting**.)

**Audience sees:** the offer appears in **Sent to buyer**. Say: *the buyer signs one contract with DGIX; DGIX signs with the partner.*

**Notification:** Omar gets "New offer to review".

### 7. The buyer signs (Omar)

1. Sign in as **Omar**. Open **Offers & contracts**.
2. Tick **I've read the SLA and exit terms** and **I can sign for Gulf Retail Group**.
3. Click **Sign & accept offer**, then **Sign & accept** in the confirmation.

**Audience sees:** a project is created automatically, with milestone 1 in progress.

**Notifications:** Asha gets "Offer accepted"; Nadia gets "New order won".

### 8. The seller delivers a milestone (Nadia)

1. Sign in as **Nadia**. Open **Orders & delivery**. The new Smart Hospital rollout is selected.
2. Attach sign-off evidence: drop a file, or click **Use sample sign-off document**.
3. Click **Submit for buyer review**.

**Notifications:** Omar gets "Milestone ready to review" (it links straight to the project); Asha gets "Milestone submitted".

### 9. The buyer accepts the work (Omar)

1. Sign in as **Omar**. Open the notification, or **Projects** and pick the Smart Hospital rollout.
2. Click **Accept milestone**.

**Audience sees:** an invoice is raised only now, for that milestone's amount. Say: *you never pay for work you haven't accepted.*

**Notifications:** Omar gets "Invoice ready"; Nadia gets "Milestone accepted".

### 10. The buyer pays (Omar)

1. Open **Billing**. On the new invoice, click **Pay**, then **Pay $…** in the dialog.

**Audience sees:** the invoice shows as paid, waiting for DGIX to verify.

**Notification:** Farhan gets "Payment received".

### 11. DGIX verifies the payment and releases the payout (Farhan)

1. Sign in as **Farhan**. Open **Finance**.
2. Under the invoice that was just paid, click **Verify payment**.
3. Click **Approve payouts** to release the scheduled payouts.

**Audience sees:** the payout to Daffodil Software is the invoice amount minus the 15% DGIX fee (for example $14,460 gross → $12,291 net), and its status turns **paid**.

**Notifications:** Omar gets "Payment verified · receipt ready"; Nadia gets "Payout scheduled", then "Payout sent".

### 12. The seller sees the money (Nadia)

1. Sign in as **Nadia**. Open **Payouts**. The net amount shows as paid, with payout advice.

### 13. Handover and licence (optional, about 2 minutes)

Repeat steps 8 and 9 for milestones 2 and 3. When the last milestone is accepted:

- The project is complete, and an **active licence** for Smart Hospital appears in Omar's **Licences**, with seats from the request.
- Omar gets "Handover complete · licence active"; Nadia and Asha get "Project delivered".

You can pay the later invoices the same way as step 10, but you don't need to for the licence to start.

---

## Track 2 · Seller onboarding (Rahim → Asha)

### 1. The seller adds a product (Rahim)

1. Sign in as **Rahim**. Click **Add product** in the top bar.
2. Fill in name (e.g. *ClinicFlow EMR*), category, price from, a one-line pitch, and the markets.
3. Click **Submit for review**.

**Audience sees:** the product passport at **0/100**, with every check showing "Evidence needed", and the status "Not listed yet".

**Notification:** Asha gets "New product submitted".

### 2. The seller uploads evidence (Rahim)

1. Open **Verification**. ClinicFlow EMR is selected.
2. For each card, drop a file or click **Use sample document**. For data residency, pick an answer and click **Save answer**.

**Audience sees:** each card shows "Uploaded · awaiting review", and the product now waits on **DGIX review**.

### 3. DGIX reviews and lists it (Asha)

1. Sign in as **Asha**. Open **Product review**.
2. Click **Open** on ClinicFlow EMR, then **Approve** each check.

**Audience sees:** the score climbs gate by gate (PG0 → PG5). At **100/100** the product is listed and appears in the public catalogue (e.g. `/solutions/erp`) and on its own product page.

**Notification:** Rahim gets "ClinicFlow EMR passed 100/100 · You're now listed."

---

## Resetting between runs

- Go to `/sign-in` and click **Reset demo data**. Everything above lives in the browser's local storage, so the reset is instant and only affects that browser.
- Running the script twice without resetting also works. You'll simply see two requests and two products.

## If something looks off

- **A page shows 404 while developing:** two dev servers are writing to the same `.next` folder. Stop one of them, or delete `.next` and restart `npm run dev`.
- **A notification didn't appear:** make sure you're signed in as the right person. Notifications are per person, not per company.
