import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting inventory monitoring...')

    // Check for expired medicines
    const { data: expiredMedicines, error: expiredError } = await supabaseClient
      .from('medicines')
      .select('*')
      .lte('expiry_date', new Date().toISOString().split('T')[0])
      .eq('status', 'active')

    if (expiredError) {
      console.error('Error fetching expired medicines:', expiredError)
    } else if (expiredMedicines && expiredMedicines.length > 0) {
      console.log(`Found ${expiredMedicines.length} expired medicines`)
      
      // Update status to expired
      for (const medicine of expiredMedicines) {
        await supabaseClient
          .from('medicines')
          .update({ status: 'expired' })
          .eq('id', medicine.id)

        // Create alert
        await supabaseClient
          .from('alerts')
          .insert({
            type: 'expiry',
            medicine_id: medicine.id,
            message: `${medicine.name} (Batch: ${medicine.batch_id}) has expired`,
            severity: 'critical'
          })
      }
    }

    // Check for low stock medicines
    const { data: lowStockMedicines, error: lowStockError } = await supabaseClient
      .from('medicines')
      .select('*')
      .lt('quantity', 50)
      .neq('status', 'out_of_stock')

    if (lowStockError) {
      console.error('Error fetching low stock medicines:', lowStockError)
    } else if (lowStockMedicines && lowStockMedicines.length > 0) {
      console.log(`Found ${lowStockMedicines.length} low stock medicines`)
      
      for (const medicine of lowStockMedicines) {
        const newStatus = medicine.quantity === 0 ? 'out_of_stock' : 'low_stock'
        const severity = medicine.quantity === 0 ? 'critical' : 
                        medicine.quantity < 10 ? 'high' : 'medium'

        // Update status
        await supabaseClient
          .from('medicines')
          .update({ status: newStatus })
          .eq('id', medicine.id)

        // Check if alert already exists
        const { data: existingAlert } = await supabaseClient
          .from('alerts')
          .select('id')
          .eq('medicine_id', medicine.id)
          .eq('type', 'low_stock')
          .eq('is_resolved', false)
          .single()

        if (!existingAlert) {
          // Create new alert
          await supabaseClient
            .from('alerts')
            .insert({
              type: medicine.quantity === 0 ? 'out_of_stock' : 'low_stock',
              medicine_id: medicine.id,
              message: `${medicine.name} at ${medicine.location} is ${medicine.quantity === 0 ? 'out of stock' : 'running low'} (${medicine.quantity} units remaining)`,
              severity: severity
            })
        }
      }
    }

    // Check for medicines expiring in the next 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: expiringSoonMedicines, error: expiringSoonError } = await supabaseClient
      .from('medicines')
      .select('*')
      .gte('expiry_date', new Date().toISOString().split('T')[0])
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .eq('status', 'active')

    if (expiringSoonError) {
      console.error('Error fetching expiring soon medicines:', expiringSoonError)
    } else if (expiringSoonMedicines && expiringSoonMedicines.length > 0) {
      console.log(`Found ${expiringSoonMedicines.length} medicines expiring soon`)
      
      for (const medicine of expiringSoonMedicines) {
        const expiryDate = new Date(medicine.expiry_date)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        // Check if alert already exists
        const { data: existingAlert } = await supabaseClient
          .from('alerts')
          .select('id')
          .eq('medicine_id', medicine.id)
          .eq('type', 'expiry')
          .eq('is_resolved', false)
          .single()

        if (!existingAlert) {
          const severity = daysUntilExpiry <= 7 ? 'high' : 'medium'
          
          await supabaseClient
            .from('alerts')
            .insert({
              type: 'expiry',
              medicine_id: medicine.id,
              message: `${medicine.name} (Batch: ${medicine.batch_id}) will expire in ${daysUntilExpiry} days`,
              severity: severity
            })
        }
      }
    }

    // Auto-create reorders for critically low stock
    const { data: criticalStockMedicines, error: criticalError } = await supabaseClient
      .from('medicines')
      .select('*')
      .lt('quantity', 10)
      .eq('status', 'low_stock')

    if (criticalError) {
      console.error('Error fetching critical stock medicines:', criticalError)
    } else if (criticalStockMedicines && criticalStockMedicines.length > 0) {
      console.log(`Found ${criticalStockMedicines.length} medicines with critical stock`)
      
      for (const medicine of criticalStockMedicines) {
        // Check if reorder already exists
        const { data: existingReorder } = await supabaseClient
          .from('reorders')
          .select('id')
          .eq('medicine_id', medicine.id)
          .in('status', ['pending', 'ordered'])
          .single()

        if (!existingReorder) {
          const recommendedQuantity = Math.max(500, medicine.quantity * 10)
          const expectedDelivery = new Date()
          expectedDelivery.setDate(expectedDelivery.getDate() + 7)

          await supabaseClient
            .from('reorders')
            .insert({
              medicine_id: medicine.id,
              quantity: recommendedQuantity,
              status: 'pending',
              supplier: medicine.manufacturer,
              expected_delivery: expectedDelivery.toISOString().split('T')[0]
            })

          console.log(`Created auto-reorder for ${medicine.name}`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Inventory monitoring completed',
        timestamp: new Date().toISOString(),
        processed: {
          expired: expiredMedicines?.length || 0,
          lowStock: lowStockMedicines?.length || 0,
          expiringSoon: expiringSoonMedicines?.length || 0,
          criticalStock: criticalStockMedicines?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in inventory monitoring:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})