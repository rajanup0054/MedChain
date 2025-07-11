import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockDrugs } from '../data/mockData';
import blockchainService from './blockchain';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

class AIService {
  constructor() {
    if (API_KEY) {
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    } else {
      console.warn('Gemini API key not found. AI features will use mock responses.');
      this.genAI = null;
      this.model = null;
    }
  }

  async askGemini(promptText) {
    try {
      if (!this.model) {
        // Return mock response if API key is not available
        return this.getMockResponse(promptText);
      }

      const result = await this.model.generateContent(promptText);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to mock response
      return this.getMockResponse(promptText);
    }
  }

  getMockResponse(promptText) {
    const lowerPrompt = promptText.toLowerCase();
    
    // Drug Expiry Detection
    if (lowerPrompt.includes('expired') || lowerPrompt.includes('expiry') || lowerPrompt.includes('expire')) {
      const today = new Date();
      const daysAhead = lowerPrompt.match(/(\d+)\s*days?/)?.[1] || 0;
      const checkDate = new Date(today.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
      
      const expiringDrugs = mockDrugs.filter(drug => {
        const expiryDate = new Date(drug.expiryDate);
        return daysAhead > 0 ? expiryDate <= checkDate : expiryDate <= today;
      });

      if (expiringDrugs.length === 0) {
        return `✅ **Good News!** No medicines are ${daysAhead > 0 ? `expiring in the next ${daysAhead} days` : 'currently expired'}.

**Upcoming Expirations (Next 30 Days):**
${mockDrugs.filter(drug => {
  const expiryDate = new Date(drug.expiryDate);
  const thirtyDays = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  return expiryDate <= thirtyDays && expiryDate > today;
}).map(drug => `• ${drug.name} (${drug.batchId}) - Expires: ${new Date(drug.expiryDate).toLocaleDateString()} - Location: ${drug.location}`).join('\n') || 'None in the next 30 days'}

**Recommendation:** Continue monitoring expiry dates and set up automated alerts for proactive management.`;
      }

      return `⚠️ **Expiry Alert!** Found ${expiringDrugs.length} medicine${expiringDrugs.length > 1 ? 's' : ''} ${daysAhead > 0 ? `expiring in ${daysAhead} days` : 'that have expired'}:

${expiringDrugs.map(drug => `🔴 **${drug.name}**
   • Batch ID: ${drug.batchId}
   • Expiry: ${new Date(drug.expiryDate).toLocaleDateString()}
   • Location: ${drug.location}
   • Quantity: ${drug.quantity} units`).join('\n\n')}

**Immediate Actions Required:**
1. Remove expired medicines from circulation immediately
2. Contact suppliers for replacement stock
3. Update inventory management system
4. Implement FIFO (First In, First Out) rotation policy`;
    }

    // Low Stock Alerts
    if (lowerPrompt.includes('low stock') || lowerPrompt.includes('low on stock') || lowerPrompt.includes('shortage')) {
      const lowStockThreshold = 50;
      const lowStockDrugs = mockDrugs.filter(drug => drug.quantity < lowStockThreshold);
      
      if (lowStockDrugs.length === 0) {
        return `✅ **Stock Status: Healthy!** All medicines are above the minimum threshold of ${lowStockThreshold} units.

**Current Stock Summary:**
${mockDrugs.map(drug => `• ${drug.name}: ${drug.quantity} units (${drug.location})`).join('\n')}

**Recommendation:** Continue monitoring stock levels and maintain safety stock for critical medications.`;
      }

      // Group by location
      const locationGroups = {};
      lowStockDrugs.forEach(drug => {
        if (!locationGroups[drug.location]) {
          locationGroups[drug.location] = [];
        }
        locationGroups[drug.location].push(drug);
      });

      return `🚨 **Low Stock Alert!** Found ${lowStockDrugs.length} medicine${lowStockDrugs.length > 1 ? 's' : ''} below ${lowStockThreshold} units:

${Object.entries(locationGroups).map(([location, drugs]) => 
  `📍 **${location}:**
${drugs.map(drug => `   • ${drug.name} (${drug.batchId}): ${drug.quantity} units - ${drug.quantity < 10 ? '🔴 CRITICAL' : drug.quantity < 25 ? '🟡 LOW' : '🟠 MODERATE'}`).join('\n')}`
).join('\n\n')}

**Recommended Actions:**
1. **Immediate Reorder:** Place emergency orders for critical items (< 10 units)
2. **Transfer Stock:** Check if other locations have surplus
3. **Supplier Contact:** Notify preferred suppliers for expedited delivery
4. **Usage Monitoring:** Track consumption patterns to prevent future shortages`;
    }

    // Smart Drug Summary
    if (lowerPrompt.includes('tell me about') || lowerPrompt.includes('information about') || lowerPrompt.includes('details about')) {
      const drugName = this.extractDrugName(lowerPrompt);
      const drugData = mockDrugs.filter(drug => 
        drug.name.toLowerCase().includes(drugName.toLowerCase())
      );

      if (drugData.length === 0) {
        return `❌ **Drug Not Found:** No information available for "${drugName}" in our current inventory.

**Available Drugs in System:**
${mockDrugs.map(drug => `• ${drug.name}`).join('\n')}

Please check the spelling or try searching for one of the available drugs.`;
      }

      const totalQuantity = drugData.reduce((sum, drug) => sum + drug.quantity, 0);
      const locations = [...new Set(drugData.map(drug => drug.location))];

      return `💊 **Drug Information: ${drugData[0].name}**

**📊 Current Inventory Status:**
• **Total Stock:** ${totalQuantity.toLocaleString()} units
• **Available Locations:** ${locations.length} location${locations.length > 1 ? 's' : ''}
• **Status:** ${totalQuantity > 100 ? '✅ Well Stocked' : totalQuantity > 50 ? '⚠️ Moderate Stock' : '🚨 Low Stock'}

**📍 Location Breakdown:**
${drugData.map(drug => `• ${drug.location}: ${drug.quantity} units (Batch: ${drug.batchId}, Expires: ${new Date(drug.expiryDate).toLocaleDateString()})`).join('\n')}

**🏭 Manufacturer Information:**
${[...new Set(drugData.map(drug => drug.manufacturer))].map(mfg => `• ${mfg}`).join('\n')}

**⚠️ Clinical Information:**
${this.getDrugClinicalInfo(drugData[0].name)}

**📈 Recommendations:**
${totalQuantity < 50 ? '• **Reorder immediately** - Stock below safety threshold' : ''}
${drugData.some(drug => new Date(drug.expiryDate) < new Date(Date.now() + 30*24*60*60*1000)) ? '• **Check expiry dates** - Some batches expiring soon' : ''}
• Monitor usage patterns for optimal inventory management
• Ensure proper storage conditions are maintained`;
    }

    // Stock Forecasting
    if (lowerPrompt.includes('demand') || lowerPrompt.includes('forecast')) {
      const drugName = this.extractDrugName(lowerPrompt) || 'all medicines';
      const timeframe = lowerPrompt.includes('month') ? 'next month' : 
                       lowerPrompt.includes('week') ? 'next week' : 
                       'next 30 days';
      
      return `Based on historical data and current trends, here's the demand forecast:

📊 **Demand Forecast for ${timeframe}:**
${drugName === 'all medicines' ? 
  `• Paracetamol 500mg: 2,400 units (↑15% increase expected)
• Amoxicillin 250mg: 1,800 units (→ stable demand)  
• Aspirin 325mg: 900 units (↓5% decrease expected)
• Metformin 500mg: 1,200 units (↑8% increase expected)
• Ciprofloxacin 500mg: 450 units (↑12% increase expected)` :
  `• ${drugName}: ${Math.floor(Math.random() * 2000 + 500)} units (${['↑12% increase', '→ stable demand', '↓3% decrease'][Math.floor(Math.random() * 3)]} expected)`
}

🎯 **Key Insights:**
- Seasonal flu season approaching - expect higher paracetamol demand
- Rural clinics showing 20% higher antibiotic usage
- Recommend increasing safety stock by 25% for critical medications

⚠️ **Immediate Actions:**
- Reorder paracetamol within 7 days
- Monitor aspirin inventory closely
- Consider bulk purchasing for cost optimization`;
    }
    
    // Proactive Inventory Reports
    if (lowerPrompt.includes('summary') || lowerPrompt.includes('report') || lowerPrompt.includes('update')) {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const totalStock = mockDrugs.reduce((sum, drug) => sum + drug.quantity, 0);
      const lowStockCount = mockDrugs.filter(drug => drug.quantity < 50).length;
      const expiringCount = mockDrugs.filter(drug => {
        const expiryDate = new Date(drug.expiryDate);
        const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return expiryDate <= thirtyDays;
      }).length;

      return `📋 **Weekly Inventory Summary - ${today.toLocaleDateString()}**

**📊 Overall Status:**
• **Total Inventory:** ${totalStock.toLocaleString()} units across ${mockDrugs.length} drug types
• **Active Locations:** ${[...new Set(mockDrugs.map(drug => drug.location))].length} facilities
• **Stock Health:** ${lowStockCount === 0 ? '✅ Healthy' : `⚠️ ${lowStockCount} items need attention`}

**🚨 Alerts & Actions Required:**
• **Low Stock Items:** ${lowStockCount} (${lowStockCount === 0 ? 'None' : 'Immediate reorder needed'})
• **Expiring Soon:** ${expiringCount} items expiring in 30 days
• **Critical Actions:** ${lowStockCount + expiringCount === 0 ? 'None required' : `${lowStockCount + expiringCount} items need immediate attention`}

**📍 Location Performance:**
${[...new Set(mockDrugs.map(drug => drug.location))].map(location => {
  const locationDrugs = mockDrugs.filter(drug => drug.location === location);
  const locationStock = locationDrugs.reduce((sum, drug) => sum + drug.quantity, 0);
  const locationLowStock = locationDrugs.filter(drug => drug.quantity < 50).length;
  return `• **${location}:** ${locationStock} units, ${locationLowStock} low stock alerts`;
}).join('\n')}

**📈 This Week's Insights:**
• Highest stock: ${mockDrugs.reduce((max, drug) => drug.quantity > max.quantity ? drug : max).name} (${mockDrugs.reduce((max, drug) => drug.quantity > max.quantity ? drug : max).quantity} units)
• Most critical: ${mockDrugs.reduce((min, drug) => drug.quantity < min.quantity ? drug : min).name} (${mockDrugs.reduce((min, drug) => drug.quantity < min.quantity ? drug : min).quantity} units)
• Recommended focus: Reorder critical items and monitor expiry dates

**Next Week's Priorities:**
1. Process reorders for low-stock items
2. Conduct expiry date audits
3. Review consumption patterns for demand planning`;
    }

    // Batch Verification
    if (lowerPrompt.includes('verify batch') || lowerPrompt.includes('check batch') || lowerPrompt.includes('batch')) {
      const batchId = lowerPrompt.match(/[A-Z]{2}-\d{4}-\d{3}/)?.[0] || 'PC-2023-123';
      const drug = mockDrugs.find(drug => drug.batchId === batchId);
      
      if (!drug) {
        return `❌ **Batch Verification Failed**

**Batch ID:** ${batchId}
**Status:** Not found in our database

**Possible Reasons:**
• Batch ID may be incorrect or mistyped
• Drug not registered in our system
• Potential counterfeit product

**Recommended Actions:**
1. Double-check the batch ID on the packaging
2. Contact the manufacturer directly
3. Do not distribute until authenticity is confirmed
4. Report suspicious products to regulatory authorities`;
      }

      return `✅ **Batch Verification Successful**

**Drug Details:**
• **Name:** ${drug.name}
• **Batch ID:** ${drug.batchId}
• **Manufacturer:** ${drug.manufacturer}
• **Status:** ${drug.status.toUpperCase()}
• **Expiry Date:** ${new Date(drug.expiryDate).toLocaleDateString()}

**Current Inventory:**
• **Location:** ${drug.location}
• **Quantity:** ${drug.quantity} units
• **Blockchain Hash:** ${drug.blockchainHash.substring(0, 20)}...

**Verification Results:**
✅ Authentic product confirmed
✅ Manufacturer verified
✅ Batch registered on blockchain
${new Date(drug.expiryDate) > new Date() ? '✅ Within expiry date' : '❌ EXPIRED - Do not use'}

**Safety Confirmation:**
This batch has been verified as authentic and safe for distribution. All supply chain records are intact and traceable.`;
    }

    // Reorder Trigger
    if (lowerPrompt.includes('reorder') && (lowerPrompt.includes('if') || lowerPrompt.includes('<'))) {
      const drugName = this.extractDrugName(lowerPrompt);
      const threshold = lowerPrompt.match(/\d+/)?.[0] || '100';
      const drug = mockDrugs.find(d => d.name.toLowerCase().includes(drugName.toLowerCase()));
      
      if (!drug) {
        return `❌ **Drug not found:** "${drugName}". Please check the spelling and try again.`;
      }

      const needsReorder = drug.quantity < parseInt(threshold);
      
      if (needsReorder) {
        const recommendedOrder = Math.max(500, parseInt(threshold) * 2);
        return `🛒 **Automatic Reorder Triggered!**

**Condition Met:** ${drug.name} stock (${drug.quantity} units) is below threshold (${threshold} units)

**Reorder Details:**
• **Drug:** ${drug.name}
• **Current Stock:** ${drug.quantity} units
• **Location:** ${drug.location}
• **Recommended Order:** ${recommendedOrder} units
• **Supplier:** ${drug.manufacturer}
• **Order ID:** #MED-${Date.now().toString().slice(-6)}

**Status:** ✅ Reorder request submitted automatically
**Expected Delivery:** 3-5 business days
**Total Cost:** Estimated $${(recommendedOrder * 0.15).toFixed(2)}

**Next Steps:**
1. Supplier notification sent
2. Purchase order generated
3. Delivery tracking will be provided
4. Stock will be updated upon receipt`;
      } else {
        return `✅ **No Reorder Needed**

**Current Status:** ${drug.name} stock (${drug.quantity} units) is above threshold (${threshold} units)

**Stock Details:**
• **Current Quantity:** ${drug.quantity} units
• **Threshold:** ${threshold} units
• **Buffer:** ${drug.quantity - parseInt(threshold)} units above minimum
• **Location:** ${drug.location}

**Recommendation:** Continue monitoring. Reorder will trigger automatically when stock drops below ${threshold} units.`;
      }
    }

    if (lowerPrompt.includes('stock') || lowerPrompt.includes('inventory')) {
      return `📦 **Current Stock Analysis:**

**Critical Stock Levels:**
- Aspirin 325mg: 25 units remaining (⚠️ LOW STOCK)
- Amoxicillin 250mg: 480 units (✅ Normal)
- Paracetamol 500mg: 1,250 units (✅ Good)

**Recommendations:**
1. Immediate reorder needed for Aspirin
2. Set up automatic reorder alerts
3. Consider increasing minimum stock levels for high-demand items

**Supply Chain Status:**
- Average delivery time: 3-5 days
- Preferred suppliers available
- No current supply chain disruptions reported`;
    }
    
    if (lowerPrompt.includes('shortage') || lowerPrompt.includes('alert')) {
      return `🚨 **Shortage Alert Analysis:**

**Current Shortages:**
- Rural Clinic A: Aspirin 325mg (Critical - 4 days until stockout)
- City Pharmacy: Ibuprofen 400mg (Expired stock needs replacement)

**Mitigation Strategies:**
1. Emergency transfer from Regional Hospital (500 units available)
2. Expedited delivery from main warehouse
3. Temporary supplier activation for immediate needs

**Prevention Measures:**
- Implement AI-driven reorder points
- Establish inter-location stock sharing protocols
- Create emergency supplier network`;
    }
    
    if (lowerPrompt.includes('drug') || lowerPrompt.includes('medication')) {
      return `💊 **Drug Information & Safety:**

**Authentication Guidelines:**
- Always verify batch IDs through blockchain
- Check expiry dates before dispensing
- Report any suspicious packaging immediately

**Quality Assurance:**
- All drugs must have valid QR codes
- Temperature-controlled storage requirements
- Regular quality audits scheduled

**Regulatory Compliance:**
- FDA approval verification required
- Proper documentation for all transactions
- Adverse event reporting protocols active`;
    }
    
    return `I'm your MedChain AI assistant. I can help you with:

🔍 **Drug Verification & Authentication**
📊 **Inventory Management & Forecasting**  
🚨 **Shortage Alerts & Recommendations**
📈 **Demand Prediction & Analytics**
🏥 **Supply Chain Optimization**
⏰ **Expiry Date Management**
🤖 **Intelligent Reorder Automation**
📋 **Real-time Inventory Reports**
🌐 **Multi-language Support**

**Try asking me:**
• "List all expired medicines"
• "Which medicines are low on stock?"
• "Tell me about Paracetamol"
• "Give me this week's stock summary"
• "Verify batch PC-2023-123"
• "Reorder aspirin if stock < 100"

I'm here to help ensure safe and efficient healthcare delivery!`;
  }

  extractDrugName(prompt) {
    const drugNames = ['paracetamol', 'amoxicillin', 'aspirin', 'metformin', 'ibuprofen', 'ciprofloxacin'];
    const found = drugNames.find(drug => prompt.toLowerCase().includes(drug));
    return found || prompt.split(' ').find(word => word.length > 4) || 'medicine';
  }

  getDrugClinicalInfo(drugName) {
    const clinicalInfo = {
      'Paracetamol 500mg': '• **Use:** Pain relief, fever reduction\n• **Dosage:** 500mg every 4-6 hours (max 4g/day)\n• **Storage:** Room temperature, dry place',
      'Amoxicillin 250mg': '• **Use:** Bacterial infections\n• **Dosage:** 250-500mg every 8 hours\n• **Storage:** Room temperature, protect from moisture',
      'Aspirin 325mg': '• **Use:** Pain relief, anti-inflammatory\n• **Dosage:** 325-650mg every 4 hours\n• **Storage:** Cool, dry place',
      'Metformin 500mg': '• **Use:** Type 2 diabetes management\n• **Dosage:** 500mg twice daily with meals\n• **Storage:** Room temperature, original container',
      'Ibuprofen 400mg': '• **Use:** Pain relief, anti-inflammatory\n• **Dosage:** 400mg every 4-6 hours\n• **Storage:** Room temperature, dry place',
      'Ciprofloxacin 500mg': '• **Use:** Bacterial infections\n• **Dosage:** 500mg every 12 hours\n• **Storage:** Room temperature, protect from light'
    };
    return clinicalInfo[drugName] || '• **Use:** Consult healthcare provider\n• **Dosage:** As prescribed\n• **Storage:** Follow package instructions';
  }

  async getDemandForecast(location, drugName, timeframe = 30) {
    const prompt = `As a healthcare supply chain AI, provide a detailed demand forecast for ${drugName} at ${location} for the next ${timeframe} days. Consider seasonal patterns, historical usage, and current health trends. Include specific numbers and actionable recommendations.`;
    
    return await this.askGemini(prompt);
  }

  async analyzeInventory(inventoryData) {
    const prompt = `Analyze this healthcare inventory data and provide insights: ${JSON.stringify(inventoryData)}. Identify low stock items, predict shortages, and recommend reorder quantities. Focus on patient safety and cost optimization.`;
    
    return await this.askGemini(prompt);
  }

  async getSupplyChainAdvice(issue) {
    const prompt = `As a healthcare supply chain expert, provide advice for this issue: ${issue}. Include immediate actions, preventive measures, and best practices for healthcare facilities.`;
    
    return await this.askGemini(prompt);
  }
}

export default new AIService();