terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0"
    }
  }
}

# Generate a secure database password
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

locals {
  db_password = var.db_password_override != null && var.db_password_override != "" ? var.db_password_override : random_password.db_password.result
}

resource "aws_secretsmanager_secret" "backend_secret" {
  name                    = "/config/pec-events-api_${var.environment}"
  recovery_window_in_days = 0
  tags                    = var.application_tag
}

resource "aws_secretsmanager_secret_version" "backend_secret_version" {
  secret_id = aws_secretsmanager_secret.backend_secret.id
  secret_string = jsonencode({
    "spring.datasource.url"      = var.db_url
    "spring.datasource.username" = var.db_username
    "spring.datasource.password" = local.db_password
    "supabase.url"               = var.supabase_url
    "supabase.anon-key"          = var.supabase_anon_key
    "supabase.jwt-secret"        = var.supabase_jwt_secret
    "supabase.service-role-key"  = var.supabase_service_role_key
    "aws.s3.bucket"              = var.s3_bucket_name
    "aws.s3.region"              = var.s3_region
  })

  # Ignore subsequent updates to the secret version content to avoid overwriting manually updated secrets
  lifecycle {
    ignore_changes = [secret_string]
  }
}
