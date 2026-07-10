variable "domain_name" {
  description = "The domain name for the frontend application (e.g., dev.events.pecdevelopers.com or events.pecdevelopers.com)"
  type        = string
}

variable "dns_zone_name" {
  description = "The Route 53 hosted zone name"
  type        = string
}

variable "application_tag" {
  description = "Tag for Service Catalog AppRegistry myApplication mapping"
  type        = map(string)
  default     = {}
}

variable "additional_domain_names" {
  description = "Additional domain names (aliases) for the frontend application"
  type        = list(string)
  default     = []
}

