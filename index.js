/* eslint-disable  func-names */
/* eslint-disable  no-console */

import { SkillBuilders } from 'ask-sdk';
import { config } from 'aws-sdk';
config.update({region: 'us-east-1'});
import { getRandomItem } from './alexa-cookbook.js';
import alexaPlusUnityClass from 'alexaplusunity';
var alexaPlusUnity = alexaPlusUnityClass("pub-c-e8eba3be-3028-41e2-90a1-cae458e5866c", "sub-c-9b5d8458-9757-11e9-8994-3e832ec25d8b", true); //Third parameter enables verbose logging

const speechOutputs = {
  launch: {
    speak: {
      setup: [
        " Before we begin playing, we need to go through some setup. I have sent your player ID to your Alexa app. You will need to input this ID in the game when prompted."
      ],
      normal: [
        "Welcome to the Unity Plus Alexa Test!"  
      ],
    },
    reprompt: [
      " What shall we do?"
    ]
  },
  errors: {
    speak: [
      "Error!",
      "There was an issue!"
    ],
    reprompt: [
      " Please try again.",
      " Please try again later."
    ]
  },
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;

    var attributes = await attributesManager.getPersistentAttributes() || {};
    attributes = await setAttributes(attributes);
    
    if(attributes == null) {
      return ErrorHandler.handle(handlerInput, "Error setting attributes... Check logs");
    }

    var reprompt = getRandomItem(speechOutputs.launch.reprompt);
    var speechText = getRandomItem(speechOutputs.launch.speak.normal);
    
    var response = responseBuilder
        .speak(speechText + reprompt)
        .reprompt(reprompt)
        .getResponse();

    if(attributes.SETUP_STATE == "STARTED") {
      var launchSetUpResult = await launchSetUp(speechText, reprompt, handlerInput, attributes);
      attributes = launchSetUpResult.attributes;
      response = launchSetUpResult.response;
    }
	
    attributesManager.setPersistentAttributes(attributes);
    await attributesManager.savePersistentAttributes();
    return response;
  }
};

const InProgressFlipSwitchIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'FlipSwitchIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
}

const CompletetedFlipSwitchIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'FlipSwitchIntent';
  },
  async handle(handlerInput) {
    const state = handlerInput.requestEnvelope.request.intent.slots.State.value;

    const speechText = 'Light is now ' + state + '!';
    const reprompt = ' What\'s next?';

    var attributes = await handlerInput.attributesManager.getPersistentAttributes()

    var payloadObj = { 
      type: "State",
      message: state
    };

    var response = await alexaPlusUnity.publishMessage(payloadObj, attributes.PUBNUB_CHANNEL).then((data) => {
      return handlerInput.responseBuilder
        .speak(speechText + reprompt)
        .reprompt(reprompt)
        .getResponse();
    }).catch((err) => {
      return ErrorHandler.handle(handlerInput, err);
    });
    return response;
  }
};

const InProgressChangeColorIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'ChangeColorIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
}

const CompletedChangeColorIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ChangeColorIntent';
  },
  async handle(handlerInput) {
    const color = handlerInput.requestEnvelope.request.intent.slots.Color.value;

    const speechText = 'Light is now ' + color + '!';
    const reprompt = ' What\'s next?';

    var attributes = await handlerInput.attributesManager.getPersistentAttributes();

    var payloadObj = { 
      type: "Color",
      message: color
    };

    var response = await alexaPlusUnity.publishMessage(payloadObj, attributes.PUBNUB_CHANNEL).then((data) => {
      return handlerInput.responseBuilder
        .speak(speechText + reprompt)
        .reprompt(reprompt)
        .getResponse();
    }).catch((err) => {
      return ErrorHandler.handle(handlerInput, err);
    });

    return response;
  },
};

const GetColorIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetColorIntent';
  },
  async handle(handlerInput) {
    var attributes = await handlerInput.attributesManager.getPersistentAttributes();
    
    const speechText = 'The light is currently ' + attributes.color + '!';
    const reprompt = ' What\'s next?';
    
    return handlerInput.responseBuilder
        .speak(speechText + reprompt)
        .reprompt(reprompt)
        .getResponse();
  }
}

const InProgressGetObjectInDirectionIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'GetObjectInDirectionIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
}

const CompletedGetObjectInDirectionIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetObjectInDirectionIntent';
  },
  async handle(handlerInput) {
    const direction = handlerInput.requestEnvelope.request.intent.slots.Direction.value;
    var attributes = await handlerInput.attributesManager.getPersistentAttributes();

    var payloadObj = { 
      type: "GetObject",
      message: direction
    };

    var response = await alexaPlusUnity.publishMessageAndListenToResponse(payloadObj, attributes.PUBNUB_CHANNEL, 4000).then((data) => {
      const speechText = 'Currently, ' + data.message.object + ' is ' + direction + ' you!';
      const reprompt = ' What\'s next?';
      return handlerInput.responseBuilder
        .speak(speechText + reprompt)
        .reprompt(reprompt)
        .getResponse();
    }).catch((err) => {
      return ErrorHandler.handle(handlerInput, err);
    });
    
    return response;
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say turn on to turn on the pump!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Alexa Plus Unity Test', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Alexa Plus Unity Test', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    var errorReprompt = getRandomItem(speechOutputs.errors.reprompt);
    var errorSpeech = getRandomItem(speechOutputs.errors.speak) + errorReprompt;
    return handlerInput.responseBuilder
      .speak(errorSpeech)
      .reprompt(errorReprompt)
      .getResponse();
  },
};

const skillBuilder = SkillBuilders.standard();

export const handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressFlipSwitchIntentHandler,
    CompletetedFlipSwitchIntentHandler,
    InProgressChangeColorIntentHandler,
    CompletedChangeColorIntentHandler,
    GetColorIntentHandler,
    InProgressGetObjectInDirectionIntentHandler,
    CompletedGetObjectInDirectionIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName('AlexaPlusUnityTest')
  .withAutoCreateTable(true)
  .lambda();

async function launchSetUp(speechText, reprompt, handlerInput, attributes) {
  const responseBuilder = handlerInput.responseBuilder;

  speechText += getRandomItem(speechOutputs.launch.speak.setup) + reprompt;
  var response = await alexaPlusUnity.addChannelToGroup(attributes.PUBNUB_CHANNEL, "AlexaPlusUnityTest").then(async (data) => {
    var responseToReturn = responseBuilder
      .speak(speechText)
      .reprompt(reprompt)
      .withSimpleCard('Alexa Plus Unity', "Here is your Player ID: " + attributes.PUBNUB_CHANNEL)
      .getResponse();

    var userId = handlerInput.requestEnvelope.session.user.userId;
    return await sendUserId(userId, attributes, handlerInput, responseToReturn);
  }).catch((err) => {
    return ErrorHandler.handle(handlerInput, err);
  });
  var result = {
    response: response,
    attributes: attributes
  }
  return result;
}

async function sendUserId(userId, attributes, handlerInput, response) {
  var payloadObj = { 
    type: "AlexaUserId",
    message: userId
  };
  return await alexaPlusUnity.publishMessage(payloadObj, attributes.PUBNUB_CHANNEL).then((data) => {
    return response;
  }).catch((err) => {
    return ErrorHandler.handle(handlerInput, err);
  });
}

async function setAttributes(attributes) {
  if (Object.keys(attributes).length === 0) {
    attributes.SETUP_STATE = "STARTED";
    var newChannel = await alexaPlusUnity.uniqueQueueGenerator("AlexaPlusUnityTest");
    
    if(newChannel != null) {
      attributes.PUBNUB_CHANNEL = newChannel;
    } else {
      return null;
    }
    //Add more attributes here that need to be initalized at skill start
  }
  return attributes;
}