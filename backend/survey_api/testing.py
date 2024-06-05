from fastapi import Request
from fastapi.responses import RedirectResponse
from apiclient import discovery
from httplib2 import Http
from oauth2client import client, file, tools
from oauth2client.service_account import ServiceAccountCredentials
import json

SCOPES = "https://www.googleapis.com/auth/forms.body"
DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"

creds = ServiceAccountCredentials.from_json_keyfile_name(
    "credentials.json", SCOPES
)

http = creds.authorize(Http())

form_service = discovery.build(
    'forms',
    'v1',
    http=http,
    discoveryServiceUrl=DISCOVERY_DOC,
    static_discovery=False,
)

NEW_FORM = {
    "info": {
        "title": "Encuesta Docente",
    }
}

NEW_QUESTION = {
    "requests": [
        {
            "createItem": {
                "item": {
                    "title": "¿Qué tan satisfecho estás con el curso?",
                    "questionItem": {
                        "question": {
                            "required": True,
                            "choiceQuestion": {
                                "type": "RADIO",
                                "options": [
                                    {"value": "Muy satisfecho"},
                                    {"value": "Satisfecho"},
                                    {"value": "Neutral"},
                                    {"value": "Insatisfecho"},
                                    {"value": "Muy insatisfecho"},
                                ],
                                "shuffle": True,
                            },
                        }
                    },
                },
                "location": {"index": 0},
            }
        },
    ]
}

result = form_service.forms().create(body=NEW_FORM).execute()

question_setting = form_service.forms().batchUpdate(
    formId=result["formId"], body=NEW_QUESTION
).execute()

get_result = form_service.forms().get(formId=result["formId"]).execute()

print(json.dumps(get_result, indent=3))