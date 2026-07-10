terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    resend = {
      source  = "jhoward321/resend"
      version = "~> 0.1"
    }
  }
}

locals {
  is_prod = var.environment == "prod"

  # Auto-derive backend URL if not explicitly provided
  derived_site_url = var.site_url != "" ? var.site_url : (
    local.is_prod ? "https://api.${var.domain_name}" : "https://api.${var.environment}.${var.domain_name}"
  )

  # Construct additional redirect URLs based on environment
  additional_redirect_urls = local.is_prod ? [
    "https://api.${var.domain_name}"
    ] : [
    "http://localhost:8080",
    "https://api.${var.environment}.${var.domain_name}"
  ]
}

resource "resend_domain" "main" {
  name = var.domain_name
}


resource "supabase_settings" "main" {
  project_ref = var.project_ref

  # Configure authentication settings (e.g. redirect URL, OTP settings, rates limit, custom SMTP)
  auth = jsonencode({
    site_url                            = local.derived_site_url
    additional_redirect_urls            = local.additional_redirect_urls
    mailer_otp_exp                      = 3600
    mailer_otp_length                   = 6
    mailer_signup_enabled               = var.enable_email_otp
    mailer_autoconfirm                  = var.enable_email_otp
    rate_limit_email_sent               = 1000
    rate_limit_sms_sent                 = 1000
    rate_limit_otp                      = 100
    rate_limit_verify                   = 100
    rate_limit_token_refresh            = 500
    rate_limit_anonymous_users          = 100
    mailer_subjects_magic_link          = "Confirm Your Login - ${var.smtp_sender_name}"
    mailer_templates_magic_link_content = var.magic_link_template_content
    sms_enabled                         = var.enable_mobile_otp
    smtp_host                           = "smtp.resend.com"
    smtp_port                           = "587"
    smtp_user                           = "resend"
    smtp_pass                           = var.smtp_pass
    smtp_sender_name                    = var.smtp_sender_name
    smtp_admin_email                    = var.smtp_admin_email
    smtp_max_frequency                  = 1
  })

  # Configure API gateway settings (can be customized if needed)
  api = jsonencode({
    db_schema            = "public,storage,graphql_public"
    db_extra_search_path = "public,extensions"
    max_rows             = 1000
  })
}
