terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  cloud {
    organization = "pecdevelopers"

    workspaces {
      tags = ["pec-events-app-metadata"]
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Create AppRegistry application representing the unified myApplication
resource "aws_servicecatalogappregistry_application" "app" {
  name        = "pec-events-app-${var.environment}"
  description = "${title(var.environment)} environment resources for ${var.project_name}"
}

resource "aws_servicecatalogappregistry_attribute_group" "metadata" {
  name        = "pec-events-app-${var.environment}-metadata"
  description = "Metadata attribute group for billing and project owners"
  attributes = jsonencode({
    Environment = var.environment
    Project     = var.project_name
    Owner       = var.owner
  })
}

resource "aws_servicecatalogappregistry_attribute_group_association" "assoc" {
  application_id     = aws_servicecatalogappregistry_application.app.id
  attribute_group_id = aws_servicecatalogappregistry_attribute_group.metadata.id
}
