import os
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from dotenv import load_dotenv
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Ensure NLTK resources are available
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")

class ChromaDocumentStore:
    def __init__(self, collection_name="document_store"):
        self.embeddings = OpenAIEmbeddings(openai_api_key=openai_key)
        self.doc_store = Chroma(
            collection_name=collection_name, 
            embedding_function=self.embeddings,
            persist_directory="db"  # Store embeddings for persistence
        )
        self.stop_words = set(stopwords.words('english'))

    def preprocess_text(self, text):
        tokens = word_tokenize(text)
        tokens = [word.lower() for word in tokens if word.isalnum()]
        filtered_tokens = [word for word in tokens if word not in self.stop_words]
        return ' '.join(filtered_tokens)

    def add_document(self, documents: list, metadatas: list = None):
        """Add multiple documents at once (with optional metadata)."""
        processed_documents = [self.preprocess_text(doc) for doc in documents]
        self.doc_store.add_texts(processed_documents, metadatas=metadatas) 

    def search_documents(self, query: str, k=3):  # Changed limit to k (standard in Chroma)
        return self.doc_store.similarity_search(query, k=k)  # Use correct search method

chroma_doc_store = ChromaDocumentStore()
