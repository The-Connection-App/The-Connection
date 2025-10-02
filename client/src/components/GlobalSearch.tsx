import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Link } from "wouter";
import { 
  Search, 
  X, 
  Users, 
  MessageCircle, 
  BookOpen, 
  Calendar,
  HandHeart,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'community' | 'event' | 'verse' | 'prayer';
  title: string;
  content?: string;
  author?: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  community?: {
    id: string;
    name: string;
  };
  path: string;
  tags?: string[];
  createdAt?: string;
}

interface GlobalSearchProps {
  isVisible: boolean;
  onClose: () => void;
  placeholder?: string;
}

export default function GlobalSearch({ isVisible, onClose, placeholder = "Search communities, posts, people, and more..." }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when visible
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isVisible]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery.trim()) return [];
      
      // Simulate API call - replace with actual search endpoint
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'community',
          title: 'Daily Devotions',
          content: 'A community for sharing daily reflections and spiritual insights',
          path: '/communities/1',
          tags: ['devotions', 'prayer', 'study']
        },
        {
          id: '2',
          type: 'user',
          title: 'Sarah M.',
          author: {
            username: 'faithfulserv',
            displayName: 'Sarah M.',
          },
          path: '/profile/faithfulserv',
        },
        {
          id: '3',
          type: 'post',
          title: 'Finding Hope in Difficult Times',
          content: 'I wanted to share how reading Psalm 23 this morning reminded me that even in our darkest valleys...',
          author: {
            username: 'faithfulserv',
            displayName: 'Sarah M.',
          },
          community: { id: '1', name: 'Daily Devotions' },
          path: '/posts/3',
          tags: ['hope', 'psalms', 'encouragement'],
          createdAt: '2024-01-07T10:30:00Z'
        },
        {
          id: '4',
          type: 'verse',
          title: 'Jeremiah 29:11',
          content: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you..."',
          path: '/bible-study/jeremiah-29-11',
          tags: ['hope', 'future', 'gods-plan']
        },
        {
          id: '5',
          type: 'event',
          title: 'Youth Bible Study - This Friday 7PM',
          content: 'Join us this Friday for an engaging Bible study focused on the Beatitudes.',
          community: { id: '4', name: 'Youth Group' },
          path: '/events/5',
          tags: ['youth', 'bible-study', 'beatitudes']
        },
        {
          id: '6',
          type: 'prayer',
          title: 'Prayer Request: Family Healing',
          content: 'My father is going through a difficult health challenge...',
          author: {
            username: 'hopeinChrist',
            displayName: 'Michael T.',
          },
          community: { id: '2', name: 'Prayer Circle' },
          path: '/prayer-requests/6',
          tags: ['prayer-request', 'healing', 'family']
        }
      ];

      // Filter results based on query
      return mockResults.filter(result => 
        result.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        result.content?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        result.tags?.some(tag => tag.toLowerCase().includes(debouncedQuery.toLowerCase()))
      );
    },
    enabled: debouncedQuery.length > 0
  });

  const handleClose = () => {
    setQuery("");
    setDebouncedQuery("");
    onClose();
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-blue-600" />;
      case 'community': return <Users className="h-4 w-4 text-purple-600" />;
      case 'post': return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'verse': return <BookOpen className="h-4 w-4 text-orange-600" />;
      case 'event': return <Calendar className="h-4 w-4 text-indigo-600" />;
      case 'prayer': return <HandHeart className="h-4 w-4 text-rose-600" />;
      default: return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'user': return 'Person';
      case 'community': return 'Community';
      case 'post': return 'Post';
      case 'verse': return 'Verse';
      case 'event': return 'Event';
      case 'prayer': return 'Prayer';
      default: return 'Result';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-16">
      <div className="w-full max-w-2xl mx-4">
        <Card className="shadow-2xl">
          <CardContent className="p-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsTyping(e.target.value.length > 0);
                }}
                placeholder={placeholder}
                className="pl-10 pr-10 h-12 text-base"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading && debouncedQuery && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}

              {!isLoading && debouncedQuery && searchResults?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{debouncedQuery}"</p>
                  <p className="text-sm mt-1">Try different keywords or check spelling</p>
                </div>
              )}

              {!debouncedQuery && (
                <div className="py-8">
                  <div className="text-center text-muted-foreground mb-6">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start typing to search communities, posts, and people</p>
                  </div>
                  
                  {/* Quick Links */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Access</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/communities" onClick={handleClose}>
                        <Button variant="ghost" className="w-full justify-start h-auto p-3">
                          <Users className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium">Communities</div>
                            <div className="text-xs text-muted-foreground">Find groups</div>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/microblogs" onClick={handleClose}>
                        <Button variant="ghost" className="w-full justify-start h-auto p-3">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium">Feed</div>
                            <div className="text-xs text-muted-foreground">Latest posts</div>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/prayer-requests" onClick={handleClose}>
                        <Button variant="ghost" className="w-full justify-start h-auto p-3">
                          <HandHeart className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium">Prayers</div>
                            <div className="text-xs text-muted-foreground">Prayer requests</div>
                          </div>
                        </Button>
                      </Link>
                      <Link href="/events" onClick={handleClose}>
                        <Button variant="ghost" className="w-full justify-start h-auto p-3">
                          <Calendar className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium">Events</div>
                            <div className="text-xs text-muted-foreground">Upcoming events</div>
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <Link key={result.id} href={result.path} onClick={handleClose}>
                      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-shrink-0 mt-0.5">
                          {result.type === 'user' ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={result.author?.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                {getInitials(result.author?.displayName || result.author?.username || result.title)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            getTypeIcon(result.type)
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{result.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          
                          {result.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {result.content}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            {result.author && result.type !== 'user' && (
                              <>
                                <span>{result.author.displayName || result.author.username}</span>
                                <span>•</span>
                              </>
                            )}
                            {result.community && (
                              <>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>{result.community.name}</span>
                                </div>
                                <span>•</span>
                              </>
                            )}
                            {result.createdAt && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>2 days ago</span>
                              </div>
                            )}
                          </div>
                          
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {result.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{result.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}