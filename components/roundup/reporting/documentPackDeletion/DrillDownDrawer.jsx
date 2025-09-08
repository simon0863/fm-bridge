import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { UserIcon, CalendarIcon } from 'lucide-react'

export default function DrillDownDrawer({ open, onOpenChange, document, onClose }) {
  if (!document) return null

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full md:max-w-[40%] lg:max-w-[40%] xl:max-w-[40%] overflow-y-auto"
        onCloseAutoFocus={onClose}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <span>Document Details</span>
            <Badge variant="outline">{document.documentCode}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{document.currentPeriodCount}</div>
              <div className="text-sm text-muted-foreground">Current Period</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{document.previousPeriodCount}</div>
              <div className="text-sm text-muted-foreground">Previous Period</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{document.uniqueUsers}</div>
              <div className="text-sm text-muted-foreground">Unique Users</div>
            </div>
          </div>

          {/* Trend Information */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Trend Analysis</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Previous Period:</span>
              <span className="font-medium">{document.previousPeriodCount} deletions</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-muted-foreground">Change:</span>
              <Badge 
                variant="secondary" 
                className={document.trendColor === 'red' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
              >
                {document.trend > 0 ? `+${document.trend}` : document.trend < 0 ? document.trend : '0'}
              </Badge>
            </div>
          </div>

          {/* User Deletion Records */}
          <div>
            <h3 className="font-semibold mb-3">Deletion Records</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {document.records.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{record.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(record.created_at)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
