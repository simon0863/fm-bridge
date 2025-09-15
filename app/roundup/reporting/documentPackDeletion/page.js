'use client'

import { useState, useEffect, useCallback } from 'react'
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
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function DocumentDeletionReport() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date
  })
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 1) // Yesterday
    return date
  })
  const [prevStartDate, setPrevStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 14) // 2 weeks ago
    return date
  })
  const [prevEndDate, setPrevEndDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 8) // 1 week ago
    return date
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Calculate days between start and end date (inclusive)
  const calculateDays = (start, end) => {
    if (!start || !end) return 0
    const timeDiff = end.getTime() - start.getTime()
    return Math.floor(timeDiff / (1000 * 3600 * 24)) + 1
  }

  const days = calculateDays(startDate, endDate)
  const prevDays = calculateDays(prevStartDate, prevEndDate)



  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        prevStartDate: prevStartDate.toISOString().split('T')[0],
        prevEndDate: prevEndDate.toISOString().split('T')[0]
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
  }, [startDate, endDate, prevStartDate, prevEndDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDrillDown = (document) => {
    setSelectedDocument(document)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedDocument(null)
  }


  const handleStartDateChange = (date) => {
    if (date) setStartDate(date)
  }

  const handleEndDateChange = (date) => {
    if (date) setEndDate(date)
  }

  const handlePrevStartDateChange = (date) => {
    if (date) setPrevStartDate(date)
  }

  const handlePrevEndDateChange = (date) => {
    if (date) setPrevEndDate(date)
  }

  return (
    <ProtectedRoute>
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
          <CardTitle>Report Periods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Report Period and Previous Period Side by Side */}
          <div className="space-y-4">
            {/* Section Headers */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <h4 className="text-sm font-medium">Report Period</h4>
              <h4 className="text-sm font-medium">Previous Period (for comparison)</h4>
              <div className="flex-shrink-0 w-[120px]"></div> {/* Spacer for refresh button */}
            </div>

            {/* Input Fields Row */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between">
              {/* Report Period Fields */}
              <div className="flex-1">
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
                          onSelect={handleStartDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date Picker */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={handleEndDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Days Display */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">Period</label>
                    <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md text-sm">
                      {days} day{days !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Period Fields */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* Previous Start Date Picker */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">Previous Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !prevStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {prevStartDate ? format(prevStartDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={prevStartDate}
                          onSelect={handlePrevStartDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Previous End Date Picker */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">Previous End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !prevEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {prevEndDate ? format(prevEndDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={prevEndDate}
                          onSelect={handlePrevEndDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Previous Period Days Display */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium">Period</label>
                    <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md text-sm">
                      {prevDays} day{prevDays !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex-shrink-0">
                <Button onClick={fetchData} disabled={loading} className="w-[120px] h-10">
                  {loading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Header with Summary */}
      {data && <ReportHeader data={data} selectedDates={{ startDate, endDate, prevStartDate, prevEndDate }} onRefresh={fetchData} loading={loading} />}

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
    </ProtectedRoute>
  )
}
