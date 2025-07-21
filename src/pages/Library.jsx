import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../supabase/client";
import { Search, Calendar, MessageSquare } from "lucide-react";

export default function Library() {
  const { user } = useUser();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      setLoading(true);
      supabase
        .from("queries")
        .select("*")
        .eq("user_email", user.primaryEmailAddress.emailAddress)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setQueries(data || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching queries:", error);
          setLoading(false);
        });
    }
  }, [user]);

  const filteredQueries = queries.filter(query =>
    query.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ml-64 flex-1 bg-[#FBFBFA] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-light text-gray-800 mb-4">Your Library</h1>
          <p className="text-gray-600 mb-6">Browse your search history and past conversations</p>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search your conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-teal-500 border-t-transparent"></div>
              <span>Loading your conversations...</span>
            </div>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <div>
                <Search size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No results found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            ) : (
              <div>
                <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No conversations yet</h3>
                <p className="text-gray-500">Start a new conversation to see it here</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQueries.map((query, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">
                        {query.question}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{formatDate(query.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                <div className="pl-5 border-l-2 border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.5L3.5 6.5V17.5L12 21.5L20.5 17.5V6.5L12 2.5Z" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 13.5L3.5 9.5" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 13.5V21.5" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 13.5L20.5 9.5" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M16.75 4.5L7.25 9.5" stroke="#0D9488" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Answer</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                    {query.response.length > 300 
                      ? `${query.response.substring(0, 300)}...` 
                      : query.response
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredQueries.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredQueries.length} of {queries.length} conversations
          </div>
        )}
      </div>
    </div>
  );
}