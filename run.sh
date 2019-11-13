#!/usr/bin/env bash
set -e

BACKEND_BUCKET="bucket=sno-bot-tf-state"
BRANCH="master"

workflow() {
    echo -e "\n########## Starting Workflow ##########\n"
    build
    deploy
}

build() {
    echo -e "\n########## Starting API Build ##########\n"

    mkdir -p ./.build/
    zip -r ./.build/app.zip . -x '*manifests/*'
}


deploy() {

    echo -e "\n########## Running Terraform Deployment ##########\n"

    cd manifests

    terraform init \
      -backend=true \
      -backend-config="$BACKEND_BUCKET" \
      -backend-config="key=terraform.tfstate" \
      -backend-config="region=us-east-1"

    terraform env new ${BRANCH} || true
    terraform env select ${BRANCH}

    cp -r .terraform/ ../.terraform/
    cd ../

    terraform apply \
      -var-file=manifests/variables/master.tfvars \
      -var="resource_prefix=sno" \
      -var="slack_token=${SLACK_TOKEN}" \
      -refresh=true \
      -parallelism=2 \
      manifests/
}

for ARG in "$@"; do
    echo "Running \"$ARG\""
    $ARG
done