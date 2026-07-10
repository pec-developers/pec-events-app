terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

locals {
  is_prod = var.environment == "prod"
  # If branching is enabled, dev/staging environments use a branch. If disabled, they use a separate project.
  use_branch  = !local.is_prod && var.use_branching
  project_ref = local.use_branch ? supabase_branch.main[0].database.id : supabase_project.main[0].id
}

resource "supabase_project" "main" {
  count             = local.use_branch ? 0 : 1
  organization_id   = var.supabase_organization_id
  name              = var.use_branching ? "launchpad-lms" : "launchpad-${var.environment}"
  database_password = var.db_password
  region            = var.region

  # Prevent database password changes from triggering replacement of the project in production
  lifecycle {
    ignore_changes = [database_password]
  }
}

resource "supabase_branch" "main" {
  count              = local.use_branch ? 1 : 0
  parent_project_ref = var.supabase_project_ref
  git_branch         = var.environment
  region             = var.region

  lifecycle {
    precondition {
      condition     = !local.use_branch || (var.supabase_project_ref != "" && var.supabase_project_ref != null)
      error_message = "The variable 'supabase_project_ref' must be provided to create a development branch. Please ensure you have set the parent project ref."
    }
  }
}
