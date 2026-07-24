resource "aws_ecr_repository" "frontend" {
  name                 = "shopping_store_frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}