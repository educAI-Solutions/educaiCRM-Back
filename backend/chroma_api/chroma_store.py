import os
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from dotenv import load_dotenv
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import fitz  # PyMuPDF for PDF processing
import docx  # python-docx for DOCX processing
import io
from motor.motor_asyncio import AsyncIOMotorClient  # MongoDB driver

# Ensure NLTK resources are available
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")
mongo_uri = os.getenv("MONGO_URI")

class ChromaDocumentStore:
    def __init__(self, collection_name="document_store"):
        # Initialize OpenAI embeddings
        self.embeddings = OpenAIEmbeddings(openai_api_key=openai_key, model="text-embedding-3-large", dimensions=1536)
        # Initialize Chroma vector store with the embedding function
        self.doc_store = Chroma(
            collection_name=collection_name, 
            embedding_function=self.embeddings,
            persist_directory="db",  # Store embeddings for persistence
            collection_metadata={"hnsw:space": "cosine"}
        )
        
        # Load stop words for preprocessing
        self.stop_words = set(stopwords.words('english'))
        
        # MongoDB client setup
        self.client = AsyncIOMotorClient(mongo_uri)
        self.db = self.client['test']
        self.collection = self.db['documents']

    def preprocess_text(self, text):
        # Convert text to lowercase
        text = text.lower()
        
        # Tokenize the text
        tokens = word_tokenize(text)
        
        # Remove punctuation and stop words
        filtered_tokens = [
            word for word in tokens 
            if word.isalnum() and word not in self.stop_words
        ]
        
        # Remove short tokens (e.g., single letters)
        filtered_tokens = [word for word in filtered_tokens if len(word) > 1]
        
        return ' '.join(filtered_tokens)
    
    def extract_text_from_pdf(self, file_stream):
        # Extract text from a PDF file-like object
        document = fitz.open(stream=file_stream, filetype="pdf")
        text = ""
        for page in document:
            text += page.get_text()
        return text

    def extract_text_from_docx(self, file_stream):
        # Extract text from a DOCX file-like object
        document = docx.Document(file_stream)
        text = ""
        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"
        return text

    async def add_document(self, document: str, metadata: dict = None):
        """Add a single document with optional metadata."""
        # Preprocess the document
        processed_document = self.preprocess_text(document)
        
        # Add the preprocessed text to the Chroma vector store
        ids = self.doc_store.add_texts([processed_document], metadatas=[metadata] if metadata else None)
        doc_id = ids[0]
        
        # Store the document ID and filename in MongoDB
        await self.collection.insert_one({"_id": doc_id, "filename": metadata.get("filename", "unknown")})
        
        return doc_id

    async def add_document_from_pdf(self, file_stream: io.BytesIO, filename: str, metadata: dict = None):
        """Extract text from a PDF file-like object and add it as a document."""
        text = self.extract_text_from_pdf(file_stream)
        metadata = metadata or {}
        metadata["filename"] = filename
        return await self.add_document(text, metadata)

    async def add_document_from_docx(self, file_stream: io.BytesIO, filename: str, metadata: dict = None):
        """Extract text from a DOCX file-like object and add it as a document."""
        text = self.extract_text_from_docx(file_stream)
        metadata = metadata or {}
        metadata["filename"] = filename
        return await self.add_document(text, metadata)

    async def delete_document(self, doc_id: str):
        """Delete a document by its ID."""
        document = await self.collection.find_one({"_id": doc_id})
        if document:
            self.doc_store.delete([doc_id])
            await self.collection.delete_one({"_id": doc_id})
        else:
            raise ValueError("Document ID not found.")
        
    async def delete_db(self):
        # Get all the ids from the documents collection
        ids = [doc["_id"] async for doc in self.collection.find({}, {"_id": 1})]
        print(ids)
        # Delete the documents from the Chroma vector store
        self.doc_store.delete(ids)
        print("Deleted documents from the Chroma vector store.")
        # Delete all documents from the MongoDB collection
        await self.collection.delete_many({})
        print("Deleted documents from the MongoDB collection.")

    def search_documents(self, query: str, k=1):
        # Perform a similarity search on the Chroma vector store
        return self.doc_store.similarity_search_with_relevance_scores(query, k=k)
    
    async def get_all_documents(self):
        documents = []
        async for document in self.collection.find({}):
            documents.append({"_id": str(document["_id"]), "filename": document["filename"]})
        return documents


# Initialize a global document store instance
chroma_doc_store = ChromaDocumentStore()
