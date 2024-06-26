import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chroma_store import chroma_doc_store
import io
import uvicorn

app = FastAPI()


origins = [
    "http://localhost",
    "http://localhost:3000",  # Assuming your React app is running on port 3000
    "https://educai.site",
    "https://www.educai.site",
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],  # Include OPTIONS method
    allow_headers=["*"],
)

class Document(BaseModel):
    content: str

class Query(BaseModel):
    query: str

@app.post("/upload/pdf")
async def upload_pdf_document(file: UploadFile = File(...)):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="File format not supported. Please upload a PDF file.")
        file_content = await file.read()
        file_stream = io.BytesIO(file_content)
        doc_id = await chroma_doc_store.add_document_from_pdf(file_stream, file.filename)
        return {"message": "PDF document added successfully", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/docx")
async def upload_docx_document(file: UploadFile = File(...)):
    try:
        if file.content_type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            raise HTTPException(status_code=400, detail="File format not supported. Please upload a DOCX file.")
        file_content = await file.read()
        file_stream = io.BytesIO(file_content)
        doc_id = await chroma_doc_store.add_document_from_docx(file_stream, file.filename)
        return {"message": "DOCX document added successfully", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/text")
async def upload_text_document(document: Document):
    try:
        doc_id = await chroma_doc_store.add_document(document.content)
        return {"message": "Text document added successfully", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_documents(query: Query):
    try:
        results = chroma_doc_store.search_documents(query.query)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/delete/{doc_id}")
async def delete_document(doc_id: str):
    try:
        await chroma_doc_store.delete_document(doc_id)
        return {"message": "Document deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete")
async def delete_all_documents():
    try:
        await chroma_doc_store.delete_db()
        return {"message": "All documents deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/documents")
async def get_documents():
    try:
        documents = await chroma_doc_store.get_all_documents()
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 2525))  # Adjust the port as needed
    )
