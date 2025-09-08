'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import ReportHeader from '@/components/roundup/reporting/documentPackDeletion/ReportHeader'
import DocumentDeletionTable from '@/components/roundup/reporting/documentPackDeletion/DocumentDeletionTable'
import DrillDownDrawer from '@/components/roundup/reporting/documentPackDeletion/DrillDownDrawer'
import { cn } from '@/lib/utils'

export default function DocumentDeletionReport() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date
  })
  const [days, setDays] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)



  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        days: days.toString()
      })
      
      const response = await fetch(`/api/roundup/reporting/documentPackDeletion?${params}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data')
      }
      
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [startDate, days])

  const handleDrillDown = (document) => {
    setSelectedDocument(document)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedDocument(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Document Deletion Report</h1>
                      <p className="text-muted-foreground">
                Track document deletions from Roundup insurance document packs
              </p>
      </div>

      {/* Date Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Start Date Picker */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Days Dropdown */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Number of Days</label>
              <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="28">28 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={fetchData} disabled={loading} className="w-[120px]">
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Header with Summary */}
      {data && <ReportHeader data={data} />}

      {/* Main Data Table */}
      {data && (
        <DocumentDeletionTable 
          data={data.report} 
          onDrillDown={handleDrillDown}
          loading={loading}
        />
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive font-medium">Error loading data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button onClick={fetchData} className="mt-3">Try Again</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drill-down Drawer */}
      <DrillDownDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        document={selectedDocument}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}
