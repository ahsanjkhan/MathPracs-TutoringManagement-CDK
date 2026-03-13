import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";

// DynamoDB Tables
export const SESSIONS_TABLE_NAME = 'Sessions';
export const SESSIONS_TABLE_ID = 'SessionsTable';

export const CALENDAR_SYNC_TABLE_NAME = 'CalendarListState';
export const CALENDAR_SYNC_TABLE_ID = 'CalendarSyncTable';

// Secrets Manager
export const GOOGLE_CREDENTIALS_SECRET_NAME = 'tutoring-api/google-credentials-cdk';
export const GOOGLE_CREDENTIALS_SECRET_ID = 'GoogleCredentialsSecret';
export const GOOGLE_CREDENTIALS_SECRET_DESCRIPTION = 'Google API credentials for tutoring management';

export const DROPBOX_CREDENTIALS_SECRET_NAME = 'tutoring-api/dropbox-credentials-cdk';
export const DROPBOX_CREDENTIALS_SECRET_ID = 'DropboxCredentialsSecret';
export const DROPBOX_CREDENTIALS_SECRET_DESCRIPTION = 'Dropbox API credentials for tutoring management';

export const DISCORD_CREDENTIALS_SECRET_NAME = 'tutoring-api/discord-credentials-cdk';
export const DISCORD_CREDENTIALS_SECRET_ID = 'DiscordCredentialsSecret';
export const DISCORD_CREDENTIALS_SECRET_DESCRIPTION = 'Discord API credentials for tutoring management';

export const GROQ_CREDENTIALS_SECRET_NAME = 'tutoring-api/groq-credentials-cdk';
export const GROQ_CREDENTIALS_SECRET_ID = 'GroqCredentialsSecret';
export const GROQ_CREDENTIALS_SECRET_DESCRIPTION = 'Groq API credentials for tutoring management';

export const SECRET_PLACEHOLDER = 'placeholder';

// SSM Parameters
export const PARENT_DRIVE_FOLDER_ID_SSM_NAME = '/tutoring-api/parent-drive-folder-id';
export const PARENT_DRIVE_FOLDER_ID_SSM_ID = 'ParentDriveFolderId';
export const PARENT_DRIVE_FOLDER_ID_SSM_DESCRIPTION = 'Google Drive parent folder ID for student folders';
export const PARENT_DRIVE_FOLDER_ID_SSM_VALUE = 'PLACEHOLDER';

export const DROPBOX_PARENT_FOLDER_SSM_NAME = '/tutoring-api/dropbox-parent-folder';
export const DROPBOX_PARENT_FOLDER_SSM_ID = 'DropboxParentFolder';
export const DROPBOX_PARENT_FOLDER_SSM_DESCRIPTION = 'Dropbox parent folder path for student folders';
export const DROPBOX_PARENT_FOLDER_SSM_VALUE = 'PLACEHOLDER';

export const SSM_PLACEHOLDER = 'PLACEHOLDER';

// Lambda Function
export const TUTORING_MANAGEMENT_LAMBDA_NAME = 'mathpracs-tutoring-management-api';
export const TUTORING_MANAGEMENT_LAMBDA_ID = 'TutoringManagementLambda';
export const TUTORING_MANAGEMENT_LAMBDA_RUNTIME = lambda.Runtime.PYTHON_3_11;
export const TUTORING_MANAGEMENT_LAMBDA_ENTRY = '../MathPracs-TutoringManagement-API';
export const TUTORING_MANAGEMENT_LAMBDA_INDEX = 'src/main.py';
export const TUTORING_MANAGEMENT_LAMBDA_HANDLER = 'lambda_handler';
export const TUTORING_MANAGEMENT_LAMBDA_TIMEOUT = cdk.Duration.minutes(5);
export const TUTORING_MANAGEMENT_LAMBDA_MEMORY_SIZE = 1024;

// Environment Variables
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_AWS_REGION = 'TUTORING_AWS_REGION';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_TUTORS_TABLE = 'TUTORING_TUTORS_TABLE';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_TUTORS_METADATA_TABLE = 'TUTORING_TUTORS_METADATA_TABLE';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_SESSIONS_TABLE = 'TUTORING_SESSIONS_TABLE';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_CALENDAR_SYNC_TABLE = 'TUTORING_CALENDAR_SYNC_TABLE';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_STUDENTS_TABLE = 'TUTORING_STUDENTS_TABLE';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_STUDENTS_METADATA_TABLE = 'TUTORING_STUDENTS_METADATA_TABLE';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_GOOGLE_CREDENTIALS_SECRET = 'TUTORING_GOOGLE_CREDENTIALS_SECRET_NAME';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DROPBOX_CREDENTIALS_SECRET = 'TUTORING_DROPBOX_CREDENTIALS_SECRET_NAME';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DISCORD_CREDENTIALS_SECRET = 'TUTORING_DISCORD_CREDENTIALS_SECRET_NAME';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_GROQ_CREDENTIALS_SECRET = 'TUTORING_GROQ_CREDENTIALS_SECRET_NAME';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_PARENT_DRIVE_FOLDER_ID_SSM = 'TUTORING_PARENT_DRIVE_FOLDER_ID_SSM_NAME';
export const TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DROPBOX_PARENT_FOLDER_SSM = 'TUTORING_DROPBOX_PARENT_FOLDER_SSM_NAME';

// API Gateway
export const TUTORING_MANAGEMENT_API_NAME = 'MathPracs Tutoring Management API';
export const TUTORING_MANAGEMENT_API_ID = 'TutoringManagementApi';
export const TUTORING_MANAGEMENT_API_DESCRIPTION = 'API for managing tutoring sessions and student data';

// CloudFormation Outputs
export const CFN_OUTPUT_SESSIONS_TABLE_ID = 'SessionsTableName';
export const CFN_OUTPUT_SESSIONS_TABLE_DESCRIPTION = 'DynamoDB table name for sessions';

export const CFN_OUTPUT_CALENDAR_SYNC_TABLE_ID = 'CalendarSyncTableName';
export const CFN_OUTPUT_CALENDAR_SYNC_TABLE_DESCRIPTION = 'DynamoDB table name for calendar sync state';

export const CFN_OUTPUT_TUTORING_MANAGEMENT_LAMBDA_ID = 'TutoringManagementLambdaFunctionName';
export const CFN_OUTPUT_TUTORING_MANAGEMENT_LAMBDA_DESCRIPTION = 'Tutoring Management Lambda function name';

export const CFN_OUTPUT_API_URL_ID = 'ApiUrl';
export const CFN_OUTPUT_API_URL_DESCRIPTION = 'Tutoring Management API URL';

export const CFN_OUTPUT_API_DOCS_URL_ID = 'ApiDocsUrl';
export const CFN_OUTPUT_API_DOCS_URL_DESCRIPTION = 'FastAPI Documentation URL';

export const CFN_OUTPUT_GOOGLE_CREDENTIALS_SECRET_ID = 'GoogleCredentialsSecretArn';
export const CFN_OUTPUT_GOOGLE_CREDENTIALS_SECRET_DESCRIPTION = 'Google Credentials Secret ARN';

export const CFN_OUTPUT_DROPBOX_CREDENTIALS_SECRET_ID = 'DropboxCredentialsSecretArn';
export const CFN_OUTPUT_DROPBOX_CREDENTIALS_SECRET_DESCRIPTION = 'Dropbox Credentials Secret ARN';

export const CFN_OUTPUT_DISCORD_CREDENTIALS_SECRET_ID = 'DiscordCredentialsSecretArn';
export const CFN_OUTPUT_DISCORD_CREDENTIALS_SECRET_DESCRIPTION = 'Discord Credentials Secret ARN';

export const CFN_OUTPUT_GROQ_CREDENTIALS_SECRET_ID = 'GroqCredentialsSecretArn';
export const CFN_OUTPUT_GROQ_CREDENTIALS_SECRET_DESCRIPTION = 'Groq Credentials Secret ARN';

// EventBridge Rules
export const SYNC_SESSIONS_EVENTBRIDGE_RULE_NAME = 'tutoring-management-sync-sessions-schedule';
export const SYNC_SESSIONS_EVENTBRIDGE_RULE_ID = 'SyncSessionsSchedule';
export const SYNC_SESSIONS_EVENTBRIDGE_RULE_DESCRIPTION = 'Triggers tutoring management sync sessions every 3 minutes';
export const SYNC_SESSIONS_EVENTBRIDGE_RULE_SCHEDULE_EXPRESSION = 'rate(3 minutes)';