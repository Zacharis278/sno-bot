variable "aws_region" {
  type = "string"
}

variable "env" {
  type = "string"
}

variable "resource_prefix" {
  type = "string"
}

variable "lambda_env_config" {
  type = "map"
}

variable "slack_token" {
  type = "string"
}

variable "rest_api_title" {
  type = "string"
}

provider "aws" {
  region = "${var.aws_region}"
}

data "aws_caller_identity" "current" {}

terraform {
  backend "s3" { }
}