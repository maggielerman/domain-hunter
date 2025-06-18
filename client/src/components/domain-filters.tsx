import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import type { DomainFilters } from "@shared/schema";

interface DomainFiltersProps {
  filters: DomainFilters;
  onFiltersChange: (filters: DomainFilters) => void;
}

const EXTENSIONS = [
  { ext: '.com', price: '$12.99' },
  { ext: '.net', price: '$14.99' },
  { ext: '.org', price: '$13.99' },
  { ext: '.io', price: '$39.99' },
  { ext: '.co', price: '$29.99' },
  { ext: '.tech', price: '$49.99' },
  { ext: '.app', price: '$19.99' },
  { ext: '.dev', price: '$17.99' },
  { ext: '.ai', price: '$89.99' },
  { ext: '.xyz', price: '$2.99' },
  { ext: '.me', price: '$19.99' },
  { ext: '.info', price: '$19.99' },
];

export default function DomainFilters({ filters, onFiltersChange }: DomainFiltersProps) {
  const handleExtensionChange = (extension: string, checked: boolean) => {
    const currentExtensions = filters.extensions || [];
    const newExtensions = checked
      ? [...currentExtensions, extension]
      : currentExtensions.filter(ext => ext !== extension);
    
    onFiltersChange({ ...filters, extensions: newExtensions });
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFiltersChange({ ...filters, [field]: numValue });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      extensions: ['.com'],
      availableOnly: true,
      sortBy: 'relevance'
    });
  };

  return (
    <aside className="w-full lg:w-80 lg:flex-shrink-0">
      <Card className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)]">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-brand-500" />
            Filter Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-12rem)] lg:pr-2">
          <div className="space-y-6">
          {/* Domain Extensions */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Domain Extensions</h4>
            <div className="space-y-2">
              {EXTENSIONS.map(({ ext, price }) => (
                <div key={ext} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={ext}
                      checked={filters.extensions?.includes(ext) || false}
                      onCheckedChange={(checked) => handleExtensionChange(ext, checked as boolean)}
                    />
                    <label htmlFor={ext} className="text-sm cursor-pointer">
                      {ext}
                    </label>
                  </div>
                  <span className="text-xs text-slate-500">{price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Price Range</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                  className="text-sm"
                />
                <span className="text-slate-500">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span>$0</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full">
                  <div className="h-2 bg-brand-500 rounded-full w-1/3"></div>
                </div>
                <span>$100+</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Availability</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available-only"
                checked={filters.availableOnly || false}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, availableOnly: checked as boolean })
                }
              />
              <label htmlFor="available-only" className="text-sm cursor-pointer">
                Available domains only
              </label>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Sort By</h4>
            <Select
              value={filters.sortBy || 'relevance'}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, sortBy: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="length">Length: Short to Long</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full text-brand-500 border-brand-500 hover:bg-brand-50"
            >
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
