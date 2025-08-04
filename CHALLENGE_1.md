# Challenge 1: Perform a CSRF attack and then implement protections against it using `Sec-Fetch-*` headers

## Objective
Implement a server-side check to prevent CSRF attacks using the `Sec-Fetch-Site` header.

---

## Attack Scenario

1. **Simulate a CSRF Attack**:
   - Use the provided files [`attack-csrf-cors.html`](./attacks/attack-csrf-cors.html) and [`attack-csrf-img.html`](./attacks/attack-csrf-img.html) to simulate CSRF attacks.
     - Both files are available in the [`attacks`](./attacks/)  folder and demonstrate different types of CSRF attacks.
   - Verify the attack success:
     - A successful attack allows the attacker to register a guest on behalf of the user without their consent.
     - In the Las Vegas Nightlife App, check the VIP guest list to confirm if a new guest was added without user interaction.

---

## Protection Steps

### Step 1: Modify Backend Logic

Add a server-side check for the `Sec-Fetch-Site` header to validate legitimate requests and reject unauthorized cross-origin requests.

**Solution**:
```javascript
// Protect API endpoints from CSRF
app.use('/api', (req, res, next) => {
    const fetchSite = req.headers['sec-fetch-site'];
    if (fetchSite && fetchSite !== 'same-origin') {
        console.warn(`CSRF attempt detected: Fetch-Site=${fetchSite}, Origin=${req.headers.origin || 'Unknown'}, IP=${req.ip}`);
        return res.status(403).json({ message: 'Forbidden: Invalid fetch origin!' });
    }
    next();
});
```

### Step 2: Retest the CSRF Attacks

1. Repeat the CSRF attacks using [`attack-csrf-cors.html`](./attacks/attack-csrf-cors.html) and [`attack-csrf-img.html`](./attacks/attack-csrf-img.html).
2. Verify that:
   - The server rejects unauthorized requests with a 403 status.
   - The VIP guest list remains unchanged, confirming the attack was unsuccessful.

---

## Discussion

### Scaling This Approach
1. **Real-World Implementation**:
   - Consider where the `Sec-Fetch-Site` check should be implemented for scalability:
     - **Application Code**: Allows granular and customizable protection at the API level.
     - **Nginx or API Gateway**: Centralized control for handling multiple applications, reducing overhead for individual services.

2. **Advantages and Trade-offs**:
   - **Application Code**:
     - Granular control over specific APIs.
     - Easier to customize based on application logic.
   - **Nginx/API Gateway**:
     - Simplified management for large-scale systems.
     - Reduces repetitive implementation in multiple services.

---

## Further Resources
- [Protect your resources from web attacks with Fetch Metadata](https://web.dev/articles/fetch-metadata)
- [MDN Web Dev - Sec-Fetch-Site](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site)