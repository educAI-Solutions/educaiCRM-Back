from fastapi import Request
from fastapi.responses import RedirectResponse
from apiclient import discovery
from httplib2 import Http
from oauth2client import client, file, tools
from oauth2client.service_account import ServiceAccountCredentials

SCOPES = "https://www.googleapis.com/auth/forms.body"
DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"

def get_form_service():
    store = file.Storage("token.json")
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets("client_secret.json", SCOPES)
        creds = tools.run_flow(flow, store)
    form_service = discovery.build(
        "forms",
        "v1",
        http=creds.authorize(Http()),
        discoveryServiceUrl=DISCOVERY_DOC,
        static_discovery=False,
    )
    return form_service

def create_form():
    form_service = get_form_service()

    # Request body for creating a form
    NEW_FORM = {
        "info": {
            "title": "Quickstart form",
        }
    }

    # Request body to add a multiple-choice question
    NEW_QUESTION = {
        "requests": [
            {
                "createItem": {
                    "item": {
                        "title": (
                            "In what year did the United States land a mission on"
                            " the moon?"
                        ),
                        "questionItem": {
                            "question": {
                                "required": True,
                                "choiceQuestion": {
                                    "type": "RADIO",
                                    "options": [
                                        {"value": "1965"},
                                        {"value": "1967"},
                                        {"value": "1969"},
                                        {"value": "1971"},
                                    ],
                                    "shuffle": True,
                                },
                            }
                        },
                    },
                    "location": {"index": 0},
                }
            }
        ]
    }

    # Creates the initial form
    result = form_service.forms().create(body=NEW_FORM).execute()

    # Adds the question to the form
    question_setting = (
        form_service.forms()
        .batchUpdate(formId=result["formId"], body=NEW_QUESTION)
        .execute()
    )

    # Prints the result to show the question has been added
    get_result = form_service.forms().get(formId=result["formId"]).execute()
    print(get_result)

    return {"message": "Form created successfully"}

def authorize(request: Request):
    flow = client.flow_from_clientsecrets(
        "client_secret.json",
        SCOPES,
        redirect_uri=request.url_for("oauth2callback")
    )
    auth_url, _ = flow.authorization_url(prompt="consent")
    return RedirectResponse(auth_url)

def oauth2callback(request: Request):
    flow = client.flow_from_clientsecrets(
        "client_secret.json",
        SCOPES,
        redirect_uri=request.url_for("oauth2callback")
    )
    authorization_response = request.query_params.get("code")
    flow.fetch_token(code=authorization_response)
    creds = flow.credentials
    store = file.Storage("token.json")
    store.put(creds)
    return RedirectResponse(url="/")