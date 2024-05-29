from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from chroma_store import chroma_doc_store

app = FastAPI()

class Document(BaseModel):
    content: str

class Query(BaseModel):
    query: str

@app.post("/upload")
async def upload_document(document: Document):
    try:
        chroma_doc_store.add_document(document.content)
        return {"message": "Document added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete")
async def delete_document(document: Document):
    try:
        chroma_doc_store.delete_document(document.content)
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_documents(query: Query):
    try:
        results = chroma_doc_store.search_documents(query.query)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
