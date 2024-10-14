import os
import logging
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
from typing import Optional, List, Dict
import asyncio

# Ensure NLTK resources are available
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Load environment variables
load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")
mongo_uri = os.getenv("MONGO_URI")
chroma_persist_dir = os.getenv("CHROMA_PERSIST_DIR", "db")

# Configure logging for this module
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  # Set to DEBUG for more detailed logs

# Create console handler with a higher log level
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)  # Set to DEBUG for more detailed logs

# Create formatter and add it to the handlers
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
ch.setFormatter(formatter)

# Add the handlers to the logger
if not logger.handlers:
    logger.addHandler(ch)

class ChromaDocumentStore:
    def __init__(self, general_collection_name="document_store_general"):
        try:
            logger.info("Initializing ChromaDocumentStore.")
            # Initialize OpenAI embeddings
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=openai_key,
                model="text-embedding-3-large",
                dimensions=1536
            )
            logger.debug("OpenAIEmbeddings initialized.")

            # Dictionary to cache Chroma instances per collection
            self.chroma_collections: Dict[str, Chroma] = {}
            
            # General collection
            self.general_collection_name = general_collection_name
            self.chroma_collections[general_collection_name] = Chroma(
                collection_name=general_collection_name, 
                embedding_function=self.embeddings,
                persist_directory=os.path.join(chroma_persist_dir, general_collection_name),
                collection_metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"General collection '{general_collection_name}' initialized.")

            # Load stop words for preprocessing
            self.stop_words = set(stopwords.words('english'))
            logger.debug("Stop words loaded for preprocessing.")

            # MongoDB client setup
            self.client = AsyncIOMotorClient(mongo_uri)
            self.db = self.client['test']
            self.collection = self.db['documents']
            logger.info("MongoDB client initialized and connected to 'test.documents' collection.")

        except Exception as e:
            logger.exception("Failed to initialize ChromaDocumentStore.")
            raise e

    def get_chroma_collection(self, program_id: Optional[str]) -> Chroma:
        """Retrieve the Chroma collection for a given program_id, or the general collection if not specified."""
        try:
            if program_id:
                collection_name = f"document_store_{program_id}"
                persist_dir = os.path.join(chroma_persist_dir, collection_name)
                if collection_name not in self.chroma_collections:
                    logger.info(f"Initializing new Chroma collection for program_id: {program_id}")
                    self.chroma_collections[collection_name] = Chroma(
                        collection_name=collection_name,
                        embedding_function=self.embeddings,
                        persist_directory=persist_dir,
                        collection_metadata={"hnsw:space": "cosine"}
                    )
                    logger.info(f"Chroma collection '{collection_name}' created and initialized.")
                else:
                    logger.debug(f"Chroma collection '{collection_name}' retrieved from cache.")
                return self.chroma_collections[collection_name]
            else:
                logger.debug(f"Using general Chroma collection '{self.general_collection_name}'.")
                return self.chroma_collections[self.general_collection_name]
        except Exception as e:
            logger.exception(f"Error retrieving Chroma collection for program_id: {program_id}")
            raise e
        
    async def list_programs(self) -> List[Dict[str, str]]:
        """List all the Chroma collections (programs) from the persisted directory."""
        try:
            programs = []
            for collection_name in os.listdir(chroma_persist_dir):
                collection_path = os.path.join(chroma_persist_dir, collection_name)
                if os.path.isdir(collection_path) and collection_name.startswith("document_store_"):
                    program_id = collection_name.replace("document_store_", "")
                    programs.append({
                        "program_id": program_id,
                        "collection_name": collection_name
                    })
            return programs
        except Exception as e:
            logger.exception("Failed to list Chroma collections (programs).")
            raise e

    def preprocess_text(self, text: str) -> str:
        """Preprocess the text by lowercasing, removing stopwords, and filtering tokens."""
        try:
            logger.debug("Preprocessing text.")
            # Convert text to lowercase
            text = text.lower()
            
            # Tokenize the text
            tokens = word_tokenize(text)
            logger.debug(f"Tokenized text into {len(tokens)} tokens.")

            # Remove punctuation and stop words
            filtered_tokens = [
                word for word in tokens 
                if word.isalnum() and word not in self.stop_words
            ]
            logger.debug(f"Filtered tokens: {len(filtered_tokens)} remaining after removing stopwords and punctuation.")

            # Remove short tokens (e.g., single letters)
            filtered_tokens = [word for word in filtered_tokens if len(word) > 1]
            logger.debug(f"Filtered tokens: {len(filtered_tokens)} remaining after removing short tokens.")

            processed_text = ' '.join(filtered_tokens)
            logger.debug("Text preprocessing completed.")
            return processed_text
        except Exception as e:
            logger.exception("Error during text preprocessing.")
            raise e

    def extract_text_from_pdf(self, file_stream: io.BytesIO) -> str:
        """Extract text from a PDF file-like object."""
        try:
            logger.info("Extracting text from PDF.")
            document = fitz.open(stream=file_stream, filetype="pdf")
            text = ""
            for page_num, page in enumerate(document, start=1):
                page_text = page.get_text()
                text += page_text
                logger.debug(f"Extracted text from page {page_num}.")
            logger.info("PDF text extraction completed.")
            return text
        except Exception as e:
            logger.exception("Failed to extract text from PDF.")
            raise e

    def extract_text_from_docx(self, file_stream: io.BytesIO) -> str:
        """Extract text from a DOCX file-like object."""
        try:
            logger.info("Extracting text from DOCX.")
            document = docx.Document(file_stream)
            text = ""
            for para_num, paragraph in enumerate(document.paragraphs, start=1):
                text += paragraph.text + "\n"
                logger.debug(f"Extracted text from paragraph {para_num}.")
            logger.info("DOCX text extraction completed.")
            return text
        except Exception as e:
            logger.exception("Failed to extract text from DOCX.")
            raise e

    async def add_document(self, document: str, program_id: Optional[str] = None, metadata: dict = None) -> str:
        """Add a single document with optional metadata to the specified collection."""
        try:
            logger.info(f"Adding document to program_id: {program_id if program_id else 'general'}.")
            # Preprocess the document
            processed_document = self.preprocess_text(document)
            logger.debug("Document preprocessed.")

            # Select the appropriate Chroma collection
            chroma_collection = self.get_chroma_collection(program_id)
            logger.debug("Chroma collection selected.")

            # Add the preprocessed text to the Chroma vector store in a separate thread
            logger.info("Adding text to Chroma vector store.")
            ids = await asyncio.to_thread(
                chroma_collection.add_texts, 
                [processed_document], 
                metadatas=[metadata] if metadata else None
            )
            doc_id = ids[0]
            logger.info(f"Document added to Chroma with doc_id: {doc_id}.")

            # Store the document ID and filename in MongoDB with program_id
            metadata = metadata or {}
            metadata["program_id"] = program_id if program_id else "general"
            await self.collection.insert_one({
                "_id": doc_id,
                "filename": metadata.get("filename", "unknown"),
                "program_id": metadata["program_id"]
            })
            logger.info(f"Document metadata stored in MongoDB for doc_id: {doc_id}.")

            return doc_id
        except Exception as e:
            logger.exception("Failed to add document.")
            raise e

    async def add_document_from_pdf(self, file_stream: io.BytesIO, filename: str, program_id: Optional[str] = None, metadata: dict = None) -> str:
        """Extract text from a PDF file-like object and add it as a document."""
        try:
            logger.info(f"Adding PDF document: {filename} to program_id: {program_id if program_id else 'general'}.")
            text = self.extract_text_from_pdf(file_stream)
            logger.debug("PDF text extracted.")
            metadata = metadata or {}
            metadata["filename"] = filename
            doc_id = await self.add_document(text, program_id=program_id, metadata=metadata)
            logger.info(f"PDF document '{filename}' added with doc_id: {doc_id}.")
            return doc_id
        except Exception as e:
            logger.exception(f"Failed to add PDF document: {filename}.")
            raise e

    async def add_document_from_docx(self, file_stream: io.BytesIO, filename: str, program_id: Optional[str] = None, metadata: dict = None) -> str:
        """Extract text from a DOCX file-like object and add it as a document."""
        try:
            logger.info(f"Adding DOCX document: {filename} to program_id: {program_id if program_id else 'general'}.")
            text = self.extract_text_from_docx(file_stream)
            logger.debug("DOCX text extracted.")
            metadata = metadata or {}
            metadata["filename"] = filename
            doc_id = await self.add_document(text, program_id=program_id, metadata=metadata)
            logger.info(f"DOCX document '{filename}' added with doc_id: {doc_id}.")
            return doc_id
        except Exception as e:
            logger.exception(f"Failed to add DOCX document: {filename}.")
            raise e

    async def delete_document(self, doc_id: str, program_id: Optional[str] = None):
        """Delete a document by its ID from the specified collection."""
        try:
            logger.info(f"Deleting document with doc_id: {doc_id} from program_id: {program_id if program_id else 'general'}.")
            document = await self.collection.find_one({
                "_id": doc_id,
                "program_id": program_id if program_id else "general"
            })
            if document:
                chroma_collection = self.get_chroma_collection(program_id)
                await asyncio.to_thread(chroma_collection.delete, [doc_id])
                logger.info(f"Document with doc_id: {doc_id} deleted from Chroma vector store.")
                await self.collection.delete_one({"_id": doc_id})
                logger.info(f"Document metadata with doc_id: {doc_id} deleted from MongoDB.")
            else:
                logger.warning(f"Document with doc_id: {doc_id} not found in program_id: {program_id if program_id else 'general'}.")
                raise ValueError("Document ID not found.")
        except Exception as e:
            logger.exception(f"Failed to delete document with doc_id: {doc_id}.")
            raise e

    async def delete_db(self, program_id: Optional[str] = None):
        """Delete all documents from the specified collection."""
        try:
            logger.info(f"Deleting all documents from program_id: {program_id if program_id else 'general'}.")
            chroma_collection = self.get_chroma_collection(program_id)
            
            # Get all the ids from the documents collection for the specified program_id
            query = {"program_id": program_id} if program_id else {"program_id": "general"}
            ids = [doc["_id"] async for doc in self.collection.find(query, {"_id": 1})]
            logger.info(f"Found {len(ids)} documents to delete in program_id: {program_id if program_id else 'general'}.")
            
            if ids:
                # Delete the documents from the Chroma vector store in a separate thread
                logger.info("Deleting documents from Chroma vector store.")
                await asyncio.to_thread(chroma_collection.delete, ids)
                logger.info("Documents deleted from Chroma vector store.")

                # Delete all documents from the MongoDB collection
                await self.collection.delete_many(query)
                logger.info(f"Documents deleted from MongoDB collection for program_id: {program_id if program_id else 'general'}.")
            else:
                logger.info(f"No documents found for program_id: {program_id if program_id else 'general'}. Nothing to delete.")
        except Exception as e:
            logger.exception(f"Failed to delete documents for program_id: {program_id if program_id else 'general'}.")
            raise e

    async def search_documents(self, query: str, program_id: Optional[str] = None, k: int = 1) -> List[Dict]:
        """Perform a similarity search on the specified Chroma vector store."""
        try:
            logger.info(f"Searching documents in program_id: {program_id if program_id else 'general'} with query: '{query}'.")
            chroma_collection = self.get_chroma_collection(program_id)
            logger.debug("Chroma collection selected for search.")

            # Perform the similarity search in a separate thread
            logger.info("Performing similarity search in Chroma vector store.")
            results = await asyncio.to_thread(
                chroma_collection.similarity_search_with_relevance_scores, 
                query, 
                k=k
            )
            logger.info(f"Similarity search completed. Found {len(results)} results.")
            return results
        except Exception as e:
            logger.exception("Failed to perform similarity search.")
            raise e

    async def get_all_documents(self, program_id: Optional[str] = None) -> List[Dict]:
        """Retrieve all documents from the specified collection."""
        try:
            logger.info(f"Retrieving all documents from program_id: {program_id if program_id else 'general'}.")
            query = {"program_id": program_id} if program_id else {"program_id": "general"}
            documents = []
            async for document in self.collection.find(query):
                documents.append({
                    "_id": str(document["_id"]),
                    "filename": document["filename"],
                    "program_id": document["program_id"]
                })
            logger.info(f"Retrieved {len(documents)} documents from MongoDB for program_id: {program_id if program_id else 'general'}.")
            return documents
        except Exception as e:
            logger.exception(f"Failed to retrieve documents for program_id: {program_id if program_id else 'general'}.")
            raise e

# Initialize a global document store instance
try:
    chroma_doc_store = ChromaDocumentStore()
    logger.info("Global ChromaDocumentStore instance initialized successfully.")
except Exception as e:
    logger.exception("Failed to initialize global ChromaDocumentStore instance.")
    raise e
