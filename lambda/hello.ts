const AWS = require("aws-sdk");
const docClinet = new AWS.DynamoDB.DocumentClient();

async function getUserById(userId: string) {
  const params = {
    TableName: "userDataBase",
    Key: {
      id: userId,
    },
  };

  try {
    const { Item } = await docClinet.get(params).promise();

    return Item;
  } catch (err) {
    console.log("*****", err);
  }
}

async function handler(event: any, context: any) {
  if (event.info.fieldName == "getMessage") {
    return { data: "Hello Ross" };
  }

  if (event.info.fieldName == "getUserById") {
    return await getUserById(event.arguments.userId);
  }
}

export { handler };
