import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from chroma_store import chroma_doc_store
import io
import uvicorn
from typing import Optional
import asyncio

app = FastAPI()

# Define list of origins for CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  # Assuming your React app is running on port 3000
    "https://educai.site",
    "https://www.educai.site",
    "https://delightful-field-0a372d61e.5.azurestaticapps.net"
    # Add other origins as needed
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],  # Include OPTIONS method
    allow_headers=["*"],
)

# Define models for programs and documents
class Program(BaseModel):
    name: str
    description: Optional[str] = None

class DocumentUpload(BaseModel):
    program_id: Optional[str] = Field(None, description="Program ID for categorizing the document")

class Document(BaseModel):
    content: str
    program_id: Optional[str] = Field(None, description="Program ID for categorizing the document")

class Query(BaseModel):
    query: str
    program_id: Optional[str] = Field(None, description="Program ID to search within a specific collection")


# Create or get all programs
@app.get("/programs")
async def get_programs():
    try:
        programs = await chroma_doc_store.list_programs()
        print(programs)
        return {"programs": programs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Upload endpoints for PDFs, DOCX, and text documents
@app.post("/upload/pdf")
async def upload_pdf_document(file: UploadFile = File(...), program_id: Optional[str] = Form(None)):
    try:
        print(program_id)
        print(file.content_type)
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File format not supported. Please upload a PDF file.")
        file_content = await file.read()
        file_stream = io.BytesIO(file_content)
        doc_id = await chroma_doc_store.add_document_from_pdf(file_stream, file.filename, program_id=program_id)
        return {"message": "PDF document added successfully", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/docx")
async def upload_docx_document(file: UploadFile = File(...), program_id: Optional[str] = Form(None)):
    try:
        if file.content_type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            raise HTTPException(status_code=400, detail="File format not supported. Please upload a DOCX file.")
        file_content = await file.read()
        file_stream = io.BytesIO(file_content)
        doc_id = await chroma_doc_store.add_document_from_docx(file_stream, file.filename, program_id=program_id)
        return {"message": "DOCX document added successfully", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/text")
async def upload_text_document(document: Document):
    try:
        doc_id = await chroma_doc_store.add_document(document.content, program_id=document.program_id)
        return {"message": "Text document added successfully", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Search for documents by query
@app.post("/search")
async def search_documents(query: Query):
    try:
        results = await chroma_doc_store.search_documents(query.query, program_id=query.program_id)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Delete endpoints for single or all documents in a program
@app.delete("/delete/{doc_id}")
async def delete_document(doc_id: str, program_uuid: Optional[str] = None):
    try:
        await chroma_doc_store.delete_document(doc_id, program_id=program_uuid)
        return {"message": "Document deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete")
async def delete_all_documents(program_uuid: Optional[str] = None):
    try:
        await chroma_doc_store.delete_db(program_id=program_uuid)
        return {"message": "All documents deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all documents in a program
@app.get("/documents")
async def get_documents(program_id: Optional[str] = None):
    try:
        print(program_id)
        documents = await chroma_doc_store.get_all_documents(program_id=program_id)
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Persist the chroma collections on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    for collection in chroma_doc_store.chroma_collections.values():
        await asyncio.to_thread(collection.persist)
    print("Chroma collections have been persisted.")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 2525))  # Adjust the port as needed
    )
