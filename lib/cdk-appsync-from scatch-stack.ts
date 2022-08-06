import { Stack, StackProps, aws_iam as iam, RemovalPolicy } from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
// import {
//   AccountRecovery,
//   UserPool,
//   UserPoolClient,
//   VerificationEmailStyle,
// } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import { resolve, join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { AttributeType, Table, BillingMode } from "aws-cdk-lib/aws-dynamodb";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkAppsyncFromScatchStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const userDataBase = new Table(this, "userDataBase", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      tableName: "userDataBase",
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, //will delete table after deletting cloudfomration
    });

    // const userPool = new UserPool(this, "cdk-products-user-pool", {
    //   selfSignUpEnabled: true,
    //   accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
    //   userVerification: {
    //     emailStyle: VerificationEmailStyle.CODE,
    //   },
    //   autoVerify: {
    //     email: true,
    //   },
    //   standardAttributes: {
    //     email: {
    //       required: true,
    //       mutable: true,
    //     },
    //   },
    // });

    // const userPoolClient = new UserPoolClient(this, "UserPoolClient", {
    //   userPool,
    // });

    const api = new appsync.CfnGraphQLApi(this, "HelloApi", {
      name: `HelloApi`,
      authenticationType: "API_KEY",
    });

    new appsync.CfnApiKey(this, "HelloApiKey", {
      apiId: api.attrApiId,
    });

    const definition = readFileSync(
      resolve(__dirname, "../graphql/schema.graphql")
    ).toString();
    console.log("***************", definition);
    const apiSchema = new appsync.CfnGraphQLSchema(
      this,
      `cdk-product-app-schema`,
      {
        apiId: api.attrApiId,
        definition,
      }
    );

    // requires this command before it works:
    // npm install --save-dev esbuild@0
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html
    const helloLambdaNodeJs = new NodejsFunction(this, "helloLambdaNodeJs", {
      entry: join(__dirname, "..", "lambda", "hello.ts"),
      handler: "handler",
    });

    const helloLApi_serviceRole: iam.Role = new iam.Role(
      this,
      "appsyncServiceRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      }
    );
    helloLApi_serviceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    const lambdaDataSource = new appsync.CfnDataSource(
      this,
      "helloLambdaNodeJsDataSource",
      {
        apiId: api.attrApiId,
        name: "HJelloApi_resolverDataSourceName",
        type: "AWS_LAMBDA",
        lambdaConfig: {
          lambdaFunctionArn: helloLambdaNodeJs.functionArn,
        },
        serviceRoleArn: helloLApi_serviceRole.roleArn,
      }
    );

    const getMessage_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getMessageQuerryResolver",
      {
        apiId: api.attrApiId,
        typeName: "Query",
        fieldName: "getMessage",
        //fieldName: "all",
        dataSourceName: lambdaDataSource.name,
      }
    );

    const getUserById_resolver: appsync.CfnResolver = new appsync.CfnResolver(
      this,
      "getUserByIdQueryresolver",
      {
        apiId: api.attrApiId,
        typeName: "Query",
        fieldName: "getUserById",
        dataSourceName: lambdaDataSource.name,
      }
    );

    getMessage_resolver.node.addDependency(apiSchema);
    getMessage_resolver.node.addDependency(lambdaDataSource);

    getUserById_resolver.node.addDependency(apiSchema);
    getUserById_resolver.node.addDependency(lambdaDataSource);

    userDataBase.grantReadWriteData(helloLambdaNodeJs);
  }
}
