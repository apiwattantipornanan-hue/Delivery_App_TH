# Cloudflare Functions

This folder keeps payment verification off the public frontend.

## Endpoint

```text
POST /api/verify-slip
```

Expected multipart form fields:

- `orderId`
- `expectedAmount`
- `promptPayId`
- `slip`

The endpoint returns one of:

- `verified` - slip passed provider checks and amount/account matching.
- `needs_manual_check` - provider was reachable, but the result needs shop review.
- `rejected` - invalid, duplicate, or obviously wrong slip.
- `manual` - API key/provider is not configured, so the shop should check manually.

## Free-first Setup

Use SlipOK first because its published OK BASIC plan is free for 100 slips/month.
After you receive the API details from SlipOK, set these Cloudflare Pages environment variables:

```text
PAYMENT_VERIFIER_PROVIDER=slipok
SLIPOK_API_KEY=your_slipok_key
SLIPOK_API_URL=your_slipok_api_url_from_slipok_api_guide
SLIPOK_BRANCH_ID=optional_branch_id
```

If SlipOK gives a different auth header, use:

```text
SLIPOK_AUTH_HEADER=Authorization
SLIPOK_AUTH_SCHEME=bearer
```

For EasySlip instead:

```text
PAYMENT_VERIFIER_PROVIDER=easyslip
EASYSLIP_API_KEY=your_easyslip_key
```

Never commit real API keys to GitHub.
