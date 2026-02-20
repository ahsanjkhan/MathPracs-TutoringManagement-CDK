#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MathPracsTutoringManagementCdkStack } from '../lib/math_pracs-tutoring_management-cdk-stack';

const app = new cdk.App();
new MathPracsTutoringManagementCdkStack(app, 'MathPracsTutoringManagementCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
