import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, EyeIcon } from 'lucide-react'

export default function DocumentDeletionTable({ data, onDrillDown, loading }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No deletion data found for this period.</p>
      </div>
    )
  }

  const getTrendIcon = (trendDirection) => {
    switch (trendDirection) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trendColor) => {
    return trendColor === 'red' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Code</TableHead>
            <TableHead className="text-center">Current Period</TableHead>
            <TableHead className="text-center">Previous Period</TableHead>
            <TableHead className="text-center">Trend</TableHead>
            <TableHead className="text-center">Unique Users</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <div className="max-w-xs truncate" title={item.documentCode}>
                  {item.documentCode}
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <span className="font-semibold">{item.currentPeriodCount}</span>
              </TableCell>
              
              <TableCell className="text-center">
                <span className="text-muted-foreground">{item.previousPeriodCount}</span>
              </TableCell>
              
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  {getTrendIcon(item.trendDirection)}
                  <Badge variant="secondary" className={getTrendColor(item.trendColor)}>
                    {item.trend > 0 ? `+${item.trend}` : item.trend < 0 ? item.trend : '0'}
                  </Badge>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <span className="font-medium">{item.uniqueUsers}</span>
              </TableCell>
              
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDrillDown(item)}
                  className="flex items-center space-x-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Details</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
