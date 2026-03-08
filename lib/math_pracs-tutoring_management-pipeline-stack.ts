import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as codepipeline from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { MathPracsTutoringManagementStage } from './math_pracs-tutoring_management-stage';

const GITHUB_OWNER = 'ahsanjkhan';
const CDK_REPO = 'MathPracs-TutoringManagement-CDK';
const API_REPO = 'MathPracs-TutoringManagement-API';
const MAIN_BRANCH = 'main';

export class MathPracsTutoringManagementPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectionArn = ssm.StringParameter.valueForStringParameter(
      this, '/mathpracs/github-connection-arn'
    );

    const cdkSource = codepipeline.CodePipelineSource.connection(
      `${GITHUB_OWNER}/${CDK_REPO}`, MAIN_BRANCH,
      { connectionArn, triggerOnPush: true }
    );

    const apiSource = codepipeline.CodePipelineSource.connection(
      `${GITHUB_OWNER}/${API_REPO}`, MAIN_BRANCH,
      { connectionArn, triggerOnPush: true }
    );

    const pipeline = new codepipeline.CodePipeline(this, 'Pipeline', {
      pipelineName: 'MathPracsTutoringManagementPipeline',
      pipelineType: cdk.aws_codepipeline.PipelineType.V2,
      synth: new codepipeline.ShellStep('Synth', {
        input: cdkSource,
        additionalInputs: {
          [`../${API_REPO}`]: apiSource,
        },
        commands: [
          'npm ci',
          'npx cdk synth',
        ],
      }),
    });

    pipeline.addStage(new MathPracsTutoringManagementStage(this, 'Prod'));
  }
}
