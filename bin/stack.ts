#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkAppsyncFromScatchStack } from "../lib/cdk-appsync-from scatch-stack";

const app = new cdk.App();
new CdkAppsyncFromScatchStack(app, "CdkAppsyncFromScatchStack", {});
