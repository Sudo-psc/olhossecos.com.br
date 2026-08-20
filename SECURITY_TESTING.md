# Security Testing Guide

Quick reference for testing security implementations after deployment.

## 🚀 Post-Deployment Security Tests

### 1. Security Headers Test

**Online Tool**: https://securityheaders.com

**Expected Grade**: **A+**

**Expected Headers**:

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.sanity.io ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 2. Browser DevTools Check

Open your deployed site and check the Console:

```javascript
// Should see NO errors like:
❌ "Refused to load the script because it violates the CSP directive"
❌ "Mixed Content: The page was loaded over HTTPS, but requested an insecure..."
❌ "Cross-Origin Request Blocked..."

// You SHOULD see (if CSP is working):
✅ All resources loading successfully
✅ No security warnings
```

### 3. Manual Security Tests

#### Test 1: XSS Protection

Try accessing:

```
https://olhossecos.com.br/blog?search=<script>alert('XSS')</script>
```

**Expected**: Script should NOT execute (should be escaped or blocked by CSP)

#### Test 2: Clickjacking Protection

Try embedding the site in an iframe:

```html
<iframe src="https://olhossecos.com.br"></iframe>
```

**Expected**: Should be blocked by `X-Frame-Options: DENY`

#### Test 3: HTTPS Enforcement

Try accessing:

```
http://olhossecos.com.br
```

**Expected**: Should redirect to `https://olhossecos.com.br`

#### Test 4: Image Domain Restriction

Check that only images from whitelisted domains load:

- ✅ Images from `cdn.sanity.io` → Should load
- ✅ Images from `olhossecos.com.br` → Should load
- ❌ Images from random domains → Should be blocked

### 4. NPM Audit Check

Run locally before each deployment:

```bash
npm audit

# Expected output:
# found 0 vulnerabilities
```

### 5. SSL/TLS Test

**Online Tool**: https://www.ssllabs.com/ssltest/

**Expected Grade**: **A** or **A+**

**Check for**:

- ✅ TLS 1.2 or 1.3 only
- ✅ Strong cipher suites
- ✅ HSTS enabled
- ✅ Certificate valid and trusted

### 6. CSP Validator

**Online Tool**: https://csp-evaluator.withgoogle.com/

Paste your CSP policy and check for:

- ✅ No high-risk directives
- ✅ 'unsafe-inline' only where necessary
- ✅ 'unsafe-eval' NOT present

### 7. Performance Impact Check

Security headers should have minimal performance impact.

**Tool**: Chrome DevTools → Lighthouse

**Before Security Headers**: Baseline
**After Security Headers**: Should be within 1-2 points

### 8. Response Header Verification

Using curl to check headers:

```bash
curl -I https://olhossecos.com.br

# Should include:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 🐛 Troubleshooting

### Problem: CSP Blocking Legitimate Resources

**Symptom**: Browser console shows CSP violations

```
Refused to load the script 'https://example.com/script.js' because it violates the CSP directive
```

**Solution**: Update CSP in [src/middleware.ts](src/middleware.ts) to include the legitimate source:

```typescript
"script-src 'self' 'unsafe-inline' https://cdn.sanity.io https://trusted-domain.com";
```

### Problem: Images Not Loading

**Symptom**: Images from Sanity or WordPress not displaying

**Solution 1**: Check image configuration in [astro.config.mjs](astro.config.mjs)

```typescript
domains: ["olhossecos.com.br", "cdn.sanity.io"];
```

**Solution 2**: Verify CSP allows image loading:

```typescript
"img-src 'self' data: https: blob:";
```

### Problem: HSTS Too Strict

**Symptom**: Can't test on localhost or HTTP environments

**Solution**: HSTS is only enabled in production

```typescript
if (import.meta.env.PROD) {
  response.headers.set("Strict-Transport-Security", "...");
}
```

### Problem: Third-Party Scripts Blocked

**Symptom**: Google Analytics, tracking scripts not working

**Solution**: Add trusted domains to CSP:

```typescript
"script-src 'self' 'unsafe-inline' https://cdn.sanity.io https://*.googletagmanager.com";
"connect-src 'self' https://olhossecos.com https://cdn.sanity.io https://*.google-analytics.com";
```

## ✅ Security Checklist

Use this checklist after each deployment:

- [ ] `npm audit` shows 0 vulnerabilities
- [ ] Security headers test shows **A** or **A+** grade
- [ ] No CSP violations in browser console
- [ ] All images load correctly
- [ ] Site redirects HTTP to HTTPS
- [ ] SSL Labs test shows **A** or **A+**
- [ ] No mixed content warnings
- [ ] Forms submit successfully
- [ ] External integrations (Sanity, Analytics) work
- [ ] Mobile site works correctly
- [ ] Performance score unchanged (±2 points)

## 🔧 Quick Fixes

### Add New Trusted Domain

**File**: `src/middleware.ts`

```typescript
// In CSP directives array, add to appropriate directive:
"script-src 'self' 'unsafe-inline' https://cdn.sanity.io https://new-trusted-domain.com";
```

### Allow New Image Source

**File**: `astro.config.mjs`

```typescript
image: {
    domains: ['olhossecos.com.br', 'cdn.sanity.io', 'new-image-domain.com'],
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'new-image-domain.com',
        }
    ]
}
```

### Disable HSTS Temporarily (Development Only)

**File**: `src/middleware.ts`

```typescript
// Comment out or change condition:
if (false) {
  // Disabled for testing
  response.headers.set("Strict-Transport-Security", "...");
}
```

## 📊 Expected Test Results Summary

| Test             | Tool                         | Expected Result         |
| ---------------- | ---------------------------- | ----------------------- |
| Security Headers | securityheaders.com          | A+                      |
| SSL/TLS          | ssllabs.com                  | A or A+                 |
| Dependency Audit | `npm audit`                  | 0 vulnerabilities       |
| CSP Policy       | csp-evaluator.withgoogle.com | No high-risk issues     |
| Performance      | Lighthouse                   | 90+ (minimal impact)    |
| XSS Protection   | Manual testing               | Scripts blocked/escaped |
| Clickjacking     | Manual iframe test           | Blocked                 |
| HTTPS Redirect   | Manual HTTP access           | Redirects to HTTPS      |

---

**Last Updated**: 2025-12-27
**Next Review**: Monthly with security maintenance
