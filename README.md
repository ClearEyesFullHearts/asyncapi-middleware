# asyncapi-sub-middleware
Create routes and validation for an express-like async server

## Summary
This module will automatically adds parameters and message validators to your express-like async application (see [kafka-express](https://www.npmjs.com/package/kafka-express) or [rabbitmq-express](https://www.npmjs.com/package/rabbitmq-express)) from an [AsyncAPI](https://www.asyncapi.com/docs/reference/specification/v2.6.0) definition file. It will also mount your own middlewares if asked.  
Freely inspired by [swagger-tools](https://www.npmjs.com/package/swagger-tools)  
  
# Usage
```javascript
const rabbitserver = require('rabbitmq-express');
const asyncApi = require('asyncapi-sub-middleware');

const app = rabbitserver();

const doc = fs.readFileSync('./lib/myAsyncAPIFile.yaml', 'utf8');

await asyncApi(app, doc, { stubMiddleware: true });

app.listen(options);
```
This will validate and parse your AsyncAPI file (`myAsyncAPIFile.yaml`), then create a route for each channel with a publish operation defined in that file. The validation and parsing of the file is done by [@asyncapi/parser](https://www.npmjs.com/package/@asyncapi/parser).  
This route will validate the parameters of the route and the body of the message with the parameter and payload schemas defined in the file and add them to the `api` property of the request object. The validation itself is done by [ajv](https://www.npmjs.com/package/ajv).  
It will then add a "stub" middleware on each route.  
  
# Documentation
## asyncapi-sub-middleware
The module exports a function that takes your express-like application, an AsyncAPI document and options.  
```javascript
require('asyncapi-sub-middleware')(application, document, options)
```
### `application`
Any application using middlewares can be used, i.e. there should be a `.use(route, [middlewares])` function available.  
The request object fed into the middlewares should have a `params` and a `body` property to validate against the schema.  
The application is responsible for the connection to the actual async server (rabbitmq, kafka, etc...)  
### `document`
The AsyncAPI file. It accepts 3 formats:  
  
`string` (reading directly from the file)  
```javascript
const document = fs.readFileSync('./lib/myAsyncAPIFile.yaml', 'utf8');
```
`JSON` (the file converted to a JSON object) 
```javascript
const yaml = require('js-yaml');
const document = yaml.load(fs.readFileSync('./lib/myAsyncAPIFile.yam', 'utf8'));
```
`AsyncAPIDocument` (the file parsed through [@asyncapi/parser](https://www.npmjs.com/package/@asyncapi/parser)) 
```javascript
const { parse } = require('@asyncapi/parser');
const document = await parse(fs.readFileSync('./lib/myAsyncAPIFile.yam', 'utf8'));
```
### `options`
An optional object. All properties are optional too.  
```javascript
// these are the default values
const {
  tag = '',
  requireController = true,
  controllers = '',
  stubMiddleware = false,
} = options;
```
If `tag` is set, only the tagged publish operations will be mounted.  
If `requireController` is set to false, only the 2 validation middlewares will be mounted and all controller's related infos will be ignored.  
`controllers` should be the path to a directory/file defining the controller middlewares for each publish operations.  
If `stubMiddleware` is set to true, a stub middleware will be mounted on each route if a controller middleware is not defined.  

## ValidationError
The module exports the error class that is thrown in case of a validation error.    
```javascript
const { ValidationError } = require('asyncapi-sub-middleware');
if (err instanceof ValidationError) // That's our error.
```
  
# Controller Middleware
To be able to automatically mount your controller middlewares you need to provide a combination of information.  
  
First, in the options object `requireController` should be set to true (it is the default.)  
  
Second, you need to provide the path to one or more files containing your middlewares. For that we use the `controllers` property of the options object and an optional extension in the AsyncAPI file on the publish operation:  
```
x-operation-controller
```
  
Third, you need to define the `operationId` of the publish operation as the name of a function on the file defined by the combination of the `controllers` and the `x-operation-controller`.  

## example
The options object:
```javascript
const options = {
  tag = 'myApp',
  requireController = true,
  controllers = 'src/api',
  stubMiddleware = false,
};
```
The AsyncAPI file:
```yaml
channels:
  topic.{id}.key:
    parameters:
      id:
        $ref: '#/components/parameters/myid'
    publish:
      tags:
        - name: myApp
      operationId: nameOfMyMiddleware
      x-operation-controller: 'topic/myControllerFile'
      message:
        $ref: '#/components/messages/mymessage'
```
In this example you should have a "required-able" file on the path defined by the combination of `controllers` and the `x-operation-controller`, i.e. `src/api/topic/myControllerFile.js`.  
This file should export a function by the name of the `operationId`, i.e `nameOfMyMiddleware`  
  
The controller file for this operation (`src/api/topic/myControllerFile.js`):
```javascript
module.exports = {
  nameOfMyMiddleware: (req, res, next) => {
    const { api: { params, body } } = req;
    //do something
  }
}
```
OR
```javascript
module.exports = {
  nameOfMyMiddleware: () => {
    return [
      (req, res, next) => {
        const { api: { params, body } } = req;
        //do something
      },
      (err, req, res, next) => {
        //do something in case of an error
      }
    ]
  }
}
```
