import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDepartments } from '@/hooks/useDepartments';
import { NoticeStatus } from '@/lib/types';

interface NoticeFiltersProps {
  onSearchChange: (search: string) => void;
  onDepartmentChange: (departmentId: string | null) => void;
  onStatusChange: (status: NoticeStatus | null) => void;
  onCategoryChange: (category: string | null) => void;
  onPriorityChange?: (priority: string | null) => void;
  onSortChange?: (sort: string) => void;
  showStatusFilter?: boolean;
}

const CATEGORIES = [
  'Academic',
  'Administrative',
  'Events',
  'Examinations',
  'Financial',
  'General',
  'Sports',
  'Library',
];

export function NoticeFilters({
  onSearchChange,
  onDepartmentChange,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onSortChange,
  showStatusFilter = false,
}: NoticeFiltersProps) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string | null>(null);
  const [status, setStatus] = useState<NoticeStatus | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: departments } = useDepartments();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleDepartmentChange = (value: string) => {
    const dept = value === 'all' ? null : value;
    setDepartment(dept);
    onDepartmentChange(dept);
  };

  const handleStatusChange = (value: string) => {
    const stat = value === 'all' ? null : (value as NoticeStatus);
    setStatus(stat);
    onStatusChange(stat);
  };

  const handleCategoryChange = (value: string) => {
    const cat = value === 'all' ? null : value;
    setCategory(cat);
    onCategoryChange(cat);
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment(null);
    setStatus(null);
    setCategory(null);
    setPriority(null);
    onSearchChange('');
    onDepartmentChange(null);
    onStatusChange(null);
    onCategoryChange(null);
    onPriorityChange?.(null);
  };

  const hasActiveFilters = search || department || status || category || priority;

  return (
    <div className="space-y-4">
      {/* Search and filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {[department, status, category].filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-muted/50">
          <Select value={department || 'all'} onValueChange={handleDepartmentChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showStatusFilter && (
            <Select value={status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={category || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select
            value={priority || 'all'}
            onValueChange={(value) => {
              const p = value === 'all' ? null : value;
              setPriority(p);
              onPriorityChange?.(p);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
