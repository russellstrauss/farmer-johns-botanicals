# Legacy REST API Usage Investigation Report

## Executive Summary
Investigation completed to determine what (if anything) is actively using the WooCommerce Legacy REST API.

## Findings

### 1. Legacy REST API Status
- **Plugin Status**: Active (woocommerce-legacy-rest-api v1.0.5)
- **Setting**: Enabled (`woocommerce_api_enabled = 'yes'`)
- **Webhooks**: 0 legacy webhooks found
- **Reason for Installation**: Auto-installed because Legacy REST API setting was enabled

### 2. Payment Gateway Usage

#### PayPal Gateway (ENABLED)
- **Status**: Enabled and active
- **Uses Legacy API**: YES
- **Endpoint**: `/wc-api/WC_Gateway_Paypal`
- **Purpose**: IPN (Instant Payment Notification) callbacks from PayPal
- **Function**: `WC()->api_request_url('WC_Gateway_Paypal')` in `class-wc-gateway-paypal-request.php:83`
- **Impact**: **CRITICAL** - PayPal IPN callbacks require this endpoint to process payments

**Details:**
- PayPal gateway uses `WC()->api_request_url()` which generates legacy API URLs
- This is used for PayPal's IPN (Instant Payment Notification) system
- Without this, PayPal payment confirmations will fail

### 3. API Keys
- **Result**: No WooCommerce API keys found in user meta
- **Conclusion**: No external services are using API authentication to access the Legacy REST API

### 4. Custom Code
- **Theme Files**: No references to `wc-api` endpoints found
- **Plugin Files**: Only references found are in the Legacy REST API plugin itself (expected)
- **Conclusion**: No custom integrations are using the Legacy REST API

### 5. Webhooks
- **Legacy Webhooks**: 0 found
- **Conclusion**: No webhooks are using the Legacy REST API

### 6. Server Logs
- **Access Logs**: Unable to access (Docker container limitations)
- **Error Logs**: No debug.log file found
- **Note**: Would need to check Apache access logs manually to see actual usage patterns

## Summary

### What IS Using the Legacy REST API:
1. **PayPal Gateway** - Uses `/wc-api/WC_Gateway_Paypal` for IPN callbacks
   - This is REQUIRED for PayPal payments to work
   - PayPal sends payment confirmations to this endpoint

### What is NOT Using the Legacy REST API:
- No API keys configured
- No webhooks configured
- No custom code integrations
- No theme integrations
- No external services (other than PayPal IPN)

## Recommendations

### Option 1: Keep Legacy REST API (Recommended for now)
**Pros:**
- PayPal payments will continue to work
- No immediate action required

**Cons:**
- Cannot use High-Performance Order Storage (HPOS)
- Legacy API is deprecated and will eventually be removed
- Security concerns with older API

### Option 2: Migrate PayPal to Modern API (Future)
**Action Required:**
1. Update PayPal gateway to use modern REST API endpoints
2. Test PayPal IPN functionality thoroughly
3. Monitor PayPal payment processing after migration
4. Then disable Legacy REST API

**Note**: The PayPal gateway in WooCommerce 10.4.3 may have been updated to use modern endpoints. Check if newer versions support modern REST API for IPN callbacks.

### Option 3: Disable Legacy REST API (NOT RECOMMENDED)
**Warning**: This will break PayPal payment processing
- PayPal IPN callbacks will fail
- Orders will not be automatically confirmed
- Manual order processing required

## Next Steps

1. **Immediate**: Keep Legacy REST API enabled (required for PayPal)
2. **Short-term**: Check if WooCommerce 10.4.3 PayPal gateway supports modern REST API
3. **Long-term**: Plan migration strategy when PayPal gateway fully supports modern API
4. **Monitor**: Watch for any errors related to PayPal IPN callbacks

## Technical Details

### PayPal IPN Endpoint
- **URL Pattern**: `http://yoursite.com/wc-api/WC_Gateway_Paypal`
- **Method**: POST
- **Purpose**: PayPal sends payment confirmations here
- **Critical**: Required for automatic order status updates

### Legacy API Endpoint Structure
- Base: `/wc-api/`
- Version: v1, v2, or v3
- Example: `/wc-api/v3/orders`

### Modern API Endpoint Structure
- Base: `/wp-json/wc/v3/`
- Example: `/wp-json/wc/v3/orders`

---

**Report Generated**: Investigation completed
**Investigator**: AI Assistant
**Date**: Current session

