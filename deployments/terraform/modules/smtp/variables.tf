variable "project_ref" {
  description = "The reference ID of the Supabase project."
  type        = string
}

variable "smtp_pass" {
  description = "SMTP password (API key) for the email service (Resend)"
  type        = string
  sensitive   = true
}

variable "smtp_admin_email" {
  description = "The sender email address for auth emails"
  type        = string
}

variable "smtp_sender_name" {
  description = "The name of the sender for SMTP emails"
  type        = string
  default     = "PEC Events"
}

variable "site_url" {
  description = "The site URL for redirect configurations"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "The root domain name of the landing page project"
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g. dev, staging, prod)"
  type        = string
}

variable "enable_email_otp" {
  description = "Toggle to enable email signup and OTP confirm"
  type        = bool
  default     = true
}

variable "enable_mobile_otp" {
  description = "Toggle to enable mobile/SMS signup and OTP login"
  type        = bool
  default     = true
}

variable "magic_link_template_content" {
  description = "The HTML template content for the magic link emails"
  type        = string
}
