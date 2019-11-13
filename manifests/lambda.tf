
# Slack Message Lambda
resource "aws_lambda_function" "message" {
  s3_bucket = "${aws_s3_bucket_object.app.bucket}"
  s3_key = "${aws_s3_bucket_object.app.key}"
  s3_object_version = "${aws_s3_bucket_object.app.version_id}"

  function_name = "${var.resource_prefix}-message"
  handler = "src/index.handler"
  runtime = "nodejs8.10"
  role = "${aws_iam_role.lambda_execution.arn}"

  timeout = 10

  environment = {
    variables = {
      WORKER_FN = "${var.resource_prefix}-worker"
    }
  }
}

resource "aws_lambda_permission" "allow_api_gateway-message" {
  function_name = "${aws_lambda_function.message.arn}"
  statement_id = "AllowExecutionFromApiGateway"
  action = "lambda:InvokeFunction"
  principal = "apigateway.amazonaws.com"
  source_arn = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.api.id}/*/${aws_api_gateway_method.post_message.http_method}${aws_api_gateway_resource.message.path}"
}

# Worker Lambda
resource "aws_lambda_function" "worker" {
  s3_bucket = "${aws_s3_bucket_object.app.bucket}"
  s3_key = "${aws_s3_bucket_object.app.key}"
  s3_object_version = "${aws_s3_bucket_object.app.version_id}"

  function_name = "${var.resource_prefix}-worker"
  handler = "src/worker.handler"
  runtime = "nodejs8.10"
  role = "${aws_iam_role.lambda_execution.arn}"

  timeout = 60

  environment = {
    variables = {
      SLACK_TOKEN = "${var.slack_token}"
      SF_TOKEN = "${var.lambda_env_config["SF_TOKEN"]}"
    }
  }
}
