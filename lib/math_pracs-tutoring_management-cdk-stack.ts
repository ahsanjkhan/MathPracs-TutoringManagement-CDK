import * as cdk from 'aws-cdk-lib';
import * as python from '@aws-cdk/aws-lambda-python-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import {
  TUTORS_TABLE_NAME,
  TUTORS_TABLE_ID,
  SESSIONS_TABLE_NAME,
  SESSIONS_TABLE_ID,
  CALENDAR_SYNC_TABLE_NAME,
  CALENDAR_SYNC_TABLE_ID,
  STUDENTS_TABLE_NAME,
  STUDENTS_TABLE_ID,
  GOOGLE_CREDENTIALS_SECRET_NAME,
  GOOGLE_CREDENTIALS_SECRET_ID,
  GOOGLE_CREDENTIALS_SECRET_DESCRIPTION,
  DROPBOX_CREDENTIALS_SECRET_NAME,
  DROPBOX_CREDENTIALS_SECRET_ID,
  DROPBOX_CREDENTIALS_SECRET_DESCRIPTION,
  DISCORD_CREDENTIALS_SECRET_NAME,
  DISCORD_CREDENTIALS_SECRET_ID,
  DISCORD_CREDENTIALS_SECRET_DESCRIPTION,
  GROQ_CREDENTIALS_SECRET_NAME,
  GROQ_CREDENTIALS_SECRET_ID,
  GROQ_CREDENTIALS_SECRET_DESCRIPTION,
  SECRET_PLACEHOLDER,
  TUTORING_MANAGEMENT_LAMBDA_NAME,
  TUTORING_MANAGEMENT_LAMBDA_ID,
  TUTORING_MANAGEMENT_LAMBDA_RUNTIME,
  TUTORING_MANAGEMENT_LAMBDA_ENTRY,
  TUTORING_MANAGEMENT_LAMBDA_INDEX,
  TUTORING_MANAGEMENT_LAMBDA_HANDLER,
  TUTORING_MANAGEMENT_LAMBDA_TIMEOUT,
  TUTORING_MANAGEMENT_LAMBDA_MEMORY_SIZE,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_AWS_REGION,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_TUTORS_TABLE,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_SESSIONS_TABLE,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_CALENDAR_SYNC_TABLE,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_STUDENTS_TABLE,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_GOOGLE_CREDENTIALS_SECRET,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DROPBOX_CREDENTIALS_SECRET,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DISCORD_CREDENTIALS_SECRET,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_GROQ_CREDENTIALS_SECRET,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DROPBOX_PARENT_FOLDER_SSM,
  PARENT_DRIVE_FOLDER_ID_SSM_NAME,
  PARENT_DRIVE_FOLDER_ID_SSM_ID,
  PARENT_DRIVE_FOLDER_ID_SSM_DESCRIPTION,
  PARENT_DRIVE_FOLDER_ID_SSM_VALUE,
  DROPBOX_PARENT_FOLDER_SSM_NAME,
  DROPBOX_PARENT_FOLDER_SSM_ID,
  DROPBOX_PARENT_FOLDER_SSM_DESCRIPTION,
  DROPBOX_PARENT_FOLDER_SSM_VALUE,
  TUTORING_MANAGEMENT_API_NAME,
  TUTORING_MANAGEMENT_API_ID,
  TUTORING_MANAGEMENT_API_DESCRIPTION,
  CFN_OUTPUT_TUTORS_TABLE_ID,
  CFN_OUTPUT_TUTORS_TABLE_DESCRIPTION,
  CFN_OUTPUT_SESSIONS_TABLE_ID,
  CFN_OUTPUT_SESSIONS_TABLE_DESCRIPTION,
  CFN_OUTPUT_CALENDAR_SYNC_TABLE_ID,
  CFN_OUTPUT_CALENDAR_SYNC_TABLE_DESCRIPTION,
  CFN_OUTPUT_STUDENTS_TABLE_ID,
  CFN_OUTPUT_STUDENTS_TABLE_DESCRIPTION,
  CFN_OUTPUT_TUTORING_MANAGEMENT_LAMBDA_ID,
  CFN_OUTPUT_TUTORING_MANAGEMENT_LAMBDA_DESCRIPTION,
  CFN_OUTPUT_API_URL_ID,
  CFN_OUTPUT_API_URL_DESCRIPTION,
  CFN_OUTPUT_API_DOCS_URL_ID,
  CFN_OUTPUT_API_DOCS_URL_DESCRIPTION,
  CFN_OUTPUT_GOOGLE_CREDENTIALS_SECRET_ID,
  CFN_OUTPUT_GOOGLE_CREDENTIALS_SECRET_DESCRIPTION,
  CFN_OUTPUT_DROPBOX_CREDENTIALS_SECRET_ID,
  CFN_OUTPUT_DROPBOX_CREDENTIALS_SECRET_DESCRIPTION,
  CFN_OUTPUT_DISCORD_CREDENTIALS_SECRET_ID,
  CFN_OUTPUT_DISCORD_CREDENTIALS_SECRET_DESCRIPTION,
  CFN_OUTPUT_GROQ_CREDENTIALS_SECRET_ID,
  CFN_OUTPUT_GROQ_CREDENTIALS_SECRET_DESCRIPTION,
  SYNC_SESSIONS_EVENTBRIDGE_RULE_NAME,
  SYNC_SESSIONS_EVENTBRIDGE_RULE_ID,
  SYNC_SESSIONS_EVENTBRIDGE_RULE_DESCRIPTION,
  SYNC_SESSIONS_EVENTBRIDGE_RULE_SCHEDULE_EXPRESSION, TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_PARENT_DRIVE_FOLDER_ID_SSM,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_TUTORS_METADATA_TABLE,
  TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_STUDENTS_METADATA_TABLE
} from "../config/constants";

export class MathPracsTutoringManagementCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



    // DynamoDB Tables
    const tutorsTable = new dynamodb.Table(this, TUTORS_TABLE_ID, {
      tableName: TUTORS_TABLE_NAME,
      partitionKey: { name: 'tutorId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add GSI for calendar ID lookup
    tutorsTable.addGlobalSecondaryIndex({
      indexName: 'calendarId-index',
      partitionKey: { name: 'calendarId', type: dynamodb.AttributeType.STRING },
    });

    const sessionsTable = new dynamodb.Table(this, SESSIONS_TABLE_ID, {
      tableName: SESSIONS_TABLE_NAME,
      partitionKey: { name: 'tutorId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

    const calendarSyncTable = new dynamodb.Table(this, CALENDAR_SYNC_TABLE_ID, {
      tableName: CALENDAR_SYNC_TABLE_NAME,
      partitionKey: { name: 'syncType', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

    const studentsTable = new dynamodb.Table(this, STUDENTS_TABLE_ID, {
      tableName: STUDENTS_TABLE_NAME,
      partitionKey: { name: 'studentName', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // V2 Tables - Duplicates with all current fields
    const tutorsV2Table = new dynamodb.Table(this, 'TutorsV2Table', {
      tableName: 'TutorsV2',
      partitionKey: { name: 'tutorId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

    // Add GSI for calendar ID lookup (same as original)
    tutorsV2Table.addGlobalSecondaryIndex({
      indexName: 'calendarId-index',
      partitionKey: { name: 'calendarId', type: dynamodb.AttributeType.STRING },
    });

    const tutorsMetadataV2Table = new dynamodb.Table(this, 'TutorsMetadataV2Table', {
      tableName: 'TutorsMetadataV2',
      partitionKey: { name: 'tutorId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

    const studentsV2Table = new dynamodb.Table(this, 'StudentsV2Table', {
      tableName: 'StudentsV2',
      partitionKey: { name: 'studentName', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

    const studentsMetadataV2Table = new dynamodb.Table(this, 'StudentsMetadataV2Table', {
      tableName: 'StudentsMetadataV2',
      partitionKey: { name: 'studentName', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

    // Transactions table (new)
    const transactionsTable = new dynamodb.Table(this, 'TransactionsTable', {
      tableName: 'Transactions',
      partitionKey: { name: 'studentName', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'transactionKey', type: dynamodb.AttributeType.STRING }, // format: "DEBIT#2026-03-01T18:00:00Z"
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

    // Secrets for API credentials
    const googleCredentialsSecret = new secretsmanager.Secret(this, GOOGLE_CREDENTIALS_SECRET_ID, {
      secretName: GOOGLE_CREDENTIALS_SECRET_NAME,
      description: GOOGLE_CREDENTIALS_SECRET_DESCRIPTION,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: SECRET_PLACEHOLDER,
        excludeCharacters: '"@/\\'
      }
    });

    const dropboxCredentialsSecret = new secretsmanager.Secret(this, DROPBOX_CREDENTIALS_SECRET_ID, {
      secretName: DROPBOX_CREDENTIALS_SECRET_NAME,
      description: DROPBOX_CREDENTIALS_SECRET_DESCRIPTION,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: SECRET_PLACEHOLDER,
        excludeCharacters: '"@/\\'
      }
    });

    const discordCredentialsSecret = new secretsmanager.Secret(this, DISCORD_CREDENTIALS_SECRET_ID, {
      secretName: DISCORD_CREDENTIALS_SECRET_NAME,
      description: DISCORD_CREDENTIALS_SECRET_DESCRIPTION,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: SECRET_PLACEHOLDER,
        excludeCharacters: '"@/\\'
      }
    });

    const groqCredentialsSecret = new secretsmanager.Secret(this, GROQ_CREDENTIALS_SECRET_ID, {
      secretName: GROQ_CREDENTIALS_SECRET_NAME,
      description: GROQ_CREDENTIALS_SECRET_DESCRIPTION,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: SECRET_PLACEHOLDER,
        excludeCharacters: '"@/\\'
      }
    });

    // SSM Parameters
    const parentDriveFolderIdParam = new ssm.StringParameter(this, PARENT_DRIVE_FOLDER_ID_SSM_ID, {
      parameterName: PARENT_DRIVE_FOLDER_ID_SSM_NAME,
      stringValue: PARENT_DRIVE_FOLDER_ID_SSM_VALUE,
      description: PARENT_DRIVE_FOLDER_ID_SSM_DESCRIPTION
    });

    const dropboxParentFolderParam = new ssm.StringParameter(this, DROPBOX_PARENT_FOLDER_SSM_ID, {
      parameterName: DROPBOX_PARENT_FOLDER_SSM_NAME,
      stringValue: DROPBOX_PARENT_FOLDER_SSM_VALUE,
      description: DROPBOX_PARENT_FOLDER_SSM_DESCRIPTION
    });

    // Tutoring Management API Lambda
    const tutoringManagementLambda = new python.PythonFunction(this, TUTORING_MANAGEMENT_LAMBDA_ID, {
      functionName: TUTORING_MANAGEMENT_LAMBDA_NAME,
      runtime: TUTORING_MANAGEMENT_LAMBDA_RUNTIME,
      entry: TUTORING_MANAGEMENT_LAMBDA_ENTRY,
      index: TUTORING_MANAGEMENT_LAMBDA_INDEX,
      handler: TUTORING_MANAGEMENT_LAMBDA_HANDLER,
      timeout: TUTORING_MANAGEMENT_LAMBDA_TIMEOUT,
      memorySize: TUTORING_MANAGEMENT_LAMBDA_MEMORY_SIZE,
      bundling: {
      assetExcludes: ['.venv', '__pycache__', '.git', '.idea', 'tests',
  'discord_bot', '*.pyc', '*.pkg', 'node_modules', '*.md', 'scripts'],
    },
    });
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_AWS_REGION, this.region);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_TUTORS_TABLE, tutorsV2Table.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_TUTORS_METADATA_TABLE, tutorsMetadataV2Table.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_SESSIONS_TABLE, sessionsTable.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_CALENDAR_SYNC_TABLE, calendarSyncTable.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_STUDENTS_TABLE, studentsV2Table.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_STUDENTS_METADATA_TABLE, studentsMetadataV2Table.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_GOOGLE_CREDENTIALS_SECRET, googleCredentialsSecret.secretName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DROPBOX_CREDENTIALS_SECRET, dropboxCredentialsSecret.secretName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DISCORD_CREDENTIALS_SECRET, discordCredentialsSecret.secretName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_GROQ_CREDENTIALS_SECRET, groqCredentialsSecret.secretName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_PARENT_DRIVE_FOLDER_ID_SSM, parentDriveFolderIdParam.parameterName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_DROPBOX_PARENT_FOLDER_SSM, dropboxParentFolderParam.parameterName);

    // Grant Lambda permissions
    tutorsTable.grantReadWriteData(tutoringManagementLambda);
    sessionsTable.grantReadWriteData(tutoringManagementLambda);
    calendarSyncTable.grantReadWriteData(tutoringManagementLambda);
    studentsTable.grantReadWriteData(tutoringManagementLambda);

    // Grant Lambda permissions for V2 tables
    tutorsV2Table.grantReadWriteData(tutoringManagementLambda);
    tutorsMetadataV2Table.grantReadWriteData(tutoringManagementLambda);
    studentsV2Table.grantReadWriteData(tutoringManagementLambda);
    studentsMetadataV2Table.grantReadWriteData(tutoringManagementLambda);
    transactionsTable.grantReadWriteData(tutoringManagementLambda);

    googleCredentialsSecret.grantRead(tutoringManagementLambda);
    dropboxCredentialsSecret.grantRead(tutoringManagementLambda);
    discordCredentialsSecret.grantRead(tutoringManagementLambda);
    groqCredentialsSecret.grantRead(tutoringManagementLambda);
    parentDriveFolderIdParam.grantRead(tutoringManagementLambda);
    dropboxParentFolderParam.grantRead(tutoringManagementLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, TUTORING_MANAGEMENT_API_ID, {
      restApiName: TUTORING_MANAGEMENT_API_NAME,
      description: TUTORING_MANAGEMENT_API_DESCRIPTION
    });

    // API Gateway integration with proxy
    const integration = new apigateway.LambdaIntegration(tutoringManagementLambda);
    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true
    });

    // EventBridge Rule for sync sessions
    const syncSessionsRule = new events.Rule(this, SYNC_SESSIONS_EVENTBRIDGE_RULE_ID, {
      ruleName: SYNC_SESSIONS_EVENTBRIDGE_RULE_NAME,
      description: SYNC_SESSIONS_EVENTBRIDGE_RULE_DESCRIPTION,
      schedule: events.Schedule.expression(SYNC_SESSIONS_EVENTBRIDGE_RULE_SCHEDULE_EXPRESSION),
    });

    // EventBridge target - simple event, no HTTP simulation needed
    syncSessionsRule.addTarget(new targets.LambdaFunction(tutoringManagementLambda, {
      event: events.RuleTargetInput.fromObject({
        "source": "aws.events",
        "detail-type": "Scheduled Event",
        "detail": {
          "action": "sync-sessions"
        }
      })
    }));

    // Outputs
    new cdk.CfnOutput(this, CFN_OUTPUT_TUTORS_TABLE_ID, {
      value: tutorsTable.tableName,
      description: CFN_OUTPUT_TUTORS_TABLE_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_SESSIONS_TABLE_ID, {
      value: sessionsTable.tableName,
      description: CFN_OUTPUT_SESSIONS_TABLE_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_CALENDAR_SYNC_TABLE_ID, {
      value: calendarSyncTable.tableName,
      description: CFN_OUTPUT_CALENDAR_SYNC_TABLE_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_STUDENTS_TABLE_ID, {
      value: studentsTable.tableName,
      description: CFN_OUTPUT_STUDENTS_TABLE_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_TUTORING_MANAGEMENT_LAMBDA_ID, {
      value: tutoringManagementLambda.functionName,
      description: CFN_OUTPUT_TUTORING_MANAGEMENT_LAMBDA_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_API_URL_ID, {
      value: api.url,
      description: CFN_OUTPUT_API_URL_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_API_DOCS_URL_ID, {
      value: `${api.url}docs`,
      description: CFN_OUTPUT_API_DOCS_URL_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_GOOGLE_CREDENTIALS_SECRET_ID, {
      value: googleCredentialsSecret.secretArn,
      description: CFN_OUTPUT_GOOGLE_CREDENTIALS_SECRET_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_DROPBOX_CREDENTIALS_SECRET_ID, {
      value: dropboxCredentialsSecret.secretArn,
      description: CFN_OUTPUT_DROPBOX_CREDENTIALS_SECRET_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_DISCORD_CREDENTIALS_SECRET_ID, {
      value: discordCredentialsSecret.secretArn,
      description: CFN_OUTPUT_DISCORD_CREDENTIALS_SECRET_DESCRIPTION
    });

    new cdk.CfnOutput(this, CFN_OUTPUT_GROQ_CREDENTIALS_SECRET_ID, {
      value: groqCredentialsSecret.secretArn,
      description: CFN_OUTPUT_GROQ_CREDENTIALS_SECRET_DESCRIPTION
    });

    // Outputs for V2 tables
    new cdk.CfnOutput(this, 'TutorsV2TableOutput', {
      value: tutorsV2Table.tableName,
      description: 'TutorsV2 DynamoDB Table Name'
    });

    new cdk.CfnOutput(this, 'TutorsMetadataV2TableOutput', {
      value: tutorsMetadataV2Table.tableName,
      description: 'TutorsMetadataV2 DynamoDB Table Name'
    });

    new cdk.CfnOutput(this, 'StudentsV2TableOutput', {
      value: studentsV2Table.tableName,
      description: 'StudentsV2 DynamoDB Table Name'
    });

    new cdk.CfnOutput(this, 'StudentsMetadataV2TableOutput', {
      value: studentsMetadataV2Table.tableName,
      description: 'StudentsMetadataV2 DynamoDB Table Name'
    });

    new cdk.CfnOutput(this, 'TransactionsTableOutput', {
      value: transactionsTable.tableName,
      description: 'Transactions DynamoDB Table Name'
    });

    // Cross-stack exports for MathPracsSessionRemindersCDK
    new cdk.CfnOutput(this, 'SessionsTableArn', {
      value: sessionsTable.tableArn,
      description: 'ARN of Sessions DynamoDB Table',
      exportName: 'MathPracs-SessionsTable-Arn'
    });

    new cdk.CfnOutput(this, 'StudentsTableArn', {
      value: studentsTable.tableArn,
      description: 'ARN of Students DynamoDB Table',
      exportName: 'MathPracs-StudentsTable-Arn'
    });
    new cdk.CfnOutput(this, 'DiscordCredentialsSecretArnExport', {
      value: discordCredentialsSecret.secretArn,
      description: 'ARN of Discord Credentials Secret',
      exportName: 'MathPracs-DiscordCredentials-Arn'
    });

    new cdk.CfnOutput(this, 'StudentsV2TableArn', {
      value: studentsV2Table.tableArn,
      description: 'ARN of StudentsV2 DynamoDB Table',
      exportName: 'MathPracs-StudentsV2Table-Arn'
    });

    new cdk.CfnOutput(this, 'StudentsMetadataV2TableArn', {
      value: studentsMetadataV2Table.tableArn,
      description: 'ARN of StudentsMetadataV2 DynamoDB Table',
      exportName: 'MathPracs-StudentsMetadataV2Table-Arn'
    });


    new cdk.CfnOutput(this, 'TutorsV2TableArn', {
      value: tutorsV2Table.tableArn,
      description: 'ARN of TutorsV2 DynamoDB Table',
      exportName: 'MathPracs-TutorsV2Table-Arn'
    });

    new cdk.CfnOutput(this, 'TutorsMetadataV2TableArn', {
      value: tutorsMetadataV2Table.tableArn,
      description: 'ARN of TutorsMetadataV2 DynamoDB Table',
      exportName: 'MathPracs-TutorsMetadataV2Table-Arn'
    });
  }
}