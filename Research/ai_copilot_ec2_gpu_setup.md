
# 🧠 AI Copilot Deployment Plan using EC2 GPU Instance (Open Source + RAG + FastAPI)

This document guides you through setting up an AI Copilot using open-source LLMs on a GPU-based EC2 instance. It includes model hosting, embedding, RAG setup, and API exposure — fully optimized for low-cost deployment.

---

## ✅ 1. Launch GPU EC2 Instance

**Recommended settings:**
- Instance type: `g4dn.xlarge` or `g5.xlarge`
- OS: Ubuntu 22.04 (Deep Learning AMI preferred)
- EBS Volume: 100 GB SSD
- Open ports: 22, 8000, 443 (API access)

---

## ✅ 2. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python & pip
sudo apt install -y python3 python3-pip git

# Clone and enter model serving UI
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui

# Install requirements
pip install -r requirements.txt

# (Optional) Install Docker if desired
# sudo apt install -y docker.io
```

---

## ✅ 3. Download and Launch a Quantized LLM

```bash
# Download a quantized model (e.g., Mistral-7B-Instruct GPTQ)
python download-model.py TheBloke/Mistral-7B-Instruct-v0.1-GPTQ

# Launch the model
python server.py --listen --model mistral-7b
```

---

## ✅ 4. Setup Embeddings + FAISS Vector Store

```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

loader = TextLoader("ghana_stgs.txt")
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(docs)

embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
faiss_db = FAISS.from_documents(chunks, embedding)
faiss_db.save_local("copilot_faiss")
```

---

## ✅ 5. RAG Pipeline with LangChain

```python
from langchain.chains import RetrievalQA
from langchain.llms import HuggingFaceTextGenInference

llm = HuggingFaceTextGenInference(
    inference_server_url="http://localhost:5000",
    max_new_tokens=512,
    temperature=0.3
)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=faiss_db.as_retriever(),
    return_source_documents=True
)
```

---

## ✅ 6. FastAPI Backend for Copilot

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Prompt(BaseModel):
    question: str

@app.post("/copilot")
def ask_ai(prompt: Prompt):
    response = qa_chain.run(prompt.question)
    return {"response": response}
```

```bash
# Run API
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## ✅ 7. EHR Integration (Frontend)

- Create a chat widget in your React/EHR UI
- Connect it to `/copilot` via fetch or axios
- Display AI responses inside the chat interface

---

## 🔐 Optimization Tips

- Use NGINX as reverse proxy (optional)
- Use EC2 spot instances if cost is critical
- Schedule EC2 shutdown when idle (via CloudWatch + Lambda)
- Use quantized models to reduce RAM/VRAM usage
