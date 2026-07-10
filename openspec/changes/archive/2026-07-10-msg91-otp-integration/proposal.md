## Why

Currently, the project uses Twilio as the default SMS OTP provider. Twilio's international rate model is significantly more expensive for local target users (e.g. in India) compared to domestic providers. MSG91 offers a far more cost-effective alternative for local OTP dispatch, alongside compliant message delivery options conforming to local TRAI DLT regulations. By integrating MSG91 with Supabase Auth, we optimize the project's operating budget and guarantee higher SMS delivery success rates.

## What Changes

This change replaces the native Twilio SMS integration in Supabase Auth with a custom HTTP Send SMS Auth Hook that redirects OTP requests to a dedicated Deno Edge Function. This Edge Function formats the payload and triggers the MSG91 v5 OTP API.

Specific adjustments include:
- Disabling the native Twilio configuration in `config.toml`.
- Enabling the `[auth.hook.send_sms]` hook in `config.toml` pointing to the Edge Function.
- Creating a Deno Edge Function at `deployments/supabase/functions/send-sms/index.ts` to forward SMS payloads to MSG91.
- Removing Twilio secrets and setting MSG91 secrets (`MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`) in `.env` files and GitHub CI/CD workflows.

## Capabilities

### New Capabilities
- `msg91-otp-integration`: Implements SMS OTP delivery via a custom Send SMS hook integrated with the MSG91 v5 OTP API.

### Modified Capabilities
*None*

## Impact

- **Supabase Auth Hook**: Native SMS is bypassed; authentication lifecycle is hooked into the newly introduced Deno Edge Function.
- **Workflow & Environment Secrets**: Replacing Twilio credentials with MSG91 credentials in the Local Emulator env file (`deployments/supabase/.env`) and GitHub actions pipeline (`.github/workflows/infra-deploy.yml`).
