### What Is This

This is the Infrastructure-as-Code for the MathPracs Tutoring Management API - a FastAPI-based serverless application that manages tutoring sessions, students, and integrates with Google APIs, Dropbox, and Discord.

### How Does It Work

This CDK stack creates:

1. **AWS CodePipeline** - Auto-deploys on merge or push into `main`
2. **AWS Lambda Function** - FastAPI application with Mangum adapter
3. **AWS API Gateway** - REST API with proxy integration
4. **AWS DynamoDB Tables** - Sessions, CalendarListState, TutorsV2, TutorsMetadataV2, StudentsV2, StudentsMetadataV2, Transactions
5. **AWS Secrets Manager** - Google, Dropbox, Discord, and Groq API credentials
6. **AWS SSM Parameter Store** - Google Drive parent folder ID, Dropbox parent folder path
7. **AWS EventBridge Rule** - Triggers session sync every 3 minutes

### What Are The Components

AWS CodePipeline, AWS Lambda, AWS API Gateway, AWS DynamoDB, AWS Secrets Manager, AWS SSM Parameter Store, AWS EventBridge, Google API, Dropbox API, Discord API, Groq API.

### How To Deploy

Raising a Pull Request for commits on a feature branch, getting it approved, and squashing and merging into `main` on either this repo or [MathPracs-TutoringManagement-API](https://github.com/ahsanjkhan/MathPracs-TutoringManagement-API) automatically triggers the CodePipeline, which runs CDK synth and deploys the stack.

#### First-Time Setup

1. **Install Node.js** (version 20), **AWS CLI**, and **Finch** (`brew install finch && finch vm init && finch vm start`)
2. **Bootstrap CDK:** `npx cdk bootstrap`
3. **Deploy the pipeline stack:**
   ```bash
   npm install
   CDK_DOCKER=finch npx cdk deploy MathPracsTutoringManagementPipelineStack
   ```

After this, all future changes are deployed automatically via the pipeline.

#### Manual Deployments (Avoid if possible)
1. Make changes on feature branch.
2. Commit those changes and raise Pull Request as usual.
3. Deploy the changes directly:
   ```bash
   CDK_DOCKER=finch npx cdk deploy MathPracsTutoringManagementCdkStack
   ```


#### Update Secrets

After deployment, update the AWS Secrets Manager secrets with your API credentials using either the CLI (sample shown below) or through the AWS Console:

```bash
# Google credentials
aws secretsmanager update-secret --secret-id tutoring-api/google-credentials-cdk --secret-string file://path/to/google-credentials.json

# Dropbox credentials  
aws secretsmanager update-secret --secret-id tutoring-api/dropbox-credentials-cdk --secret-string '{"access_token":"your_token"}'

# Discord credentials
aws secretsmanager update-secret --secret-id tutoring-api/discord-credentials-cdk --secret-string '{"bot_token":"your_token"}'

# Groq credentials
aws secretsmanager update-secret --secret-id tutoring-api/groq-credentials-cdk --secret-string '{"api_key":"your_key"}'
```

#### Access the API

After deployment, CRUD commands can be run through the Discord Server.

### Useful Commands

- `CDK_DOCKER=finch npx cdk diff` - Compare deployed stack with current state
- `CDK_DOCKER=finch npx cdk synth` - Emit the synthesized CloudFormation template
- `CDK_DOCKER=finch npx cdk deploy` - Deploy with Finch Docker support
- `CDK_DOCKER=finch npx cdk destroy` - Destroy the stack # DANGEROUS!!
- `finch vm status` - See Finch VM Status
- `finch vm stop` - Stop Finch VM

### Stack Dependencies

This stack exports resources consumed by other stacks:
- **MathPracsPaymentRemindersCDK**: Sessions, StudentsV2, StudentsMetadataV2, TutorsV2, TutorsMetadataV2, Transactions DynamoDB Tables, Discord API Secrets
- **MathPracsSessionRemindersCDK**: Sessions, Students, StudentsV2, StudentsMetadataV2 DynamoDB Tables

### EventBridge Automation

The stack includes an EventBridge rule that automatically triggers `/sync/sessions` every 3 minutes to keep tutoring data synchronized with Google Calendar.