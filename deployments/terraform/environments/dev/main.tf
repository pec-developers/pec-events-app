terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    resend = {
      source  = "jhoward321/resend"
      version = "~> 0.1"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  cloud {
    organization = "pecdevelopers"

    workspaces {
      name = "pec-events-app-dev"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "supabase" {
  access_token = var.supabase_access_token
}

provider "resend" {
  api_key = var.smtp_pass
}

# Generate secure database password locally when AWS Secrets Manager is omitted
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# # Read persistent metadata application details from metadata state
data "terraform_remote_state" "metadata" {
  backend = "remote"

  config = {
    organization = "pecdevelopers"
    workspaces = {
      name = "pec-events-app-metadata-dev"
    }
  }
}

data "aws_secretsmanager_secret" "prod_secret" {
  count = var.use_branching ? 1 : 0
  name  = "/config/pec-events-api_prod"
}

data "aws_secretsmanager_secret_version" "prod_secret_version" {
  count     = var.use_branching ? 1 : 0
  secret_id = data.aws_secretsmanager_secret.prod_secret[0].id
}

locals {
  # Dynamic domain setup for dev environment: dev.<prod_url>
  frontend_domain = "dev.${var.root_domain_name}"

  application_tag = {
    Project     = "pec-events-app"
    Environment = "dev"
    Owner       = "pec-events-admin"
  }

  prod_db_password = var.use_branching ? jsondecode(data.aws_secretsmanager_secret_version.prod_secret_version[0].secret_string)["spring.datasource.password"] : null
}

module "s3_assets" {
  source          = "../../modules/s3_assets"
  environment     = "dev"
  application_tag = local.application_tag
  allowed_origins = ["http://localhost:5173", "https://${local.frontend_domain}"]
}

module "secrets" {
  source                    = "../../modules/secrets"
  environment               = "dev"
  application_tag           = local.application_tag
  db_url                    = replace(module.database.db_url, "postgresql://", "jdbc:postgresql://")
  supabase_url              = module.database.supabase_url
  supabase_anon_key         = module.database.anon_key
  supabase_service_role_key = module.database.service_role_key
  db_password_override      = local.prod_db_password
  s3_bucket_name            = module.s3_assets.bucket_name
  s3_region                 = var.aws_region
}

module "database" {
  source                   = "../../modules/database"
  supabase_organization_id = var.supabase_organization_id
  environment              = "dev"
  region                   = "ap-south-1"
  db_password              = random_password.db_password.result
  use_branching            = var.use_branching
  supabase_project_ref     = var.supabase_project_ref
}

module "smtp" {
  source = "../../modules/smtp"

  project_ref                 = module.database.project_id
  smtp_pass                   = var.smtp_pass
  smtp_admin_email            = "no-reply@${var.root_domain_name}"
  smtp_sender_name            = "PEC Events"
  domain_name                 = var.root_domain_name
  environment                 = "dev"
  enable_email_otp            = var.enable_email_otp
  enable_mobile_otp           = var.enable_mobile_otp
  magic_link_template_content = file("${path.module}/../../../supabase/templates/magic_link.html")
}

module "backend" {
  source          = "../../modules/backend"
  environment     = "dev"
  secret_arn      = module.secrets.secret_arn
  ami_id          = var.ami_id
  instance_type   = "t4g.micro"
  aws_region      = var.aws_region
  domain_name     = local.frontend_domain # Backend resolves to api.dev.events.pecdevelopers.com
  dns_zone_name   = var.dns_zone_name
  application_tag = local.application_tag
}

module "frontend" {
  source          = "../../modules/frontend"
  domain_name     = local.frontend_domain # Frontend resolves to dev.events.pecdevelopers.com
  dns_zone_name   = var.dns_zone_name
  application_tag = local.application_tag
}
