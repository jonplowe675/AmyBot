var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Amy Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var Amy = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var moment = require('moment');
moment().format();

//=========================================================
// Bots Dialogs
//=========================================================

// Add global LUIS recognizer to bot
//var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/60cd47e5-0ec3-4416-a3a3-4c045510fc2b?subscription-key=644f045ab4784303ae10308ba3531cc0&timezoneOffset=0.0&verbose=true&q=';
//var recognizer = new builder.LuisRecognizer(model);
//var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
//Amy.dialog('/', dialog);

//dialog.matches('built'), [

Amy.dialog('/', [
    function (session) {
        //session.send should work but doesnt' work properly!
        session.clearDialogStack;
        session.send("Hi my name is Amy and welcome to the Health age calculator from AXA.");
        session.send("A couple of things before we get started, it will take us about 10 minutes to complete the calculation.");
        builder.Prompts.confirm(session,"We are going to ask some personal information about your health, is that OK?",{listStyle: builder.ListStyle["button"]});
        //bot.beginDialog('/top');
        //session.beginDialog('/top');

        //builder.Prompts.confirm(session, "Is this OK?");
    },
     
    function (session, results) {
        //check response and exit if no
        //session.userData.Prompts = results.response.confirm;
        //session.send("output" + results.response);
        //console.send("output" + results.response.confirm);

        if (!results.response) {
            session.endConversation("OK please come and talk to me again another time");
            // this should stop but it doesnt
        }
        else {
            session.beginDialog("/start");
        }
    }
]);
        
Amy.dialog("/start", [
          function (session) {
      
        session.send("The key information we will need is: "
        + "\n" + "- Height"
        + "\n" + "- Weight"
        + "\n" + "- Waist and Hip measurements"
        + "\n" + "- Blood pressure"
        + "\n" + "- Cholesterol level"
        + "\n" + "- Fasting blood glucose level");


        builder.Prompts.confirm(session,"If you are missing any of this information, we can omit"
        + " it for now and you can come back later."
        + "\n" + "Would you like to continue to estimate your health age?",{listStyle: builder.ListStyle["button"]});
},

    function (session, results) {   
        //if (session.results) {}

        if (!results.response) {
            session.endConversation("OK please come and talk to me again another time");
        }
        else {
            session.beginDialog("/gender");
        }
    }
]);
        
Amy.dialog("/gender", [
    function (session) {

        session.send("OK lets get started");

        builder.Prompts.choice(session, "What is your gender?","Male|Female",{listStyle: builder.ListStyle["button"]});
    },

    function (session, results) {
        //session.send("gender = " + results.response.entity);   
        
        //{
        builder.Prompts.text(session, "What is your date of birth? (any format)");
    },

    function (session, results) {   
        //if (results.response) {
        //var dob = moment(results.response);
        //session.send("dob is " + dob);
        //this doesn't work
        session.send(results.response);
        if (results.response == "reset") { session.reset("/")}

        session.send("That's great, now lets gather some of your body measurements");   
        //not the final version  
        builder.Prompts.number(session, "Please enter your height in metres (e.g. 1.55)");
    },

    function (session, results) {   

        if (session.userData.height) {
            session.userData.height = results.response;
            // session.send("height is" + session.userData.height);
        }

        //Weight
        builder.Prompts.number(session, 'Please enter you Weight in kg(e.g 65.5)');
     },

    function (session, results) {
 
        session.userData.weight = results.response;
        //session.beginDialog("/waistCard");
        if (results.response == "reset") { session.reset("/")}

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("How to measure your waist")
                    .text("Measure just above the belly button")
                    .images([
                        builder.CardImage.create(session, "http://www.diabetes.co.uk/images/article_images/measuring-waist.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "http://www.diabetes.co.uk/images/article_images/measuring-waist.jpg"))
            ]);

        //Waist
        session.send(msg);
        builder.Prompts.number(session, 'Please enter your Waist measurement in cm (eg 92)');
     },

    function (session, results) {
        if (results.response == "reset") { session.reset("/")}    
        session.userData.waist = results.response;

        //session.beginDialog("/hipCard");
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("How to measure the hips")
                //    .subtitle("")
                    .text("Measure the widest point around the hips")
                    .images([
                        builder.CardImage.create(session, "http://1.bp.blogspot.com/_Jp5PY2tunC0/TOtJ_3BejkI/AAAAAAAAADk/2-yHgQFCPic/s1600/hip.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "http://1.bp.blogspot.com/_Jp5PY2tunC0/TOtJ_3BejkI/AAAAAAAAADk/2-yHgQFCPic/s1600/hip.jpg"))
            ]);
        //Hip
        session.send(msg);
        builder.Prompts.number(session, 'Please enter you Hip measurement in cm (eg 94)');
     },

    function (session, results) {
        if (results.response == "reset") { session.reset("/");}
        session.userData.hip = results.response;

       
        session.beginDialog("/family");
     }
]);

/*
Amy.dialog('/waistCard', [
    function (session) {
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("How to measure your waist")
                    .text("Measure just above the belly button")
                    .images([
                        builder.CardImage.create(session, "http://www.diabetes.co.uk/images/article_images/measuring-waist.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "http://www.diabetes.co.uk/images/article_images/measuring-waist.jpg"))
            ]);
        //session.endDialog(msg);
    }
]);
*/

/*Amy.dialog('/hipCard', [
    function (session) {
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("How to measure the hips")
                    .subtitle("Measure the widest point around the hips")
                    .text("Please enter your hip measurement. e.g. 81cm")
                    .images([
                        builder.CardImage.create(session, "http://1.bp.blogspot.com/_Jp5PY2tunC0/TOtJ_3BejkI/AAAAAAAAADk/2-yHgQFCPic/s1600/hip.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "http://1.bp.blogspot.com/_Jp5PY2tunC0/TOtJ_3BejkI/AAAAAAAAADk/2-yHgQFCPic/s1600/hip.jpg"))
            ]);
        //session.endDialog(msg);
    }
]);
*/
        
Amy.dialog("/family", [
    function (session) {
         //session.userData.hip = results.response;

        //family
        session.send("That's great, thanks");
        session.send("I now need to ask some health questions about your parents and any brothers or sisters");
        builder.Prompts.confirm(session, 'Have any of them suffered from:'
        + '\n' + '- a heart attack ?'
        + '\n' + '- angina ?'
        + '\n' + '- a stroke ?',{listStyle: builder.ListStyle["button"]});
     },

    function (session, results) {
        if (results.response == "reset") { session.reset("/");}
        session.userData.familyhistory = results.response;
        if (session.userData.familyhistory) {
            session.send("I am very sorry to hear that.  I need to ask some more questions");
            session.beginDialog("/familyhistory");
        }
        else {
            session.send("OK thanks, I'll move on")
            session.beginDialog("/blood");
        }
    }
]);
        
Amy.dialog("/familyhistory", [
    function (session) {
        builder.Prompts.choice(session, "Is this for your ", "Father|Mother|Brother|Sister|I'm done", {listStyle: builder.ListStyle["button"]});
     },

    function (session, results) {

        var person = results.response.entity;

        switch (person) {
        case "Father":
            session.beginDialog("/attackage");  
            
            break;
        case "Mother":
            session.beginDialog("/attackage");
            
            break;
        case "Brother":
            session.beginDialog("/attackage");
            
            break;
        case "Sister":
            session.beginDialog("/attackage");
            
            break;
        case "I'm done":
            session.beginDialog("/blood");
            break;
          }
     }
]);

Amy.dialog("/attackage", [
    function (session, results) {
        
        //attack age
        builder.Prompts.number(session, "At what age did this happen?");
     },

     function (session, results) {
        if (results.response == "reset") { session.reset("/")}
        //session.userData.family = results.response;   
    session.replaceDialog("/familyhistory");
        //bot.end
     }
]);

Amy.dialog("/blood", [
    function (session, results) {
       
        //Blood pressure
        //session.send(session, "Please enter you Blood pressure level in ml/hg");
        session.send("Getting there now."
        + "\n" + "Next I need to know your Blood pressure readings.");

        //Systolic pressure
        builder.Prompts.number(session, 'Please enter your systolic reading');
     },

    function (session, results) {

        session.userData.systolic = results.response;

        //Diastolic pressure
        builder.Prompts.number(session, 'Please enter your diastolic reading');
     },

    function (session, results) {
        if (results.response == "reset") { session.reset("/");}
        session.userData.diatolic = results.response;

        //Cholesterol level
        builder.Prompts.number(session, 'Please enter you Cholesterol level');
     },

    function (session, results) {

        session.userData.cholesterol = results.response;

        builder.Prompts.choice(session, "Complete full question set or show your health age now?","Full Set|Show Now",{listStyle: builder.ListStyle["button"]});
    },
    function (session, results) {
        if (results.response == "reset") { session.reset("/");}
        session.userData.gotoend = results.response;

        //go to end regardless
        //session.beginDialog("/healthAge");
        session.send("Thank you for providing all the information.  Your health age is 39 and we think you could reduce this by 5 years." );
        session.send("For example, you might like to go swimming once a week?");
        session.endConversation();
        session.clearDialogStack();
        
        //can't being again here else it will display all the text
        //session.beginDialog("/");
    }
]);
/*    Amy.dialog("/healthAge", [
    function (session, results) {
        person
        //attack age
        session.send(session, "Thank you for providing all the information.  Your health age is 39 and we think you could reduce this by 5 years." );
        session.send(session, "For example, you might like to go swimming once a week?");
        session.endConversation();
        }
]);*/
     
        
 

