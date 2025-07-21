
import os
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import fitz  # PyMuPDF

BASE_DIR = "guidelines"
os.makedirs(BASE_DIR, exist_ok=True)

WHO_URL = "https://www.who.int/publications/guidelines"
MOH_URL = "https://www.moh.gov.gh/documents/"

def download_pdfs(base_url, domain):
    print(f"Scraping {domain}...")
    try:
        response = requests.get(base_url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        for link in soup.find_all("a"):
            href = link.get("href", "")
            if ".pdf" in href:
                full_url = urljoin(base_url, href)
                filename = os.path.join(BASE_DIR, f"{domain}_{os.path.basename(href)}")
                if not os.path.exists(filename):
                    print(f"Downloading: {full_url}")
                    pdf_data = requests.get(full_url, timeout=10)
                    with open(filename, "wb") as f:
                        f.write(pdf_data.content)
                    time.sleep(2)
    except Exception as e:
        print(f"Error scraping {domain}: {e}")

def extract_text_from_pdfs():
    all_docs = []
    for file in os.listdir(BASE_DIR):
        if file.endswith(".pdf"):
            path = os.path.join(BASE_DIR, file)
            print(f"Extracting: {path}")
            try:
                doc = fitz.open(path)
                text = ""
                for page in doc:
                    text += page.get_text()
                temp_path = path.replace(".pdf", ".txt")
                with open(temp_path, "w", encoding="utf-8") as f:
                    f.write(text)
                all_docs.append(temp_path)
            except Exception as e:
                print(f"Error extracting text from {path}: {e}")
    return all_docs

def embed_into_faiss(doc_paths):
    docs = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    for path in doc_paths:
        loader = TextLoader(path, encoding="utf-8")
        docs.extend(splitter.split_documents(loader.load()))

    print("Embedding documents...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    db = FAISS.from_documents(docs, embeddings)
    db.save_local("faiss_guidelines_db")
    print("Saved FAISS DB to 'faiss_guidelines_db/'")

if __name__ == "__main__":
    download_pdfs(WHO_URL, "who")
    download_pdfs(MOH_URL, "moh")
    extracted = extract_text_from_pdfs()
    embed_into_faiss(extracted)
