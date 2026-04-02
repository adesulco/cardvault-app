# Branding Constraint: Escrow

**Rule**: The word "escrow" MUST NEVER be used anywhere in the CardVault application, marketing materials, or UI copy.

**Context**: The team has strictly moved away from defining the platform as an "Escrow" service.

**Alternatives**:
Instead of "Escrow", use the following terminology:
- "Secure Vault Transactions"
- "Protected Payouts"
- "Strictly Monitored Holds"
- "Risk-Free Trading"
- "CardVault Protection"

When evaluating future UI updates, database strings, or component libraries for CardVault, actively purge the word "escrow".

---

# Liability Constraint: Authentication & Payouts

**Rule 1: No Authenticaton Guarantees**
The platform MUST NOT claim to authenticate, grade, or guarantee the physical validity (real vs. fake) of any cards.
- **Instead:** Focus explicitly on *Seller Verification*. We vet and strictly verify the human seller's identity and reputation, not the cardboard.

**Rule 2: Payout Mechanics**
The platform MUST clearly state its primary financial mechanic: 
- Buyer funds are held safely and **only released to the seller upon explicit confirmation from the buyer** that the package was received.
