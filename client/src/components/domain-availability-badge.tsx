import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface DomainAvailabilityBadgeProps {
  isAvailable: boolean;
  registrar?: string;
  className?: string;
}

export default function DomainAvailabilityBadge({ 
  isAvailable, 
  registrar, 
  className = "" 
}: DomainAvailabilityBadgeProps) {
  if (isAvailable) {
    return (
      <Badge className={`bg-green-100 text-green-800 hover:bg-green-100 ${className}`}>
        <CheckCircle className="mr-1 h-3 w-3" />
        Available
      </Badge>
    );
  }

  // Different badges based on why domain is unavailable
  if (registrar === 'DNS Active' || registrar === 'Active Website' || registrar === 'Active Website (HTTPS)') {
    return (
      <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${className}`}>
        <XCircle className="mr-1 h-3 w-3" />
        Active Site
      </Badge>
    );
  }

  if (registrar === 'Parked/Reserved') {
    return (
      <Badge className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-100 ${className}`}>
        <AlertTriangle className="mr-1 h-3 w-3" />
        Parked
      </Badge>
    );
  }

  return (
    <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${className}`}>
      <XCircle className="mr-1 h-3 w-3" />
      Registered
    </Badge>
  );
}