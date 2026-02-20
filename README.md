### What Is This

This is the Infrastructure-as-Code for the MathPracs Tutoring Management API - a FastAPI-based serverless application that manages tutoring sessions, students, and integrates with Google Calendar, Dropbox, and Discord.

### Dependencies

This stack depends on the **MathPracsPaymentRemindersCDK** stack being deployed first, as it imports shared resources like DynamoDB tables and secrets.

### How Does It Work

This CDK stack creates:

1. **AWS Lambda Function** - FastAPI application with Mangum adapter
2. **AWS API Gateway** - REST API with proxy integration
3. **AWS DynamoDB Tables** - Tutors, Sessions, Students, CalendarListState
4. **AWS Secrets Manager** - Google, Dropbox, Discord, and Groq API credentials
5. **Cross-stack imports** - Payment reminder tables and secrets

### What Are The Components

AWS Lambda, AWS API Gateway, AWS DynamoDB, AWS Secrets Manager, Google Calendar API, Google Sheets API, Dropbox API, Discord API, Groq API.

### How To Deploy

### Prerequisites

1. **Have the MathPracs-TutoringManagement-API repository also setup in your project in addition to this repository**
2. **Install Node.js** (version 18 or later)
3. **Install AWS CLI** and configure with your credentials
4. **Install Finch** (Docker alternative for CDK Python bundling)

### Install Node.js
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

source ~/.bashrc

nvm install 20
nvm use 20
nvm alias default 20
```

#### Setup Finch

**macOS (using Homebrew):**
```bash
brew install finch
finch vm init
finch vm start
```

#### Deploy the Stack

0. **Set Node JS Version:**
   ```bash
   node --version # should show 20.x
   nvm use 20 # switch to 20 if it does not
   node --version # verify that it shows 20.x now
   ```

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Bootstrap CDK (first time only):**
   ```bash
   npx cdk bootstrap
   ```

3. **Deploy with Finch:****
   ```bash
   CDK_DOCKER=finch npx cdk deploy
   ```

#### Update Secrets

After deployment, update the AWS Secrets Manager secrets with your API credentials:

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

After deployment, you'll get two URLs:
- **API URL**: For making API calls
- **API Docs URL**: For viewing FastAPI documentation (Swagger UI)

### Useful Commands

- `CDK_DOCKER=finch npx cdk diff` - Compare deployed stack with current state
- `CDK_DOCKER=finch npx cdk synth` - Emit the synthesized CloudFormation template
- `CDK_DOCKER=finch npx cdk deploy` - Deploy with Finch Docker support
- `CDK_DOCKER=finch npx cdk destroy` - Destroy the stack
- `finch vm status` - See Finch VM Status
- `finch vm stop` - Stop Finch VM

### Stack Dependencies

This stack imports the following from **MathPracsPaymentRemindersCDK**:
- Student Payment DynamoDB Table
- Tutor Payment DynamoDB Table

### EventBridge Automation

The stack includes an EventBridge rule that automatically triggers `/sync/sessions` every 3 minutes to keep tutoring data synchronized with Google Calendar.