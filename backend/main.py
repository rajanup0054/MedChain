from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import sqlite3
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import google.generativeai as genai
import re

# Load environment variables
load_dotenv()

app = FastAPI(title="MedChain Backend API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    model = None
    print("Warning: GEMINI_API_KEY not found. AI features will use mock responses.")

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./medchain.db")

def init_db():
    conn = sqlite3.connect("medchain.db")
    cursor = conn.cursor()
    
    # Create inventory table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            drug_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            batch_id TEXT,
            expiry_date DATE,
            manufacturer TEXT,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(location, drug_name)
        )
    """)
    
    # Create reorders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reorders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            drug_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            location TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expected_delivery DATE,
            supplier TEXT
        )
    """)
    
    # Create demand_predictions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS demand_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            drug_name TEXT NOT NULL,
            predicted_demand INTEGER NOT NULL,
            confidence REAL NOT NULL,
            prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Insert sample data
    sample_data = [
        ("Central Hospital", "Paracetamol 500mg", 1250, "PC-2024-001", "2025-12-31", "PharmaCorp Ltd"),
        ("Central Hospital", "Amoxicillin 250mg", 800, "ML-2024-045", "2025-08-15", "MediLab Inc"),
        ("Rural Clinic A", "Paracetamol 500mg", 480, "PC-2024-002", "2025-11-20", "PharmaCorp Ltd"),
        ("Rural Clinic A", "Aspirin 325mg", 25, "GP-2024-089", "2024-12-31", "Global Pharma"),
        ("Rural Clinic A", "Ciprofloxacin 500mg", 15, "AB-2024-067", "2024-12-25", "AntiBio Labs"),
        ("Regional Hospital", "Metformin 500mg", 890, "DC-2024-156", "2025-11-28", "DiabetesCare Ltd"),
        ("City Pharmacy", "Ibuprofen 400mg", 75, "HT-2024-128", "2024-12-20", "HealthTech Solutions"),
        ("City Pharmacy", "Aspirin 325mg", 8, "GP-2024-090", "2024-12-31", "Global Pharma"),
        ("Medical Warehouse", "Paracetamol 500mg", 2100, "PC-2023-123", "2025-06-15", "PharmaCorp Ltd"),
    ]
    
    cursor.executemany("""
        INSERT OR IGNORE INTO inventory (location, drug_name, quantity, batch_id, expiry_date, manufacturer)
        VALUES (?, ?, ?, ?, ?, ?)
    """, sample_data)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic models
class InventoryUpdate(BaseModel):
    location: str
    drugName: str
    quantity: int
    timestamp: Optional[str] = None

class ReorderRequest(BaseModel):
    drugName: str
    threshold: int
    location: Optional[str] = None

class ExpiryQuery(BaseModel):
    days: Optional[int] = 0
    location: Optional[str] = None

class BatchVerification(BaseModel):
    batchId: str

class ChatMessage(BaseModel):
    message: str
    language: Optional[str] = "en"

class InventoryResponse(BaseModel):
    location: str
    drugs: List[dict]
    totalItems: int
    lastSync: str

class DemandPrediction(BaseModel):
    drug: str
    predicted_demand: int
    confidence: float
    trend: str

class PredictionResponse(BaseModel):
    predictions: List[DemandPrediction]
    generated_at: str

# Routes
@app.get("/")
async def root():
    return {"message": "MedChain Backend API", "version": "1.0.0", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/inventory/update")
async def update_inventory(inventory: InventoryUpdate):
    try:
        conn = sqlite3.connect("medchain.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO inventory (location, drug_name, quantity, last_updated)
            VALUES (?, ?, ?, ?)
        """, (inventory.location, inventory.drugName, inventory.quantity, datetime.now()))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Inventory updated successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inventory/{location}")
async def get_inventory(location: str):
    try:
        conn = sqlite3.connect("medchain.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT drug_name, quantity, batch_id, expiry_date, manufacturer, last_updated
            FROM inventory
            WHERE location = ?
        """, (location,))
        
        rows = cursor.fetchall()
        conn.close()
        
        drugs = [
            {
                "name": row[0],
                "quantity": row[1],
                "batchId": row[2] or "N/A",
                "expiryDate": row[3] or "N/A",
                "manufacturer": row[4] or "N/A",
                "lastUpdated": row[5]
            }
            for row in rows
        ]
        
        return {
            "location": location,
            "drugs": drugs,
            "totalItems": len(drugs),
            "lastSync": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inventory/all")
async def get_all_inventory():
    try:
        conn = sqlite3.connect("medchain.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT location, drug_name, quantity, batch_id, expiry_date, manufacturer, last_updated
            FROM inventory
            ORDER BY location, drug_name
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        # Group by location
        locations = {}
        for row in rows:
            location = row[0]
            if location not in locations:
                locations[location] = []
            
            locations[location].append({
                "name": row[1],
                "quantity": row[2],
                "batchId": row[3] or "N/A",
                "expiryDate": row[4] or "N/A", 
                "manufacturer": row[5] or "N/A",
                "lastUpdated": row[6]
            })
        
        return {
            "locations": locations,
            "totalLocations": len(locations),
            "lastSync": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inventory/expired")
async def get_expired_drugs(days: int = 0, location: Optional[str] = None):
    try:
        conn = sqlite3.connect("medchain.db")
        cursor = conn.cursor()
        
        check_date = datetime.now() + timedelta(days=days)
        
        query = """
            SELECT location, drug_name, quantity, batch_id, expiry_date, manufacturer
            FROM inventory
            WHERE expiry_date <= ?
        """
        params = [check_date.strftime('%Y-%m-%d')]
        
        if location:
            query += " AND location = ?"
            params.append(location)
            
        query += " ORDER BY expiry_date ASC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        expired_drugs = [
            {
                "location": row[0],
                "name": row[1],
                "quantity": row[2],
                "batchId": row[3],
                "expiryDate": row[4],
                "manufacturer": row[5],
                "daysUntilExpiry": (datetime.strptime(row[4], '%Y-%m-%d') - datetime.now()).days if row[4] else None
            }
            for row in rows if row[4]  # Only include drugs with expiry dates
        ]
        
        return {
            "expiredDrugs": expired_drugs,
            "count": len(expired_drugs),
            "checkDate": check_date.strftime('%Y-%m-%d'),
            "generatedAt": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inventory/low-stock")
async def get_low_stock(threshold: int = 50, location: Optional[str] = None):
    try:
        conn = sqlite3.connect("medchain.db")
        cursor = conn.cursor()
        
        query = """
            SELECT location, drug_name, quantity, batch_id, expiry_date, manufacturer
            FROM inventory
            WHERE quantity < ?
        """
        params = [threshold]
        
        if location:
            query += " AND location = ?"
            params.append(location)
            
        query += " ORDER BY quantity ASC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        low_stock_drugs = [
            {
                "location": row[0],
                "name": row[1],
                "quantity": row[2],
                "batchId": row[3],
                "expiryDate": row[4],
                "manufacturer": row[5],
                "status": "critical" if row[2] < 10 else "low" if row[2] < 25 else "moderate"
            }
            for row in rows
        ]
        
        return {
            "lowStockDrugs": low_stock_drugs,
            "count": len(low_stock_drugs),
            "threshold": threshold,
            "generatedAt": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/inventory/reorder")
async def trigger_reorder(reorder: ReorderRequest):
    try:
        conn = sqlite3.connect("medchain.db")
        cursor = conn.cursor()
        
        # Check current stock
        query = """
            SELECT location, quantity, manufacturer
            FROM inventory
            WHERE drug_name LIKE ?
        """
        if reorder.location:
            query += " AND location = ?"
            cursor.execute(query, (f"%{reorder.drugName}%", reorder.location))
        else:
            cursor.execute(query, (f"%{reorder.drugName}%",))
            
        rows = cursor.fetchall()
        
        reorders_created = []
        for row in rows:
            location, quantity, manufacturer = row
            
            if quantity < reorder.threshold:
                # Calculate recommended order quantity
                recommended_qty = max(500, reorder.threshold * 2)
                expected_delivery = datetime.now() + timedelta(days=5)
                
                # Insert reorder
                cursor.execute("""
                    INSERT INTO reorders (drug_name, quantity, location, expected_delivery, supplier)
                    VALUES (?, ?, ?, ?, ?)
                """, (reorder.drugName, recommended_qty, location, expected_delivery.strftime('%Y-%m-%d'), manufacturer))
                
                reorders_created.append({
                    "location": location,
                    "currentStock": quantity,
                    "orderQuantity": recommended_qty,
                    "supplier": manufacturer,
                    "expectedDelivery": expected_delivery.strftime('%Y-%m-%d'),
                    "orderId": f"MED-{datetime.now().strftime('%Y%m%d')}-{cursor.lastrowid}"
                })
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "reordersCreated": reorders_created,
            "message": f"Created {len(reorders_created)} reorder(s) for {reorder.drugName}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inventory/summary")
async def get_inventory_summary():
    try:
        conn = sqlite3.connect("medchain.db")
        cursor = conn.cursor()
        
        # Get total stats
        cursor.execute("SELECT COUNT(*), SUM(quantity) FROM inventory")
        total_drugs, total_quantity = cursor.fetchone()
        
        # Get low stock count
        cursor.execute("SELECT COUNT(*) FROM inventory WHERE quantity < 50")
        low_stock_count = cursor.fetchone()[0]
        
        # Get expiring soon count
        thirty_days = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        cursor.execute("SELECT COUNT(*) FROM inventory WHERE expiry_date <= ?", (thirty_days,))
        expiring_count = cursor.fetchone()[0]
        
        # Get location breakdown
        cursor.execute("""
            SELECT location, COUNT(*), SUM(quantity)
            FROM inventory
            GROUP BY location
        """)
        location_stats = cursor.fetchall()
        
        # Get top drugs by quantity
        cursor.execute("""
            SELECT drug_name, SUM(quantity) as total_qty
            FROM inventory
            GROUP BY drug_name
            ORDER BY total_qty DESC
            LIMIT 5
        """)
        top_drugs = cursor.fetchall()
        
        conn.close()
        
        return {
            "totalDrugs": total_drugs,
            "totalQuantity": total_quantity,
            "lowStockCount": low_stock_count,
            "expiringCount": expiring_count,
            "locations": [
                {
                    "name": row[0],
                    "drugTypes": row[1],
                    "totalQuantity": row[2]
                }
                for row in location_stats
            ],
            "topDrugs": [
                {
                    "name": row[0],
                    "quantity": row[1]
                }
                for row in top_drugs
            ],
            "generatedAt": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict-demand")
async def predict_demand(location: Optional[str] = None, drug: Optional[str] = None, days: int = 30):
    try:
        # Use Gemini AI if available
        if model:
            prompt = f"""
            As a healthcare supply chain AI expert, predict demand for the next {days} days.
            Location: {location or 'All locations'}
            Drug: {drug or 'All drugs'}
            
            Provide predictions in this JSON format:
            {{
                "predictions": [
                    {{"drug": "Drug Name", "predicted_demand": 1500, "confidence": 0.92, "trend": "increasing"}},
                    ...
                ]
            }}
            
            Consider seasonal patterns, historical usage, and current health trends.
            """
            
            try:
                response = model.generate_content(prompt)
                # Try to parse JSON from response
                import re
                json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                if json_match:
                    ai_data = json.loads(json_match.group())
                    return {
                        **ai_data,
                        "generated_at": datetime.now().isoformat(),
                        "source": "gemini_ai"
                    }
            except Exception as ai_error:
                print(f"Gemini AI error: {ai_error}")
        
        # Fallback to mock predictions
        mock_predictions = [
            {"drug": "Paracetamol 500mg", "predicted_demand": 2400, "confidence": 0.92, "trend": "increasing"},
            {"drug": "Amoxicillin 250mg", "predicted_demand": 1800, "confidence": 0.87, "trend": "stable"},
            {"drug": "Aspirin 325mg", "predicted_demand": 900, "confidence": 0.95, "trend": "decreasing"},
            {"drug": "Metformin 500mg", "predicted_demand": 1200, "confidence": 0.89, "trend": "increasing"},
            {"drug": "Ibuprofen 400mg", "predicted_demand": 600, "confidence": 0.84, "trend": "stable"}
        ]
        
        # Filter by drug if specified
        if drug:
            mock_predictions = [p for p in mock_predictions if drug.lower() in p["drug"].lower()]
        
        return {
            "predictions": mock_predictions,
            "generated_at": datetime.now().isoformat(),
            "source": "mock_data"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/chat")
async def ai_chat(chat: ChatMessage):
    try:
        user_message = chat.message
        language = chat.language
        
        if model:
            # Use Gemini AI
            healthcare_prompt = f"""
            You are an intelligent healthcare supply chain AI assistant for MedChain platform.
            User question: {user_message}
            Response language: {language}
            
            You have access to real-time inventory data and can provide insights about:
            - Drug inventory management
            - Expiry date monitoring
            - Low stock alerts and reorder automation
            - Supply chain optimization
            - Demand forecasting
            - Drug authentication and safety
            - Healthcare logistics
            - Batch verification
            - Multi-location inventory tracking
            
            Provide helpful, accurate, and actionable information. Use emojis and formatting to make responses clear and engaging.
            Keep responses professional and focused on healthcare supply chain management.
            
            If the user asks in a language other than English, respond in that same language.
            """
            
            response = model.generate_content(healthcare_prompt)
            return {
                "response": response.text,
                "language": language,
                "timestamp": datetime.now().isoformat(),
                "source": "gemini_ai"
            }
        else:
            # Mock response
            return {
                "response": "I'm your intelligent MedChain AI assistant. I can help with inventory management, expiry monitoring, demand forecasting, and supply chain optimization. However, the AI service is currently unavailable. Please check your API configuration.",
                "language": language,
                "timestamp": datetime.now().isoformat(),
                "source": "mock_response"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/batch-verify")
async def verify_batch_ai(batch: BatchVerification):
    try:
        conn = sqlite3.connect("medchain.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT drug_name, quantity, location, expiry_date, manufacturer
            FROM inventory
            WHERE batch_id = ?
        """, (batch.batchId,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            drug_name, quantity, location, expiry_date, manufacturer = result
            is_expired = datetime.strptime(expiry_date, '%Y-%m-%d') < datetime.now() if expiry_date else False
            
            return {
                "verified": True,
                "batchId": batch.batchId,
                "drugName": drug_name,
                "manufacturer": manufacturer,
                "location": location,
                "quantity": quantity,
                "expiryDate": expiry_date,
                "isExpired": is_expired,
                "status": "expired" if is_expired else "verified",
                "message": f"Batch {batch.batchId} verified successfully" if not is_expired else f"WARNING: Batch {batch.batchId} has expired",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "verified": False,
                "batchId": batch.batchId,
                "message": f"Batch {batch.batchId} not found in database",
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)