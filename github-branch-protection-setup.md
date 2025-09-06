# GitHub Branch Protection Setup Guide

## Required Branch Protection Rules

To complete the automated quality tripwires implementation, configure these branch protection rules in your GitHub repository:

### Step 1: Navigate to Branch Protection
1. Go to your GitHub repository
2. Click **Settings** → **Branches**
3. Click **Add rule** or edit existing rule for `main` branch

### Step 2: Required Settings

#### Branch name pattern
```
main
```

#### Required Status Checks
☑️ **Require status checks to pass before merging**
☑️ **Require branches to be up to date before merging**

**Required status checks to add:**
- `CI / test_build_e2e`
- `Prod Smoke / smoke` (if using production monitoring)

#### Additional Protection Rules
☑️ **Require a pull request before merging**
- Required approving reviews: `1`
- ☑️ Dismiss stale reviews when new commits are pushed
- ☑️ Require review from code owners (optional)

☑️ **Require signed commits** (recommended)
☑️ **Include administrators** (applies rules to repo admins)
☑️ **Restrict pushes that create files** (optional)

#### Advanced Settings
☑️ **Allow force pushes**: **Never**
☑️ **Allow deletions**: **Never**

### Step 3: Verify Configuration

After saving, the branch protection should show:
- ✅ Direct pushes to `main` blocked
- ✅ PRs required with status checks
- ✅ CI workflow must pass: `test_build_e2e`
- ✅ All quality gates enforced

### Step 4: Test the Protection

1. Create a new branch: `git checkout -b test-protection`
2. Make a small change and push
3. Open a PR - verify status checks appear
4. Confirm PR cannot merge until checks pass

## Environment Secrets (if using smoke tests)

Add these secrets in **Settings** → **Secrets and variables** → **Actions**:

- `PRODUCTION_URL`: Your deployed app URL
- `VITE_SENTRY_DSN`: Sentry DSN (if using error tracking)

## Webhook Configuration (optional)

For deployment triggers, configure webhooks in **Settings** → **Webhooks**:
- Payload URL: Your deployment service webhook
- Content type: `application/json`
- Events: `Pull request`, `Push` to main

---

✅ **Implementation Complete**: All quality tripwires now active!