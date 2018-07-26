const DialogflowAPI = require('dialogflow');
const SessionIDStore = require("./sessionIDStore");

class Dialogflow {

    constructor(telegramUserID) {
        this.sessionID = SessionIDStore.get(telegramUserID); // gets the current or produce new ID
        this.projectID = process.env.DIALOGFLOW_PROJECT_ID;
        this.languageCode = 'en-US';
        this.sessionClient = new DialogflowAPI.SessionsClient();
    }

    async detectIntent(text) {
        if (!text) {
            throw new Error("Query input text can't be empty!");
        }

        let sessionPath = this.sessionClient.sessionPath(this.projectID, this.sessionID);

        // query request.
        let request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: text,
                    languageCode: this.languageCode
                },
            },
        };

        const responses = await this.sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        return result;

    }

}

module.exports=Dialogflow;