### What Is This

This is the Infrastructure-as-Code for the MathPracs Tutoring Management API - a FastAPI-based serverless application that manages tutoring sessions, students, and integrates with Google APIs, Dropbox, and Discord.

### How Does It Work

This CDK stack creates:

1. **AWS CodePipeline** - Auto-deploys to Beta then Prod on merge into `main`
2. **AWS Lambda Function** - FastAPI application with Mangum adapter
3. **AWS API Gateway** - REST API with proxy integration
4. **AWS DynamoDB Tables** - Sessions, CalendarListState, TutorsV2, TutorsMetadataV2, StudentsV2, StudentsMetadataV2, Transactions
5. **AWS Secrets Manager** - Google, Dropbox, Discord, and Groq API credentials
6. **AWS SSM Parameter Store** - Google Drive parent folder ID, Dropbox parent folder path
7. **AWS EventBridge Rules** - Triggers session sync every 3 minutes, Dropbox archive weekly
8. **AWS S3 Bucket** - Dropbox file archive (`mathpracs-dropbox-archive-<account-id>`)

### What Are The Components

AWS CodePipeline, AWS Lambda, AWS API Gateway, AWS DynamoDB, AWS Secrets Manager, AWS SSM Parameter Store, AWS EventBridge, AWS S3, Google API, Dropbox API, Discord API, Groq API.

### Multi-Account Pipeline

The pipeline deploys to **Beta** (655383751455) first, then **Prod** (786802935034). Both accounts are in `us-east-1`.

### How To Deploy

Raising a Pull Request for commits on a feature branch, getting it approved, and squashing and merging into `main` on either this repo or [MathPracs-TutoringManagement-API](https://github.com/ahsanjkhan/MathPracs-TutoringManagement-API) automatically triggers the CodePipeline, which runs CDK synth and deploys to Beta then Prod.

#### First-Time Setup (New AWS Account)

1. **Install Node.js** (version 20), **AWS CLI**, and **Finch** (`brew install finch && finch vm init && finch vm start`)

2. **Bootstrap CDK in the new account** (with new account creds exported):
   ```bash
   npx cdk bootstrap aws://<NEW_ACCOUNT_ID>/us-east-1 \
     --trust <PIPELINE_ACCOUNT_ID> \
     --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
   ```

3. **Deploy the pipeline stack** (with pipeline/prod account creds exported):
   ```bash
   npm install
   CDK_DOCKER=finch npx cdk deploy MathPracsTutoringManagementPipelineStack
   ```

After this, all future changes are deployed automatically via the pipeline.

#### Post-Deploy: Populate Secrets

Run `python3 src/scripts/update_secrets_and_params_beta.py` (from MathPracs-TutoringManagement-API) with the target account creds exported. Or manually:

```bash
# Google credentials
aws secretsmanager update-secret --secret-id tutoring-api/google-credentials-cdk \
  --secret-string '{"client_id":"...","client_secret":"...","refresh_token":"...","oauth_web_client_id":"...","oauth_web_client_secret":"...","allowed_emails":["email1","email2"]}'

# Dropbox credentials
aws secretsmanager update-secret --secret-id tutoring-api/dropbox-credentials-cdk \
  --secret-string '{"app_key":"...","app_secret":"...","refresh_token":"..."}'

# Discord credentials
aws secretsmanager update-secret --secret-id tutoring-api/discord-credentials-cdk \
  --secret-string '{"bot_token":"...","application_id":"...","public_key":"...","guild_id":"...","bot_id":"...","session_feedback_channel_id":"...","muaz_student_payment_channel_id":"...","ahsan_student_payment_channel_id":"...","tutor_payment_channel_id":"...","tutors_chats_category_id":"...","dropbox_notifs_category_id":"...","session_feedbacks_category_id":"...","session_reminders_category_id":"..."}'

# Groq credentials
aws secretsmanager update-secret --secret-id tutoring-api/groq-credentials-cdk \
  --secret-string '{"api_key":"..."}'
```

#### Post-Deploy: Populate SSM Parameters

```bash
aws ssm put-parameter --name /tutoring-api/parent-drive-folder-id \
  --value "<GOOGLE_DRIVE_FOLDER_ID>" --type String --overwrite

aws ssm put-parameter --name /tutoring-api/dropbox-parent-folder \
  --value "<DROPBOX_FOLDER_PATH>" --type String --overwrite
```

#### Out-of-Code Setup (Per Account)

These steps are done outside of CDK/code and must be performed manually for each environment:

1. **Google Cloud Project**
    - Create a project at https://console.cloud.google.com
    - Enable: Calendar API, Drive API, Docs API, Meet API
    - Create an OAuth 2.0 Client ID (Web application type)
    - Run `python3 src/scripts/setup_beta_auth.py` (from MathPracs-TutoringManagement-API) to get a refresh token
    - Create a Google Drive folder for student docs (folder ID goes in SSM)

2. **Dropbox App**
    - Create app at https://www.dropbox.com/developers/apps (Scoped access, Full Dropbox)
    - Enable permissions: `files.metadata.read`, `files.metadata.write`, `files.content.read`, `files.content.write`, `sharing.read`, `sharing.write`, `file_requests.read`, `file_requests.write`
    - Get refresh token:
      ```
      # 1. Visit (replace APP_KEY):
      https://www.dropbox.com/oauth2/authorize?client_id=APP_KEY&response_type=code&token_access_type=offline
      
      # 2. Exchange code for refresh token:
      curl -s -X POST https://api.dropboxapi.com/oauth2/token \
        -d code=AUTH_CODE -d grant_type=authorization_code \
        -d client_id=APP_KEY -d client_secret=APP_SECRET | python3 -m json.tool
      ```
    - Create a folder in Dropbox for student uploads (path goes in SSM)
    - Set webhook URL: `https://<API_GATEWAY_URL>/prod/dropbox/webhook`

3. **Discord Bot**
    - Create application at https://discord.com/developers/applications
    - Save: Bot Token, Application ID, Public Key
    - Invite bot to server: `https://discord.com/oauth2/authorize?client_id=APP_ID&scope=bot%20applications.commands&permissions=8`
    - Set Interactions Endpoint URL: `https://<API_GATEWAY_URL>/prod/discord/interactions`
    - Grant bot's role Administrator permission in Server Settings → Roles
    - Create these private channels and save their IDs:
        - `session-feedbacks` (under Follow-Ups category)
        - `ahsan-payment-students` (under Payment Reminders category)
        - `muaz-payment-students` (under Payment Reminders category)
        - `payment-tutors` (under Payment Reminders category)
    - Create these categories and save their IDs:
        - Tutors-Chats
        - Dropbox Notifs
        - Session-Feedbacks
        - Session Reminders
    - Ensure Admin role has Administrator permission toggled ON
    - Register slash commands: `python3 -m src.scripts.register_discord_commands`

4. **Groq**
    - Create account at https://console.groq.com
    - Generate API key

#### Manual Deployments (Avoid if possible)
1. Make changes on feature branch.
2. Commit those changes and raise Pull Request as usual.
3. Deploy the changes directly:
   ```bash
   CDK_DOCKER=finch npx cdk deploy MathPracsTutoringManagementCdkStack
   ```

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
- **MathPracsSessionRemindersCDK**: Sessions, StudentsV2, StudentsMetadataV2, TutorsV2, TutorsMetadataV2 DynamoDB Tables, Discord API Secrets

### EventBridge Automation

The stack includes EventBridge rules that:
- Trigger `/sync/sessions` every 3 minutes to keep tutoring data synchronized with Google Calendar
- Archive Dropbox files to S3 every Sunday at midnight Central
