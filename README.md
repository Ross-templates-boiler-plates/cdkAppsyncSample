Auther:Ross

This is a sample cdk code to create appsync.

ref for graphql part:https://www.youtube.com/watch?v=_9DFFg-pNss&ab_channel=NaderDabit

ref for cdk part: https://www.youtube.com/watch?v=DOGadkjV7Hs&t=315s&ab_channel=NaderDabit

activate user in cognito user pool :
(ref:https://ama.udemy.com/course/aws-typescript-cdk-serverless-react/learn/lecture/27145484#notes)
aws cognito-idp admin-set-user-password --user-pool-id <user-pool-id> --username Ross --password "<password>" --permanent --profile <profile name>

sample query:

```graphql
query MyQuery {
  getUserById(userId: "1") {
    id
  }
}
```

or

```graphql
query MyQuery {
  getUserById(userId: "") {
    id
    location
    name
  }
}
```
