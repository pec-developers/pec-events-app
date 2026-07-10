variable "aws_region" {
  description = "The AWS region to deploy resources into"
  type        = string
  default     = "ap-south-1"
}

variable "root_domain_name" {
  description = "The root domain name (e.g., events.pecdevelopers.com)"
  type        = string
  default     = "events.pecdevelopers.com"
}

variable "dns_zone_name" {
  description = "The hosted zone name in Route 53"
  type        = string
  default     = "pecdevelopers.com"
}

variable "ami_id" {
  description = "The AMI ID for the backend EC2 host (Ubuntu)"
  type        = string
  default     = "ami-0b40571b9c2387b15" # Ubuntu Server 26.04 LTS ARM64 AMI
}



variable "supabase_organization_id" {
  description = "The ID of the Supabase organization where the project is managed."
  type        = string
}

variable "use_branching" {
  description = "Whether to use database branching for non-prod environments."
  type        = bool
  default     = false
}

variable "supabase_project_ref" {
  description = "The Project Ref ID of the parent/production Supabase project. Required for branching."
  type        = string
  default     = ""
}

variable "smtp_pass" {
  description = "SMTP password (API key) for the email service"
  type        = string
  sensitive   = true
}

variable "enable_email_otp" {
  description = "Whether to enable Email OTP authentication"
  type        = bool
  default     = true
}

variable "enable_mobile_otp" {
  description = "Whether to enable Mobile OTP authentication"
  type        = bool
  default     = true
}

variable "supabase_access_token" {
  description = "The access token for Supabase API auth"
  type        = string
  sensitive   = true
}


