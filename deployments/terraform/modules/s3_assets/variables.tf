variable "environment" {
  description = "The target deployment environment (e.g. dev, staging, prod)"
  type        = string
}

variable "application_tag" {
  description = "Tag for Service Catalog AppRegistry myApplication mapping"
  type        = map(string)
  default     = {}
}

variable "allowed_origins" {
  description = "List of allowed origins for S3 CORS configuration"
  type        = list(string)
  default     = ["*"]
}
