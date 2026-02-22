import * as cdk from 'aws-cdk-lib';
import * as python from '@aws-cdk/aws-lambda-python-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
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
  SYNC_SESSIONS_EVENTBRIDGE_RULE_SCHEDULE_EXPRESSION, TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_PARENT_DRIVE_FOLDER_ID_SSM
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
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const calendarSyncTable = new dynamodb.Table(this, CALENDAR_SYNC_TABLE_ID, {
      tableName: CALENDAR_SYNC_TABLE_NAME,
      partitionKey: { name: 'syncType', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const studentsTable = new dynamodb.Table(this, STUDENTS_TABLE_ID, {
      tableName: STUDENTS_TABLE_NAME,
      partitionKey: { name: 'studentName', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
    });
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_AWS_REGION, this.region);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_TUTORS_TABLE, tutorsTable.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_SESSIONS_TABLE, sessionsTable.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_CALENDAR_SYNC_TABLE, calendarSyncTable.tableName);
    tutoringManagementLambda.addEnvironment(TUTORING_MANAGEMENT_LAMBDA_ENV_VAR_KEY_STUDENTS_TABLE, studentsTable.tableName);
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
  }
}