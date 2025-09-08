import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
    try {

        // Create Supabase client with service key (server-side only)
    const supabase = createClient(
        process.env.SUPABASE_TEST_URL,
        process.env.SUPABASE_TEST_SERVICE_KEY
      )
        console.log('supabase-reports')
        // set up required date filtering
        const { searchParams } = new URL(request.url)
        const startDateParam = searchParams.get('startDate')
        const days = parseInt(searchParams.get('days')) || 7
        
        // Validate days parameter
        if (days < 1 || days > 30) {
            return Response.json({ error: 'Days parameter must be between 1 and 30' }, { status: 400 })
        }

        // Calculate date ranges
        const startDate = startDateParam ? new Date(startDateParam) : new Date()
        if (!startDateParam) {
            startDate.setDate(startDate.getDate() - 7) // Default to 7 days ago if no start date provided
        }
        
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + days - 1)

        //Previous period for trend comparison
        const prevStartDate = new Date(startDate)
        prevStartDate.setDate(prevStartDate.getDate() - days)

        //Format for supabase
        const formatDate = (date) => date.toISOString().split('T')[0]
        console.log('Query period:', formatDate(startDate), 'to', formatDate(endDate))

        //Get current period logs - filter by title and log_data
        const { data: currentData, error: currentError } = await supabase
            .from('bascule_logs')
            .select('*')
            .eq('title', 'Document Debug Log')
            .eq('log_data', 'Document Deletion From Pack')
            .gte('created_at', formatDate(startDate))
            .lte('created_at', formatDate(endDate))
            .order('created_at', { ascending: false })

        if (currentError) {
            console.error('Current period query error:', currentError)
            return Response.json({ error: currentError.message }, { status: 500 })
        }

        // Debug: Log the first record to see the structure
        if (currentData && currentData.length > 0) {
            console.log('First record structure:', {
                id: currentData[0].id,
                log_json_type: typeof currentData[0].log_json,
                log_json_value: currentData[0].log_json,
                log_json_keys: currentData[0].log_json ? Object.keys(currentData[0].log_json) : 'N/A'
            })
        }

        //Get previous period logs for trend comparison
        const { data: prevData, error: prevError } = await supabase
            .from('bascule_logs')
            .select('*')
            .eq('title', 'Document Debug Log')
            .eq('log_data', 'Document Deletion From Pack')
            .gte('created_at', formatDate(prevStartDate))
            .lt('created_at', formatDate(startDate))
            .order('created_at', { ascending: false })

        if (prevError) {
            console.error('Previous period query error:', prevError)
            return Response.json({ error: prevError.message }, { status: 500 })
        }

        // Helper function to safely parse JSON and extract document code
        const extractDocumentCode = (logJson) => {
            try {
                // Handle both string and parsed JSON cases
                const parsed = typeof logJson === 'string' ? JSON.parse(logJson) : logJson
                return parsed['document code'] || 'Unknown Document'
            } catch (error) {
                console.warn('Failed to parse log_json:', logJson, error)
                return 'Unknown Document'
            }
        }

        // Helper function to safely extract user from JSON
        const extractUser = (logJson) => {
            try {
                // Handle both string and parsed JSON cases
                const parsed = typeof logJson === 'string' ? JSON.parse(logJson) : logJson
                return parsed.user || 'Unknown User'
            } catch (error) {
                console.warn('Failed to parse log_json for user:', logJson, error)
                return 'Unknown User'
            }
        }

        // Group by document code and count actions for current period
        const groupByDocCode = (data) => {
            const grouped = {}
            data.forEach(log => {
                const docCode = extractDocumentCode(log.log_json)
                if (!grouped[docCode]) {
                    grouped[docCode] = {
                        count: 0,
                        users: new Set(),
                        records: []
                    }
                }
                grouped[docCode].count++
                grouped[docCode].users.add(extractUser(log.log_json))
                grouped[docCode].records.push({
                    id: log.id,
                    created_at: log.created_at,
                    user: extractUser(log.log_json),
                    database_name: log.database_name,
                    database_environment: log.database_environment
                })
            })
            
            // Convert Sets to arrays for JSON serialization
            Object.keys(grouped).forEach(docCode => {
                grouped[docCode].users = Array.from(grouped[docCode].users)
            })
            
            return grouped
        }

        const currentGrouped = groupByDocCode(currentData || [])
        const prevGrouped = groupByDocCode(prevData || [])

        // Calculate trends and sort by action count
        const report = Object.keys(currentGrouped).map(docCode => {
            const currentCount = currentGrouped[docCode].count
            const prevCount = prevGrouped[docCode]?.count || 0
            const trend = currentCount - prevCount
            
            return {
                documentCode: docCode,
                currentPeriodCount: currentCount,
                previousPeriodCount: prevCount,
                trend: trend,
                trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
                trendColor: trend > 0 ? 'red' : 'green', // red = more deletions (bad), green = fewer (good)
                uniqueUsers: currentGrouped[docCode].users.length,
                records: currentGrouped[docCode].records
            }
        }).sort((a, b) => b.currentPeriodCount - a.currentPeriodCount)

        return Response.json({
            success: true,
            period: {
                current: { 
                    start: formatDate(startDate), 
                    end: formatDate(endDate),
                    days: days
                },
                previous: { 
                    start: formatDate(prevStartDate), 
                    end: formatDate(startDate),
                    days: days
                }
            },
            summary: {
                totalDeletions: currentData?.length || 0,
                previousPeriodTotal: prevData?.length || 0,
                uniqueDocuments: report.length,
                uniqueUsers: new Set(currentData?.map(log => extractUser(log.log_json)) || []).size
            },
            report: report
        })

    } catch (error) {
        console.error('Unexpected error:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}