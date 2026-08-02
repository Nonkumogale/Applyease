import { useListDocuments, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { Plus, Search, FileText, File, FileCheck, FileX, Loader2, Download, Eye, Trash2, FileUp } from "lucide-react";
import { DocumentStatus } from "@workspace/api-client-react";

const currentUserId = 1;

// Mock data as fallback
const mockDocuments = [
  {
    id: "1",
    name: "CV_2026.pdf",
    type: "pdf",
    status: "verified",
    uploadedAt: "2026-08-01",
    size: "245 KB"
  },
  {
    id: "2",
    name: "Cover_Letter_Google.docx",
    type: "docx",
    status: "pending",
    uploadedAt: "2026-07-28",
    size: "189 KB"
  },
  {
    id: "3",
    name: "Academic_Transcript.pdf",
    type: "pdf",
    status: "verified",
    uploadedAt: "2026-07-20",
    size: "1.2 MB"
  },
  {
    id: "4",
    name: "ID_Document.pdf",
    type: "pdf",
    status: "rejected",
    uploadedAt: "2026-07-15",
    size: "892 KB"
  },
  {
    id: "5",
    name: "Motivation_Letter_Stanford.docx",
    type: "docx",
    status: "pending",
    uploadedAt: "2026-07-10",
    size: "156 KB"
  }
];

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const queryParams: any = { applicantId: currentUserId };
  if (filterStatus !== "all") queryParams.status = filterStatus;

  const { data: documents, isLoading, error } = useListDocuments(queryParams, {
    query: { enabled: true, queryKey: getListDocumentsQueryKey(queryParams) }
  });

  // Use mock data if API fails or returns nothing
  const displayDocuments = (documents && Array.isArray(documents) && documents.length > 0)
    ? documents
    : mockDocuments;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'verified': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'verified': return <FileCheck size={16} className="text-emerald-600" />;
      case 'pending': return <File size={16} className="text-amber-600" />;
      case 'rejected': return <FileX size={16} className="text-red-600" />;
      default: return <FileText size={16} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'docx': return <File size={20} className="text-blue-500" />;
      case 'jpg': return <File size={20} className="text-green-500" />;
      case 'png': return <File size={20} className="text-purple-500" />;
      default: return <File size={20} />;
    }
  };

  const formatLabel = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const filteredDocuments = displayDocuments?.filter((doc: any) => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    console.error('Error loading documents:', error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage all your application documents in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="rounded-full shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/documents/upload"><FileUp className="mr-2 h-4 w-4" /> Upload New</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-4 rounded-xl bg-white border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : error ? (
        <div className="text-center py-12 border-2 border-red-200 bg-red-50 rounded-2xl">
          <p className="text-red-600 font-medium">Error loading documents</p>
          <p className="text-red-500 text-sm mt-2">Using mock data instead. Please check if the API server is running.</p>
        </div>
      ) : filteredDocuments?.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-2xl bg-muted/10">
          <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-display font-bold text-xl mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-6">You haven't uploaded any documents yet.</p>
          <Button asChild className="rounded-full"><Link href="/documents/upload">Upload Your First Document</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments?.map((doc: any) => (
            <Card key={doc.id} className="overflow-hidden hover-elevate transition-all border-border/60 shadow-sm group">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getTypeIcon(doc.type)}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      <span>{formatLabel(doc.status)}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground truncate mb-1">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{doc.size}</p>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                    <Button variant="outline" size="sm" className="flex-1 rounded-full text-xs h-8">
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 rounded-full text-xs h-8">
                      <Download size={14} className="mr-1" /> Download
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full text-xs h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
