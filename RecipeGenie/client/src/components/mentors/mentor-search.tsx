import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, X, Filter } from "lucide-react";

interface MentorSearchProps {
  filters: {
    industries: string[];
    skills: string[];
    languages: string[];
    ratingMin?: number;
  };
  onFiltersChange: (filters: any) => void;
}

const INDUSTRIES = [
  'TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'MARKETING', 'SALES', 
  'EDUCATION', 'CONSULTING', 'LEGAL', 'ENGINEERING', 'DESIGN', 'OTHER'
];

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Data Analysis',
  'Project Management', 'Leadership', 'Marketing', 'Sales', 'Design',
  'Product Management', 'Machine Learning', 'AWS', 'DevOps'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Mandarin', 'Portuguese',
  'Arabic', 'Hindi', 'Japanese', 'Korean', 'Italian', 'Dutch'
];

export function MentorSearch({ filters, onFiltersChange }: MentorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const addFilter = (type: keyof typeof filters, value: string) => {
    if (type === 'ratingMin') return;
    
    const currentValues = filters[type] as string[];
    if (!currentValues.includes(value)) {
      onFiltersChange({
        ...filters,
        [type]: [...currentValues, value]
      });
    }
  };

  const removeFilter = (type: keyof typeof filters, value: string) => {
    if (type === 'ratingMin') return;
    
    const currentValues = filters[type] as string[];
    onFiltersChange({
      ...filters,
      [type]: currentValues.filter(item => item !== value)
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      industries: [],
      skills: [],
      languages: [],
      ratingMin: undefined,
    });
    setSearchTerm('');
  };

  const hasActiveFilters = 
    filters.industries.length > 0 || 
    filters.skills.length > 0 || 
    filters.languages.length > 0 || 
    filters.ratingMin !== undefined ||
    searchTerm.length > 0;

  return (
    <Card data-testid="card-mentor-search">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Search & Filter Mentors
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, skills, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Filters:</span>
              <Button variant="ghost" size="sm" onClick={clearAllFilters} data-testid="button-clear-all">
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.industries.map(industry => (
                <Badge key={industry} variant="default" className="flex items-center gap-1">
                  {industry}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('industries', industry)}
                  />
                </Badge>
              ))}
              {filters.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('skills', skill)}
                  />
                </Badge>
              ))}
              {filters.languages.map(language => (
                <Badge key={language} variant="outline" className="flex items-center gap-1">
                  {language}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('languages', language)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Industry Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Select onValueChange={(value) => addFilter('industries', value)}>
                  <SelectTrigger data-testid="select-industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry.charAt(0) + industry.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <Select onValueChange={(value) => addFilter('skills', value)}>
                  <SelectTrigger data-testid="select-skills">
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_SKILLS.map(skill => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select onValueChange={(value) => addFilter('languages', value)}>
                  <SelectTrigger data-testid="select-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(language => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select onValueChange={(value) => onFiltersChange({ ...filters, ratingMin: parseFloat(value) })}>
                  <SelectTrigger data-testid="select-rating">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    <SelectItem value="3.0">3.0+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
