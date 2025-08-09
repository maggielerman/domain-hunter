import { useState } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ExternalLink, TrendingUp, Calendar, Link2, Star, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DomainAvailabilityBadge from "./domain-availability-badge";
import type { Domain } from "@shared/schema";

interface DomainsTableProps {
  domains: Domain[];
  isLoading?: boolean;
}

type SortField = 'name' | 'price' | 'length' | 'extension' | 'availability';
type SortDirection = 'asc' | 'desc';

export default function DomainsTable({ domains, isLoading }: DomainsTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState('');
  const [extensionFilter, setExtensionFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set());

  // Sort domains
  const sortedDomains = [...domains].sort((a, b) => {
    let compareA: any;
    let compareB: any;

    // Special handling for different sort fields
    switch (sortField) {
      case 'price':
        compareA = parseFloat(a.price);
        compareB = parseFloat(b.price);
        break;
      case 'length':
        compareA = a.name.length;
        compareB = b.name.length;
        break;
      case 'availability':
        compareA = a.isAvailable ? 1 : 0;
        compareB = b.isAvailable ? 1 : 0;
        break;
      case 'extension':
        compareA = a.extension.toLowerCase();
        compareB = b.extension.toLowerCase();
        break;
      default: // 'name'
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
    }

    if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter domains
  const filteredDomains = sortedDomains.filter(domain => {
    const matchesText = domain.name.toLowerCase().includes(filter.toLowerCase());
    const matchesExtension = extensionFilter === 'all' || domain.extension === extensionFilter;
    const matchesAvailability = availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && domain.isAvailable) ||
      (availabilityFilter === 'taken' && !domain.isAvailable);

    return matchesText && matchesExtension && matchesAvailability;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleExpanded = (domainId: number) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numPrice);
  };

  const getBestPrice = (domain: Domain) => {
    if (!domain.registrarPricing || Object.keys(domain.registrarPricing).length === 0) {
      return { price: parseFloat(domain.price), registrar: 'Multiple', affiliateLink: null };
    }

    const registrars = Object.entries(domain.registrarPricing);
    const cheapest = registrars.reduce((best, [name, info]: [string, any]) => {
      if (!best || info.price < best.price) {
        return { price: info.price, registrar: name, affiliateLink: info.affiliateLink };
      }
      return best;
    }, null as any);

    return cheapest || { price: parseFloat(domain.price), registrar: 'Multiple', affiliateLink: null };
  };

  const handlePurchase = (domain: Domain) => {
    const bestPrice = getBestPrice(domain);
    const affiliateLink = bestPrice.affiliateLink || (domain as any).affiliateLink;
    
    if (affiliateLink) {
      window.open(affiliateLink, '_blank');
    } else {
      window.open(`https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domain.name}`, '_blank');
    }
  };

  const toggleDomainExpansion = (domainId: number) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  // Get unique extensions for filter
  const uniqueExtensions = Array.from(new Set(domains.map(d => d.extension))).sort();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading domains...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Domain Results ({filteredDomains.length})</CardTitle>
          
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Filter domains..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-48"
            />
            
            <Select value={extensionFilter} onValueChange={setExtensionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Extension" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Extensions</SelectItem>
                {uniqueExtensions.map(ext => (
                  <SelectItem key={ext} value={ext}>{ext}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="taken">Taken</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-semibold"
                  >
                    Domain Name {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('price')}
                    className="h-auto p-0 font-semibold"
                  >
                    Best Price {getSortIcon('price')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('length')}
                    className="h-auto p-0 font-semibold"
                  >
                    Length {getSortIcon('length')}
                  </Button>
                </TableHead>
                <TableHead>Metrics</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDomains.map((domain) => {
                const bestPrice = getBestPrice(domain);
                
                return (
                  <React.Fragment key={domain.id}>
                    <TableRow className={domain.isPremium ? "bg-amber-50" : ""}>
                    <TableCell className="w-[40%]">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-medium text-sm truncate">{domain.name}</span>
                        {domain.isPremium && (
                          <Badge className="bg-amber-400 text-amber-900 text-xs px-1 py-0">
                            <Star className="mr-1 h-2 w-2" />
                            PREMIUM
                          </Badge>
                        )}
                      </div>
                      {expandedDomains.has(domain.id) && domain.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{String(domain.description)}</p>
                      )}
                    </TableCell>
                    
                    <TableCell className="w-[15%]">
                      <DomainAvailabilityBadge isAvailable={domain.isAvailable} />
                    </TableCell>
                    
                    <TableCell className="w-[10%] text-right font-medium text-sm">
                      ${domain.price}
                    </TableCell>
                    
                    <TableCell className="w-[10%] text-center">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {domain.name.length}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>SEO: 50/100</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>New domain</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          <span>No backlinks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>Brand: 75/100</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="w-[25%]">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            const affiliateLink = (domain as any).affiliateLink || 
                              (domain.registrarPricing && Object.values(domain.registrarPricing)[0] as any)?.affiliateLink;
                            
                            if (affiliateLink) {
                              window.open(affiliateLink, '_blank');
                            } else {
                              // Final fallback to GoDaddy search
                              window.open(`https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${domain.name}`, '_blank');
                            }
                          }}
                          className="flex-1 text-xs px-2 py-1 h-7 bg-brand-600 hover:bg-brand-700"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Buy Now
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleExpanded(domain.id)}
                          className="flex-1 text-xs px-2 py-1 h-7"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {expandedDomains.has(domain.id) ? 'Less' : 'More'}
                        </Button>
                      </div>
                    </TableCell>
                    </TableRow>
                    
                    {/* Expanded registrar pricing row */}
                    {expandedDomains.has(domain.id) && domain.registrarPricing && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <div className="bg-gray-50 p-4 border-t">
                          <h4 className="font-semibold text-sm mb-3">Available at {Object.keys(domain.registrarPricing as Record<string, any>).length} Registrars</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(domain.registrarPricing as Record<string, any>)
                              .sort(([,a], [,b]) => a.price - b.price)
                              .map(([registrarName, info], index) => (
                              <div 
                                key={registrarName}
                                className={`p-3 border rounded-lg bg-white ${
                                  index === 0 ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">{registrarName}</span>
                                  {index === 0 && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Best Price
                                    </span>
                                  )}
                                </div>
                                <div className="text-lg font-bold text-green-600 mb-2">
                                  {formatPrice(info.price.toString())}
                                </div>
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => {
                                    if (info.affiliateLink) {
                                      window.open(info.affiliateLink, '_blank');
                                    }
                                  }}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Buy at {registrarName}
                                </Button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            Prices shown are current as of last update and may vary. Click to see current pricing on registrar websites.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredDomains.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No domains match your filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}