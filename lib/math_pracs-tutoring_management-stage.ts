import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MathPracsTutoringManagementCdkStack } from './math_pracs-tutoring_management-cdk-stack';

export class MathPracsTutoringManagementStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new MathPracsTutoringManagementCdkStack(this, 'MathPracsTutoringManagementCdkStack', {
      stackName: 'MathPracsTutoringManagementCdkStack',
    });
  }
}
