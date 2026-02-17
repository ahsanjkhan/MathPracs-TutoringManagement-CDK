# MathPracs Tutoring Management CDK

This CDK stack creates the infrastructure for the MathPracs Tutoring Management API, which integrates with the existing Payment Reminders system.

## Architecture

This stack imports resources from the existing `MathPracsPaymentRemindersStack` using CloudFormation cross-stack references:

- **DynamoDB Tables**: Student and Tutor payment tables (read/write access)
- **Secrets Manager**: API credentials for Google Sheets, Calendar, and Twilio
- **Lambda Functions**: Payment reminder functions (invoke permissions)

## Resources Created

- **API Gateway**: REST API for tutoring management
- **Lambda Function**: API handlers with permissions to access payment system resources
- **IAM Roles**: Cross-service permissions

## Prerequisites

1. **Deploy Payment Reminders Stack First**: This stack depends on exports from `MathPracsPaymentRemindersStack`
2. **Node.js 20+**
3. **AWS CLI configured**

## Deployment

```bash
# Install dependencies
npm install

# Deploy (after payment reminders stack is deployed)
npx cdk deploy

# View differences
npx cdk diff
```

## Cross-Stack Integration

The stack uses these imported values:
- `MathPracs-StudentPaymentTable-Arn`
- `MathPracs-TutorPaymentTable-Arn` 
- `MathPracs-ApiSecrets-Arn`
- `MathPracs-StudentPaymentLambda-Arn`
- `MathPracs-TutorPaymentLambda-Arn`

## API Permissions

The Tutoring Management API Lambda has:
- **Read/Write** access to payment DynamoDB tables
- **Read** access to API secrets
- **Invoke** permissions for payment reminder lambdas