import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

interface ViewToggleProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="h-8 w-8 p-0"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="h-8 w-8 p-0"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}