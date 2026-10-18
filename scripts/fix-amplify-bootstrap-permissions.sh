#!/usr/bin/env bash
# Run in AWS CloudShell while signed into the account that owns the failing build.
set -euo pipefail

expected_account='073653171576'
role_name='AemiliaControlPlaneLambda-CodeBuildRole-1PJH7JZRIQRPI'
actual_account="$(aws sts get-caller-identity --query Account --output text)"
if [[ "$actual_account" != "$expected_account" ]]; then
  printf 'Wrong AWS account: %s. Sign into %s and retry. No changes made.\n' "$actual_account" "$expected_account" >&2
  exit 1
fi

aws iam get-role --role-name "$role_name" --query Role.Arn --output text
aws iam put-role-policy \
  --role-name "$role_name" \
  --policy-name ClassLineReadCdkBootstrapVersion \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Sid":"ReadCdkBootstrapVersion","Effect":"Allow","Action":"ssm:GetParameter","Resource":"arn:aws:ssm:us-east-1:073653171576:parameter/cdk-bootstrap/hnb659fds/version"}]}'

aws iam get-role-policy \
  --role-name "$role_name" \
  --policy-name ClassLineReadCdkBootstrapVersion \
  --query PolicyDocument --output json
printf '\nPermission saved. Retry the failed Amplify build after IAM propagation.\n'
