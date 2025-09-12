import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export default function ReportHeader({ data, selectedDates }) {
  if (!data) return null

  const { summary } = data
  const { startDate, endDate, prevStartDate, prevEndDate } = selectedDates || {}

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Current Period */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Deletions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalDeletions}</div>
          <p className="text-xs text-muted-foreground">
            {startDate ? format(startDate, 'MMM d') : 'N/A'} - {endDate ? format(endDate, 'MMM d, yyyy') : 'N/A'}
          </p>
        </CardContent>
      </Card>

      {/* Previous Period */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Previous Deletions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.previousPeriodTotal || 0}</div>
          <p className="text-xs text-muted-foreground">
            {prevStartDate ? format(prevStartDate, 'MMM d') : 'N/A'} - {prevEndDate ? format(prevEndDate, 'MMM d, yyyy') : 'N/A'}
          </p>
        </CardContent>
      </Card>

      {/* Number of Days */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Period Length</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {startDate && endDate ? Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1 : 0} days
          </div>
          <p className="text-xs text-muted-foreground">
            report duration
          </p>
        </CardContent>
      </Card>

      {/* Unique Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.uniqueDocuments}</div>
          <p className="text-xs text-muted-foreground">
            document types affected
          </p>
        </CardContent>
      </Card>

      {/* Unique Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.uniqueUsers}</div>
          <p className="text-xs text-muted-foreground">
            users made deletions
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
