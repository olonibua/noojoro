# PRD: Automated Match System — LetsGoHalf

**Version:** 1.0 Draft
**Date:** March 6, 2026
**Platform:** Web (rentsplit-frontend / rentsplit-backend)
**Status:** Proposal


## 1. Problem Statement

The current interest system on LetsGoHalf works like this: someone posts a listing, interested users click "I'm Interested," a thread opens, and both parties start messaging each other freely. This creates several problems:

- **Users exchange contact info early** and leave the platform, bypassing monetization entirely.
- **Post owners get overwhelmed** with unfiltered messages from people who aren't a good fit.
- **No structured way to evaluate compatibility** — it's just open conversation, which favors outgoing people over actually compatible ones.
- **Matching is manual** — the post owner has to read through conversations and guess who's the best fit.
- **Monetization is weak** — we only make money on optional premium features and boosts, not on the core value (the match itself).

The new system eliminates free-form messaging before a match. Instead, it uses structured question-and-answer matching — like a chatbot flow — where both parties answer preset questions, the system calculates a compatibility score, and payment unlocks the connection only when there's a strong match.


## 2. Goals

- **Automate matching** based on structured compatibility scoring, not manual conversation.
- **Monetize the match itself** — both the poster and the interested user pay to unlock a verified 90%+ match.
- **Reduce noise** for post owners — only high-compatibility users surface.
- **Keep users on-platform** — no contact info exchanged until after payment.
- **Improve match quality** — structured questions surface real compatibility, not just who messages first.


## 3. How It Works — End to End

### 3.1 Post Owner Creates a Post + Selects Questions

When creating a post, the owner goes through an additional step: **choosing the questions they want potential matches to answer.**

The system provides a **library of pre-built questions organized by category**, each with pre-defined answer options (multiple choice). The poster picks which questions matter to them. They must select a minimum of 5 questions to activate matching.

**Example flow for a "Looking for Roommate" post:**

The poster sees a question library like:

| Question | Options |
|----------|---------|
| What age range are you? | 18–24, 25–30, 31–40, 40+ |
| What's your gender? | Male, Female, Non-binary, No preference |
| Do you smoke? | Yes, No, Occasionally |
| What's your sleep schedule? | Early bird (before 10pm), Night owl (after midnight), Flexible |
| How clean are you? | Very clean, Moderately clean, Relaxed about it |
| Do you have pets? | Yes – dog, Yes – cat, Yes – other, No |
| Are you okay with guests? | Frequently, Occasionally, Rarely, Never |
| What's your work situation? | Work from home, Office job, Student, Hybrid |
| How do you handle bills? | Split 50/50, Proportional to income, Take turns |
| Do you cook at home? | Daily, A few times a week, Rarely |
| Do you drink alcohol? | Yes, No, Socially |
| Are you religious? | Yes – practicing, Spiritual, Not religious, Prefer not to say |
| What's your noise tolerance? | Quiet environment, Moderate noise is fine, I'm loud too |
| How long are you looking to stay? | 1–3 months, 3–6 months, 6–12 months, 1 year+ |

The poster selects at least 5 of these. For each selected question, they also **pick their own preferred answer** — this becomes their "ideal match" profile. For example, if the poster selects "Do you smoke?" and picks "No," the system knows they want a non-smoker.

The poster can also mark questions as **"Dealbreakers"** — if a respondent's answer to a dealbreaker question doesn't match, the compatibility score is capped at 60% regardless of other answers.

**Post-type specific question libraries:**

- **Roommate posts:** Lifestyle, habits, schedule, cleanliness, budget expectations
- **Subscription splits:** Platform preference, payment reliability, commitment length
- **Grocery splits:** Dietary restrictions, shopping frequency, budget range, distance
- **Carpool posts:** Schedule, pickup location, music preference, conversation style, vehicle preference


### 3.2 Questions Displayed on the Post

Once published, the post shows the selected questions publicly (but NOT the poster's preferred answers). This serves as a filter — if a potential respondent sees questions like "Are you okay with pets?" and they hate pets, they know this isn't for them and don't waste anyone's time.

**What's visible on the post card/detail:**
- The post content (as today)
- A "Match Questions" section listing the questions the poster is asking
- The number of questions (e.g., "8 match questions")
- A "See Questions & Match" CTA button replacing the current "I'm Interested" button

**What's NOT visible:**
- The poster's preferred answers
- Other users' answers
- Match scores of other users


### 3.3 Interested User Answers Questions

When a user taps "See Questions & Match," they enter a **chatbot-style flow** (not a form — a conversational, one-question-at-a-time UI). Each question appears as a card with tappable option chips.

**UX flow:**

1. Brief intro screen: "Answer these questions to see how well you match with [Poster Name]'s listing."
2. Questions appear one at a time, each with tappable answer chips.
3. User taps their answer → smooth transition to next question.
4. Progress bar at top shows completion (e.g., "4 of 8").
5. After answering all questions → brief loading animation ("Calculating your match...").
6. **Match result screen** shows the compatibility percentage.

**Key rules:**
- All questions must be answered (no skipping).
- Answers are final — no going back to change (prevents gaming).
- The interested user does NOT see the poster's preferred answers.
- Free-text input is not allowed — only tappable predefined options.


### 3.4 Match Score Calculation

The system calculates compatibility as a percentage based on answer alignment.

**Scoring algorithm:**

```
For each question:
  - Exact match with poster's preferred answer: +1.0 point
  - Adjacent/compatible answer: +0.5 points (configurable per question)
  - Mismatch: 0 points
  - Dealbreaker mismatch: Score capped at 60% max

Match % = (total points earned / total possible points) × 100
```

**"Adjacent" answers** are predefined compatibility mappings. For example:
- Poster wants "Early bird" → Respondent says "Flexible" = 0.5 (compatible, not perfect)
- Poster wants "No smoking" → Respondent says "Occasionally" = 0 (hard mismatch)
- Poster wants "25–30" age → Respondent says "31–40" = 0.5 (close enough)

These mappings are configured per question in the question library (not hardcoded).

**Dealbreaker logic:**
If the poster marked a question as a dealbreaker AND the respondent's answer scores 0 on that question, the overall match is capped at 60%. This means even if everything else aligns perfectly, a single dealbreaker prevents a "high match" status.


### 3.5 Match Tiers & What Happens

| Tier | Score | What Happens |
|------|-------|-------------|
| **Low Match** | 0–59% | User sees "Low compatibility." They can still express interest but are warned. No payment prompt. The post owner sees them at the bottom of their list. |
| **Moderate Match** | 60–89% | User sees their score. Can express interest for free. Post owner sees them in the middle of their list with the score visible. |
| **High Match** | 90–100% | "Great match found!" Both parties are notified. **Payment is required from both sides to unlock the connection.** |

**High Match (90%+) — The Monetization Moment:**

When a 90%+ match occurs:
1. The **interested user** sees: "You're a 94% match! Pay ₦[X] to connect with [Poster Name]."
2. The **post owner** gets a notification: "New high match! [User Name] is a 94% match. Pay ₦[X] to connect."
3. **Both must pay** before either can see the other's contact info or message each other.
4. If only one side pays, the other gets reminded (push notification + in-app).
5. Once both pay → conversation unlocks, and they can message freely.

**Pricing (suggested, configurable):**

| Payment | Amount |
|---------|--------|
| Interested user — unlock match | ₦1,500 |
| Post owner — unlock match | ₦1,000 |
| Total platform revenue per match | ₦2,500 |

Post owners pay less because they created the listing (incentivize posting). Premium users could get a discount or N free match unlocks per month.


### 3.6 Post Owner's Dashboard — Match Management

The post owner sees a **Match Dashboard** for their post (replaces the current thread list). It shows:

- **High Matches (90%+):** Highlighted at the top with a "Pay to Connect" CTA. Shows match %, question-by-question breakdown (after payment), and user's basic profile (name, avatar, verification badge — no contact info).
- **Moderate Matches (60–89%):** Listed below with scores. Owner can review but no payment prompt unless they choose to "Unlock" manually.
- **Low Matches (<60%):** Collapsed section at the bottom. Visible but de-emphasized.

The dashboard does NOT show:
- Any messaging interface (no threads until after match payment)
- The respondent's exact answers (until after payment)
- Contact information

After payment from both sides, the owner sees the respondent's full answer breakdown and can start messaging.


### 3.7 What About the Current Thread/Messaging System?

**It doesn't go away — it moves behind the paywall.**

- Before payment: No messaging. Only match score and basic profile visible.
- After both parties pay: A conversation is created (using the existing Conversation entity), and they can message freely (using the existing Message system).
- The existing InterestThread entity evolves to track the match flow instead of open conversation.

This means we keep the existing messaging infrastructure, chat UI, notifications, read receipts, image/voice messages — all of it. We just gate the entry point behind the match + payment flow.


## 4. Data Model Changes

### 4.1 New/Modified Entities

**MatchQuestion** (replaces/extends ScreeningQuestion):
```
id: UUID
category: 'roommate' | 'place' | 'carpool' | 'grocery' | 'subscription'
question: string
options: JSON  // Array of { value: string, label: string }
adjacencyMap: JSON  // { "option_a": { "option_b": 0.5, "option_c": 0 } }
isActive: boolean
order: number
```

**PostMatchConfig** (new — links a post to its selected questions):
```
id: UUID
postId: UUID (FK → Post)
questionId: UUID (FK → MatchQuestion)
preferredAnswer: string  // The poster's ideal answer value
isDealbreaker: boolean
order: number
```

**MatchResponse** (new — stores a respondent's answers):
```
id: UUID
postId: UUID (FK → Post)
respondentId: UUID (FK → User)
questionId: UUID (FK → MatchQuestion)
answer: string  // The selected option value
score: float  // 0, 0.5, or 1.0 for this question
createdAt: timestamp
```

**MatchResult** (new — stores computed match scores):
```
id: UUID
postId: UUID (FK → Post)
respondentId: UUID (FK → User)
postOwnerId: UUID (FK → User)
matchPercentage: float  // 0–100
hasDealbreaker: boolean
totalQuestions: number
matchedQuestions: number  // Full matches
partialQuestions: number  // Adjacent matches
respondentPaidAt: timestamp (nullable)
ownerPaidAt: timestamp (nullable)
conversationId: UUID (nullable, FK → Conversation)
status: 'pending' | 'unlocked' | 'expired'
createdAt: timestamp
unlockedAt: timestamp (nullable)
```

**InterestThread modifications:**
- Add `matchResultId: UUID` (FK → MatchResult)
- Status enum adds: `pending_match_payment`
- Deprecate `screeningCompletedAt`, `screeningAnswers` relation (keep for migration)

**Payment entity:**
- Add payment type: `'match_unlock'`
- `referenceId` stores `matchResultId`


### 4.2 Migration Strategy

The existing screening system stays in the database but is no longer used for new posts. Old posts with active threads continue to work as-is. New posts use the match system exclusively. A feature flag (`useMatchSystem: boolean` on Post) controls which flow applies.


## 5. API Changes (Backend)

### 5.1 New Endpoints

```
GET    /match-questions?category=roommate         — List available questions by category
POST   /posts/:postId/match-config                — Save poster's selected questions + preferred answers
GET    /posts/:postId/match-config                — Get match questions for a post (public, no answers)
GET    /posts/:postId/match-config/full            — Get full config including preferred answers (owner only)
POST   /posts/:postId/match                        — Submit respondent's answers, get match score
GET    /posts/:postId/matches                      — List all match results for a post (owner only)
GET    /posts/:postId/matches/:matchId             — Get match detail (participants only)
POST   /posts/:postId/matches/:matchId/unlock      — Pay to unlock a match (either party)
```

### 5.2 Modified Endpoints

```
POST   /posts                                      — Add match config step to post creation
POST   /interest-threads/posts/:postId/interest     — Deprecate for new match-flow posts
GET    /posts/:postId                               — Include match questions in post detail response
```


## 6. Frontend Changes (Web)

### 6.1 Post Creation Flow

**Step added after content:** "Set Your Match Questions"
- Show categorized question library as a selectable list
- Each question expandable to show/select preferred answer
- Toggle for dealbreaker per question
- Minimum 5 questions required to publish
- Drag to reorder priority

### 6.2 Post Detail Page

**New section:** "Match Questions" card below post content
- Lists questions the poster is asking (not answers)
- Shows question count
- CTA: "Answer & See Your Match" (replaces "I'm Interested")

### 6.3 Match Flow (New Page/Modal)

**Route:** `/post/[id]/match`
- Chatbot-style one-question-at-a-time UI
- Tappable answer chips (not form fields)
- Progress bar
- Animated transitions between questions
- Result screen with match percentage (animated counter)
- Payment CTA for 90%+ matches

### 6.4 Match Dashboard (New Page)

**Route:** `/post/[id]/matches` (replaces `/interest-threads/posts/:postId`)
- Segmented by tier: High / Moderate / Low
- Each match card shows: avatar, name, %, verification status
- "Unlock" button on 90%+ matches
- After unlock: answer breakdown + "Start Chat" button

### 6.5 My Matches Page

**Route:** `/my-matches` (replaces/supplements `/my-interests`)
- Shows all posts user has matched on
- Status: Awaiting payment, Unlocked, Expired
- Quick actions: Pay, View, Chat


## 7. Match Expiry & Edge Cases

- **Match results expire after 7 days** if neither party pays. After expiry, the respondent can re-answer (answers may have changed).
- **Post owner can manually unlock** a moderate match (60–89%) by paying from their side. The respondent still needs to pay from theirs.
- **Multi-spot posts** (carpool, subscription, grocery): Multiple users can match. Each match is independent. Spots decrement as matches unlock.
- **Post edits:** If the poster changes their questions after people have answered, existing match scores are invalidated and respondents are notified to re-answer.
- **Premium users:** Get 2 free match unlocks per month. After that, standard pricing applies.
- **Refund policy:** If the other party doesn't pay within 7 days of your payment, you get a full refund.


## 8. Metrics & Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Revenue per post | ~₦0 (most skip payments) | ₦2,500+ per matched pair |
| Match quality (user satisfaction) | Untracked | >80% positive rating |
| Time to match | Days (manual back-and-forth) | Hours (automated scoring) |
| User retention (post-match) | Low (leave platform after contact exchange) | Higher (payment creates commitment) |
| Interest-to-match conversion | Low (many threads, few matches) | Higher (structured, quality-first) |


## 9. Rollout Plan

**Phase 1 — Backend Foundation (Week 1–2):**
- Create MatchQuestion, PostMatchConfig, MatchResponse, MatchResult entities
- Seed question library for all post categories
- Build match scoring engine
- Build match API endpoints
- Payment integration for `match_unlock` type

**Phase 2 — Web Frontend (Week 3–4):**
- Post creation: question selection step
- Post detail: match questions display
- Chatbot-style answer flow
- Match result screen with payment
- Match dashboard for post owners

**Phase 3 — Migration & Launch (Week 5):**
- Feature flag rollout (new posts only)
- Monitor metrics
- Iterate on question library based on usage

**Phase 4 — Mobile (Week 6–7):**
- Port web changes to React Native
- Match flow optimized for mobile (swipe-style answers)

**Phase 5 — Optimization (Ongoing):**
- ML-based adjacency scoring (learn which answer combinations lead to successful matches)
- Question recommendation engine (suggest questions based on post type and content)
- Dynamic pricing based on match quality and demand
