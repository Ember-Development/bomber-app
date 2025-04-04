# instance related vars
variable "region" {
    type = string
    default="us-east-1"
}
variable "instance_type" {
    type = string
    default = "t3.micro"
}
variable "instance_name" {
    type = string
    default = "Bomber App"
}
variable "dev_ips" {
    type = list(string)
}

# misc
variable "environment" {
    type = string
    default = "prod"
}
