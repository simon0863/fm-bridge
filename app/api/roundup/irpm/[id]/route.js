import { NextResponse } from "next/server"
import { irpmService } from "@/lib/irpm-service"

/**
 * IRPM API Endpoint
 * Handles GET and PUT requests for IRPM data
 * 
 * GET /api/roundup/irpm/[id] - Get IRPM data for a record
 * PUT /api/roundup/irpm/[id] - Update IRPM data for a record
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        console.log('🔍 IRPM API GET request for record:', id);
        
        // Request validation
        if (!id || typeof id !== 'string' || id.trim() === '') {
            return NextResponse.json({ 
                success: false, 
                error: "Valid record ID is required" 
            }, { status: 400 });
        }

        const irpmData = await irpmService.getIRPMData(id);
        console.log('🔍 Response data:', irpmData);
        
        return NextResponse.json({ 
            success: true, 
            data: irpmData,
            recordId: id,
            message: "IRPM data retrieved successfully"
        });
        
    } catch (error) {
        console.error('❌ IRPM API GET error:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            recordId: id
        }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        console.log('🔍 IRPM API PUT request for record:', id);
        
        // Request validation
        if (!id || typeof id !== 'string' || id.trim() === '') {
            return NextResponse.json({ 
                success: false, 
                error: "Valid record ID is required" 
            }, { status: 400 });
        }

        const body = await request.json();
        console.log('🔍 Update data received:', body);
        
        if (!body || !body.data) {
            return NextResponse.json({ 
                success: false, 
                error: "IRPM data is required in request body" 
            }, { status: 400 });
        }

        // Get update type from request body, default to 'all'
        const updateType = body.updateType || 'all';
        console.log('🔍 Update type:', updateType);

        const result = await irpmService.updateIRPMData(id, body.data, updateType);
        
        return NextResponse.json({ 
            success: true, 
            data: result,
            recordId: id,
            message: "IRPM data updated successfully"
        });
        
    } catch (error) {
        console.error('❌ IRPM API PUT error:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            recordId: id
        }, { status: 500 });
    }
}
